import React from 'react';
import {
  stringify,
} from 'query-string';
import { createIntl, createIntlCache } from 'react-intl';

import {
  render,
  screen,
  waitFor,
  cleanup,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  SearchAndSort,
} from '@folio/stripes/smart-components';
import {
  CalloutContext,
  AppIcon,
  TitleManager,
  checkIfUserInCentralTenant,
} from '@folio/stripes/core';
import {
  TextLink,
  Checkbox,
  exportToCsv,
  NoValue,
  dayjs,
} from '@folio/stripes/components';
import {
  effectiveCallNumber,
  getHeaderWithCredentials,
} from '@folio/stripes/util';

import RequestsRoute, {
  buildHoldRecords,
  getListFormatter,
  getLastPrintedDetails,
  getFilteredColumnHeadersMap,
  urls,
  extractPickSlipRequestIds,
} from './RequestsRoute';
import CheckboxColumn from '../components/CheckboxColumn';
import {
  duplicateRequest,
  getTlrSettings,
  getFullName,
  getInstanceQueryString,
  getNextSelectedRowsState,
  isMultiDataTenant,
} from '../utils';
import {
  getFormattedYears,
  getStatusQuery,
} from './utils';
import {
  createModes,
  REQUEST_LEVEL_TYPES,
  DEFAULT_REQUEST_TYPE_VALUE,
  requestStatusesTranslations,
  requestStatuses,
  requestTypesTranslations,
  requestTypesMap,
  DEFAULT_DISPLAYED_YEARS_AMOUNT,
  OPEN_REQUESTS_STATUSES,
  MAX_RECORDS,
  REQUEST_OPERATIONS,
  INPUT_REQUEST_SEARCH_SELECTOR,
  ITEM_QUERIES,
  PRINT_DETAILS_COLUMNS,
} from '../constants';
import { historyData } from '../../test/jest/fixtures/historyData';

jest.mock('@folio/stripes/util', () => ({
  ...jest.requireActual('@folio/stripes/util'),
  effectiveCallNumber: jest.fn(),
  getHeaderWithCredentials: jest.fn(),
  convertToSlipData: jest.fn(() => ([{}])),
}));

const createRefMock = {
  current: {
    focus: jest.fn(),
  },
};
const createDocumentRefMock = {
  focus: jest.fn(),
};
const testIds = {
  searchAndSort: 'searchAndSort',
  pickSlipsPrintTemplate: 'pickSlipsPrintTemplate',
  searchSlipsPrintTemplate: 'searchSlipsPrintTemplate',
  singlePrintButton: 'singlePrintButton',
  rowCheckbox: 'rowCheckbox',
  selectRequestCheckbox: 'selectRequestCheckbox',
};
const intlCache = createIntlCache();
const intl = createIntl(
  {
    locale: 'en-US',
    messages: {},
  },
  intlCache
);

jest.spyOn(React, 'createRef').mockReturnValue(createRefMock);
jest.spyOn(document, 'getElementById').mockReturnValue(createDocumentRefMock);

jest.mock('query-string', () => ({
  ...jest.requireActual('query-string'),
  stringify: jest.fn(),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  duplicateRequest: jest.fn((request) => request),
  getTlrSettings: jest.fn(() => ({})),
  getFullName: jest.fn(),
  getFormattedYears: jest.fn(),
  getInstanceQueryString: jest.fn(),
  getNextSelectedRowsState: jest.fn(),
  extractPickSlipRequestIds: jest.fn(),
  isMultiDataTenant: jest.fn(),
  generateUserName: jest.fn(),
}));
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getFormattedYears: jest.fn(),
  getStatusQuery: jest.fn(),
}));
jest.mock('../components', () => ({
  ErrorModal: jest.fn(({ onClose }) => (
    <div>
      <span>ErrorModal</span>
      <button
        type="button"
        onClick={onClose}
      >Close
      </button>
    </div>
  )),
  LoadingButton: jest.fn(() => null),
  PrintButton: jest.fn(({
    onBeforeGetContent,
    onBeforePrint,
    onAfterPrint,
    children,
  }) => {
    const handleClick = () => {
      Promise.resolve(onBeforeGetContent());
      Promise.resolve(onBeforePrint());
      Promise.resolve(onAfterPrint());
    };
    return (
      <div>
        <button
          type="button"
          onClick={handleClick}
        >
          PrintButton
        </button>
        {children}
      </div>
    );
  }),
  PrintContent: jest.fn(({ printContentTestId }) => <div data-testid={printContentTestId}>PrintContent</div>)
}));
jest.mock('../components/RequestsFilters/RequestsFilters', () => ({ onClear }) => {
  return (
    <div>
      <span>RequestsFilter</span>
      <button
        type="button"
        onClick={onClear}
      >onClear
      </button>
    </div>
  );
});
jest.mock('../ViewRequest', () => jest.fn());
jest.mock('../RequestForm', () => jest.fn());
jest.mock('../components/SinglePrintButtonForPickSlip', () => jest.fn(({
  onBeforeGetContentForSinglePrintButton,
  onBeforePrintForSinglePrintButton,
  onAfterPrintForSinglePrintButton,
}) => {
  const handleClick = () => {
    onBeforeGetContentForSinglePrintButton();
    onBeforePrintForSinglePrintButton(['reqId']);
    onAfterPrintForSinglePrintButton();
  };
  return (
    <button
      type="button"
      data-testid={testIds.singlePrintButton}
      onClick={handleClick}
    >Print
    </button>
  );
}));
jest.mock('../components/CheckboxColumn/CheckboxColumn', () => jest.fn(({
  toggleRowSelection,
}) => (
  <input
    type="checkbox"
    onClick={toggleRowSelection}
    data-testid={testIds.rowCheckbox}
  />
)));

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({
    requests: [
      {
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
      }
    ],
  }),
}));

const RequestFilterData = {
  onChange: jest.fn(),
};
const request = {
  requesterId: 'requestId',
  instanceId: 'instanceId',
  itemId: 'itemId',
};
const labelIds = {
  closedCancelledRequest: requestStatusesTranslations[requestStatuses.CANCELLED],
  requestType: requestTypesTranslations[requestTypesMap.RECALL],
  printPickSlips: 'ui-requests.printPickSlipsForSp',
  printSearchSlips: 'ui-requests.printSearchSlipsForSp',
  titleWithSearch: 'ui-requests.documentTitle.search',
  defaultTitle: 'ui-requests.meta.title',
  recordsSelected: 'ui-requests.rows.recordsSelected',
};
const mockedRequest = {
  requestLevel: REQUEST_LEVEL_TYPES.ITEM,
  itemId: 'itemId',
  instanceId: 'instanceId',
  item: {
    barcode: 'itemBarcode',
    retrievalServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
    retrievalServicePointName: 'Circ Desk 1',
  },
  requester: {
    barcode: 'requesterBarcode',
  },
  id: 'requestId',
};
const userData = {
  requester: {
    personal: {},
  }
};
const createRequestButtonLabel = 'Create request';
const printDetailsMockData = {
  printCount: 11,
  printEventDate: '2024-08-03T13:33:31.868Z',
  lastPrintRequester: { firstName: 'firstName', middleName: 'middleName', lastName: 'lastName' },
};

SearchAndSort.mockImplementation(jest.fn(({
  paneTitleRef,
  actionMenu,
  detailProps: {
    onDuplicate,
    buildRecordsForHoldsShelfReport,
    onChangePatron,
    joinRequest,
  },
  getHelperResourcePath,
  massageNewRecord,
  onCloseNewRecord,
  onFilterChange,
  parentResources,
  renderFilters,
  customPaneSub,
  columnMapping,
  resultsFormatter,
  onCreate,
}) => {
  const onClickActions = () => {
    onDuplicate(parentResources.records.records[0]);
    buildRecordsForHoldsShelfReport();
    massageNewRecord({});
  };
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div>
      <span>{customPaneSub}</span>
      <div id={INPUT_REQUEST_SEARCH_SELECTOR} />
      <div
        aria-hidden="true"
        data-testid={testIds.searchAndSort}
        onKeyDown={onClickActions}
        onClick={onClickActions}
      />
      <p>getHelperResourcePath: {getHelperResourcePath('', 'testID1')}</p>
      <div>
        {renderFilters(RequestFilterData.onChange)}
      </div>
      <div>
        <button
          type="button"
          onClick={onChangePatron}
        >onChangePatron
        </button>
        <button
          type="button"
          onClick={onCloseNewRecord}
        >onCloseNewRecord
        </button>
        <button
          type="button"
          onClick={() => joinRequest(request)}
        >addRequestFields
        </button>
        <button
          type="button"
          onClick={onFilterChange({
            name: 'filter4',
            values: ['Value4', 'Value5']
          })}
        >onFilterChange
        </button>
        <button
          type="button"
          onClick={() => onCreate(userData)}
        >
          {createRequestButtonLabel}
        </button>
      </div>
      {actionMenu({ onToggle: jest.fn() })}
      <div paneTitleRef={paneTitleRef} />
      <div>
        {Object.keys(columnMapping).map(column => columnMapping[column])}
      </div>
      <div>
        {Object.keys(resultsFormatter).map(result => resultsFormatter[result](mockedRequest))}
      </div>
    </div>
  );
}));

describe('RequestsRoute', () => {
  const mockedUpdateFunc = jest.fn();
  const mockRecordValues = [
    {
      instance: {
        contributorNames: [
          {
            name: 'John Doe',
          },
          {
            name: 'Jane Smith',
          }
        ],
      },
      item: {
        retrievalServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
        retrievalServicePointName: 'Circ Desk 1',
      },
      tags: {
        tagList: ['tag1', 'tag2'],
      },
      requester: {
        firstName: 'Alice',
        lastName: 'Johnson',
      },
      proxy: {
        firstName: 'Bob',
        lastName: 'Williams',
      },
      deliveryAddress: {
        addressLine1: '123 Main St',
        city: 'Cityville',
        region: 'State',
        postalCode: '12345',
        countryId: 'US',
      },
      printDetails: printDetailsMockData,
    }
  ];
  const defaultProps = {
    history: historyData,
    location: historyData.location,
    match: {
      params: {
        noteId: 'viewNoteRouteID',
      },
      path: 'viewPath',
      url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules',
    },
    mutator: {
      circulationSettings: {
        GET: jest.fn(),
      },
      savePrintDetails: {
        POST: jest.fn(),
      },
      activeRecord: {
        update: jest.fn(),
      },
      currentServicePoint: {
        update: jest.fn(),
      },
      resultOffset: {
        replace: jest.fn(),
      },
      expiredHolds: {
        GET: jest.fn(() => ({
          requests: [
            {
              requester: {
                firstName: 'firstName',
                lastName: 'lastName',
                name: '',
              },
            }
          ],
        })),
        reset: jest.fn(),
      },
      patronBlocks: {
        DELETE: jest.fn(),
      },
      pickSlips: {
        GET: jest.fn(),
      },
      searchSlips: {
        GET: jest.fn(),
      },
      proxy: {
        reset: jest.fn(),
        GET: jest.fn(),
      },
      query: {
        update: mockedUpdateFunc,
      },
      staffSlips: {
        GET: jest.fn(),
      },
      records: {
        GET: jest.fn(),
        POST: jest.fn().mockResolvedValue(),
      },
      circulationRequests: {
        POST: jest.fn().mockResolvedValue(),
      },
      reportRecords: {
        GET: jest.fn().mockReturnValueOnce(mockRecordValues).mockRejectedValue(),
        reset: jest.fn(),
      },
      requestCount: {
        replace: jest.fn(),
      },
      resultCount: {
        replace: jest.fn(),
      },
    },
    stripes: {
      connect: jest.fn(),
      hasPerm: jest.fn().mockResolvedValue(true),
      locale: 'en',
      logger: {
        log: jest.fn(),
      },
      okapi: {
        url: 'url',
        tenant: 'tenant',
      },
      store: {
        getState: jest.fn(() => ({ okapi: { token: 'token' } })),
      },
      timezone: 'America/New_York',
      user: {
        user: {
          username: 'rick'
        }
      },
    },
    resources: {
      addressTypes: {
        hasLoaded: true,
      },
      configs: {
        hasLoaded: true,
        records: [
          {
            value: 'testConfig',
          }
        ],
      },
      printHoldRequests: {
        records: [{
          value: {
            printHoldRequestsEnabled: true,
          },
        }],
      },
      circulationSettings: {
        records: [{
          value: {
            enablePrintLog: 'true',
          }
        }]
      },
      currentServicePoint: {},
      patronBlocks: {
        records: [
          {
            expirationDate: '2023-09-11',
          }
        ]
      },
      pickSlips: {
        records: [
          {
            item: {
              title: 'test title'
            },
            request: {
              requestID: '393030bc-669e-4a41-81e9-3427c25a3b39',
            }
          }
        ],
      },
      searchSlips: {
        records: [
          {
            name: 'search slip',
          }
        ],
      },
      query: {
        filters: 'filter1.value1,filter1.value2,filter2.value3',
        instanceId: 'instanceId',
        query: 'testQueryTerm',
      },
      records: {
        hasLoaded: true,
        isPending: false,
        other: {
          totalRecords: 1,
        },
        records: [mockedRequest],
      },
      staffSlips: {
        records: [
          {
            name: 'staffSlipName',
          }
        ],
      },
    },
  };
  const defaultExpectedProps = {
    requestType: DEFAULT_REQUEST_TYPE_VALUE,
    fulfillmentPreference: 'Hold Shelf',
  };
  const sendCallout = jest.fn();

  dayjs.mockImplementation(() => ({
    format: jest.fn(),
    isSameOrBefore: jest.fn(),
    tz: () => ({
      toISOString: jest.fn(),
    }),
  }));

  const renderComponent = (props = defaultProps) => {
    const { rerender } = render(
      <CalloutContext.Provider value={{ sendCallout }}>
        <RequestsRoute {...props} />
      </CalloutContext.Provider>,
    );

    return rerender;
  };

  afterEach(() => {
    getTlrSettings.mockClear();
    jest.clearAllMocks();
    cleanup();
  });

  describe('RequestsRoute', () => {
    getTlrSettings.mockReturnValueOnce({ createTitleLevelRequestsByDefault: true });

    beforeEach(() => {
      renderComponent(defaultProps);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should execute "SearchAndSort" with "createTitleLevelRequest" equal true', () => {
      const expectedResult = {
        newRecordInitialValues: {
          ...defaultExpectedProps,
          createTitleLevelRequest: true,
        },
      };

      expect(SearchAndSort).toHaveBeenCalledWith(expect.objectContaining(expectedResult), {});
    });

    it('should execute "SearchAndSort" with "createTitleLevelRequest" equal false', () => {
      const expectedResult = {
        newRecordInitialValues: {
          ...defaultExpectedProps,
          createTitleLevelRequest: false,
        },
      };

      expect(SearchAndSort).toHaveBeenCalledWith(expect.objectContaining(expectedResult), {});
    });

    it('should render RequestsFilter', () => {
      const requestFilter = screen.getByText('RequestsFilter');

      expect(requestFilter).toBeInTheDocument();
    });

    it('should trigger "onChange" after clicking on clear button', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'onClear' }));

      expect(RequestFilterData.onChange).toBeCalled();
    });

    it('should render PrintContent for pick slips', () => {
      const printContent = screen.getByTestId(testIds.pickSlipsPrintTemplate);

      expect(printContent).toBeInTheDocument();
    });

    it('should render PrintContent for search slips', () => {
      const printContent = screen.getByTestId(testIds.searchSlipsPrintTemplate);

      expect(printContent).toBeInTheDocument();
    });

    it("should trigger 'exportToCsv'", async () => {
      await userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsCsv' }));

      await waitFor(() => {
        expect(exportToCsv).toHaveBeenCalled();
      });
    });

    it('should render "ErrorModal"', async () => {
      await userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));

      const errorModal = screen.queryByText('ErrorModal');

      expect(errorModal).toBeInTheDocument();
    });

    it('should hide "ErrorModal"', async () => {
      const errorModal = screen.queryByText('ErrorModal');

      await userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));
      await userEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(errorModal).not.toBeInTheDocument();
    });

    it('should trigger "mutator.query.update"', async () => {
      const expectFilterValue = { 'filters': 'filter1.value1,filter1.value2,filter2.value3,filter4.Value4,filter4.Value5' };

      await userEvent.click(screen.getByRole('button', { name: 'onFilterChange' }));

      expect(defaultProps.mutator.query.update).toHaveBeenCalledWith(expectFilterValue);
    });

    it('should trigger "mutator.activeRecord.update"', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'onChangePatron' }));

      expect(defaultProps.mutator.activeRecord.update).toBeCalled();
    });

    it('should trigger "fetch"', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'addRequestFields' }));

      expect(global.fetch).toBeCalled();
    });

    it('should trigger "history.push"', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'onCloseNewRecord' }));

      expect(defaultProps.history.push).toBeCalled();
    });

    it('should render print pick slips label', async () => {
      const printPickSlipsLabel = screen.getByText(labelIds.printPickSlips);

      await userEvent.click(screen.getAllByRole('button', { name: 'PrintButton' })[0]);

      expect(printPickSlipsLabel).toBeInTheDocument();
    });

    it('should render print search slips label', async () => {
      const printSearchSlipsLabel = screen.getByText(labelIds.printSearchSlips);

      await userEvent.click(screen.getAllByRole('button', { name: 'PrintButton' })[1]);

      expect(printSearchSlipsLabel).toBeInTheDocument();
    });
  });

  describe('When single data tenant', () => {
    const response = {
      id: 'responseId',
    };
    const props = {
      ...defaultProps,
      mutator: {
        ...defaultProps.mutator,
        circulationRequests: {
          POST: jest.fn().mockResolvedValue(response),
        },
      },
    };

    beforeEach(() => {
      isMultiDataTenant.mockReturnValue(false);
      renderComponent(props);
    });

    it('should handle request creation', () => {
      const createRequestButton = screen.getByText(createRequestButtonLabel);

      fireEvent.click(createRequestButton);

      expect(props.mutator.circulationRequests.POST).toHaveBeenCalledWith(userData);
    });

    it('should redirect to details page', async () => {
      const createRequestButton = screen.getByText(createRequestButtonLabel);

      fireEvent.click(createRequestButton);

      await waitFor(() => {
        expect(props.history.push).toHaveBeenCalledWith(`${props.match.path}/view/${response.id}`);
      });
    });

    it('should send callout', async () => {
      const createRequestButton = screen.getByText(createRequestButtonLabel);

      sendCallout.mockClear();
      fireEvent.click(createRequestButton);

      await waitFor(() => {
        expect(sendCallout).toHaveBeenCalled();
      });
    });
  });

  describe('When multi data tenant', () => {
    const requestHeaders = { test: 'test' };
    const fetchSpy = jest.fn();
    const response = {
      id: 'responseId',
    };
    const props = {
      ...defaultProps,
      mutator: {
        ...defaultProps.mutator,
        circulationRequests: {
          POST: jest.fn().mockResolvedValue(response),
        },
      },
      stripes: {
        ...defaultProps.stripes,
        user: {
          user: {
            ...defaultProps.stripes.user.user,
            tenants: [{ id: 'tenantId' }],
          },
        },
      },
    };

    beforeEach(() => {
      isMultiDataTenant.mockReturnValue(true);
      getHeaderWithCredentials.mockReturnValue(requestHeaders);
    });

    afterEach(() => {
      fetchSpy.mockClear();
    });

    describe('When user in central tenant', () => {
      beforeEach(() => {
        fetchSpy.mockResolvedValueOnce({
          json: () => ({
            ecsTlrFeatureEnabled: true,
          }),
        });
        checkIfUserInCentralTenant.mockReturnValue(true);
        global.fetch = fetchSpy;
        renderComponent(props);
      });

      it('should use correct endpoint to get ecs tlr settings', () => {
        expect(fetchSpy).toHaveBeenCalledWith(`${defaultProps.stripes.okapi.url}/tlr/settings`, requestHeaders);
      });

      it('should handle request creation', () => {
        const createRequestButton = screen.getByText(createRequestButtonLabel);

        fireEvent.click(createRequestButton);

        expect(props.mutator.circulationRequests.POST).toHaveBeenCalledWith(userData);
      });
    });

    describe('When user in data tenant', () => {
      beforeEach(() => {
        fetchSpy.mockResolvedValueOnce({
          json: () => ({
            circulationSettings: [
              {
                value: {
                  enabled: true,
                },
              }
            ],
          }),
        });
        checkIfUserInCentralTenant.mockReturnValueOnce(false);
        global.fetch = fetchSpy;
        renderComponent(props);
      });

      it('should use correct endpoint to get ecs tlr settings', () => {
        expect(fetchSpy).toHaveBeenCalledWith(`${defaultProps.stripes.okapi.url}/circulation/settings?query=name==ecsTlrFeature`, requestHeaders);
      });
    });
  });

  describe('Print pick slips', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('When all rows selected', () => {
      let selectRequestCheckbox;

      beforeEach(() => {
        renderComponent(defaultProps);

        selectRequestCheckbox = screen.getByTestId(testIds.selectRequestCheckbox);
      });

      it('should trigger Checkbox in table header with correct props', () => {
        const expectedProps = {
          checked: true,
        };

        Checkbox.mockClear();
        fireEvent.click(selectRequestCheckbox);

        expect(Checkbox).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should trigger CheckboxColumn in table body with correct props', () => {
        const expectedProps = {
          selectedRows: {
            [defaultProps.resources.records.records[0].id]: mockedRequest,
          },
        };

        CheckboxColumn.mockClear();
        fireEvent.click(selectRequestCheckbox);

        expect(CheckboxColumn).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render selected records subtitle', () => {
        const rowCheckbox = screen.getByTestId(testIds.rowCheckbox);

        getNextSelectedRowsState.mockReturnValue(mockedRequest);
        fireEvent.click(rowCheckbox);

        const recordsSelected = screen.getByText(labelIds.recordsSelected);

        expect(recordsSelected).toBeInTheDocument();
      });

      it('should send callout', () => {
        const singlePrintButton = screen.getByTestId(testIds.singlePrintButton);

        sendCallout.mockClear();
        fireEvent.click(singlePrintButton);

        expect(sendCallout).toHaveBeenCalled();
      });
    });

    describe('When all rows unselected', () => {
      let selectRequestCheckbox;

      beforeEach(() => {
        renderComponent(defaultProps);

        selectRequestCheckbox = screen.getByTestId(testIds.selectRequestCheckbox);

        fireEvent.click(selectRequestCheckbox);
      });

      it('should trigger Checkbox in table header with correct props', () => {
        const expectedProps = {
          checked: false,
        };

        Checkbox.mockClear();
        fireEvent.click(selectRequestCheckbox);

        expect(Checkbox).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should trigger CheckboxColumn in table body with correct props', () => {
        const expectedProps = {
          selectedRows: {},
        };

        CheckboxColumn.mockClear();
        fireEvent.click(selectRequestCheckbox);

        expect(CheckboxColumn).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('When "isViewPrintDetailsEnabled" is true', () => {
      it('should trigger "mutator.savePrintDetails.POST"', async () => {
        renderComponent(defaultProps);
        await userEvent.click(screen.getAllByRole('button', { name: 'PrintButton' })[0]);

        expect(defaultProps.mutator.savePrintDetails.POST).toHaveBeenCalled();
      });

      it('should trigger "mutator.resultOffset.replace"', async () => {
        renderComponent(defaultProps);
        await userEvent.click(screen.getAllByRole('button', { name: 'PrintButton' })[0]);

        waitFor(() => {
          expect(defaultProps.mutator.resultOffset.replace).toHaveBeenCalledWith(0);
        });
      });
    });

    describe('When "isViewPrintDetailsEnabled" is false', () => {
      const getPropsWithSortInQuery = (sortString = '') => ({
        ...defaultProps,
        resources: {
          ...defaultProps.resources,
          circulationSettings: {
            ...defaultProps.resources.circulationSettings,
            records: defaultProps.resources.circulationSettings.records.map(record => ({
              ...record,
              value: {
                ...record.value,
                enablePrintLog: 'false'
              }
            }))
          },
          query: {
            ...defaultProps.resources.query,
            sort: sortString,
          }
        }
      });

      it('should not trigger "mutator.savePrintDetails.POST"', async () => {
        renderComponent(getPropsWithSortInQuery());
        await userEvent.click(screen.getAllByRole('button', { name: 'PrintButton' })[0]);

        expect(defaultProps.mutator.savePrintDetails.POST).not.toHaveBeenCalled();
      });

      it('should trigger "exportToCsv"', async () => {
        renderComponent(getPropsWithSortInQuery());
        await userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsCsv' }));

        await waitFor(() => {
          expect(exportToCsv).toHaveBeenCalled();
        });
      });

      it('should trigger "mutator.query.update" when "copies" is present in the query sort string', () => {
        renderComponent(getPropsWithSortInQuery('copies,requestDate'));
        const expectedProps = { 'sort': 'requestDate' };

        expect(defaultProps.mutator.query.update).toHaveBeenCalledWith(expectedProps);
      });

      it('should trigger "mutator.query.update" when "printed" is present in the query sort string', () => {
        renderComponent(getPropsWithSortInQuery('-printed,requestDate'));
        const expectedProps = { 'sort': 'requestDate' };

        expect(defaultProps.mutator.query.update).toHaveBeenCalledWith(expectedProps);
      });

      it('should trigger "mutator.query.update" when any of "Print Status" is present in the query filter string', () => {
        renderComponent({
          ...defaultProps,
          resources: {
            ...defaultProps.resources,
            circulationSettings: {
              ...defaultProps.resources.circulationSettings,
              records: defaultProps.resources.circulationSettings.records.map(record => ({
                ...record,
                value: {
                  ...record.value,
                  enablePrintLog: 'false'
                }
              }))
            },
            query: {
              ...defaultProps.resources.query,
              filters: 'printStatus.Printed',
            },
          }
        });

        expect(defaultProps.mutator.query.update).toHaveBeenCalled();
      });
    });
  });

  describe('Page title', () => {
    describe('When url contains query param', () => {
      it('should trigger TitleManager with correct props', () => {
        renderComponent({
          ...defaultProps,
          location: {
            ...defaultProps.location,
            search: '?query=testQuery'
          }
        });

        const expectedProps = {
          page: labelIds.titleWithSearch,
        };

        expect(TitleManager).toHaveBeenCalledWith(expectedProps, {});
      });
    });

    describe('When url does not contain query param', () => {
      it('should trigger TitleManager with correct props', () => {
        renderComponent(defaultProps);

        const expectedProps = {
          page: labelIds.defaultTitle,
        };

        expect(TitleManager).toHaveBeenCalledWith(expectedProps, {});
      });
    });
  });

  describe('focus event', () => {
    it('should trigger focus on pane title', async () => {
      renderComponent(defaultProps);

      await userEvent.click(screen.getByTestId(testIds.searchAndSort));

      expect(createRefMock.current.focus).toBeCalled();
    });

    it('should trigger focus on search field', async () => {
      const props = {
        ...defaultProps,
        resources: {
          ...defaultProps.resources,
          records: {
            hasLoaded: true,
            isPending: false,
            other: {
              totalRecords: 0,
            },
            records: [mockedRequest],
          },
        },
      };

      renderComponent(props);

      await userEvent.click(screen.getByTestId(testIds.searchAndSort));

      expect(createDocumentRefMock.focus).toBeCalled();
    });
  });

  describe('getHelperResourcePath', () => {
    it('should correctly handle "getHelperResourcePath"', () => {
      renderComponent(defaultProps);

      const resourcePath = screen.getByText('getHelperResourcePath: circulation/requests/testID1');

      expect(resourcePath).toBeInTheDocument();
    });
  });

  describe('on request duplicate', () => {
    const defaultExpectedResultForUpdate = {
      layer: 'create',
      instanceId: mockedRequest.instanceId,
      userBarcode: mockedRequest.requester.barcode,
      mode: createModes.DUPLICATE,
    };

    it('should pass correct props if `requestLevel` is `Item`', async () => {
      const expectedResultForUpdate = {
        ...defaultExpectedResultForUpdate,
        itemBarcode: mockedRequest.item.barcode,
        itemId: mockedRequest.itemId,
      };

      mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.ITEM;

      renderComponent(defaultProps);

      await userEvent.click(screen.getByTestId(testIds.searchAndSort));

      expect(duplicateRequest).toHaveBeenCalledWith(mockedRequest);
      expect(mockedUpdateFunc).toHaveBeenCalledWith(expectedResultForUpdate);
    });

    it('should pass correct props if requestLevel is Title', async () => {
      mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.TITLE;

      renderComponent(defaultProps);

      await userEvent.click(screen.getByTestId(testIds.searchAndSort));

      expect(duplicateRequest).toHaveBeenCalledWith(mockedRequest);
      expect(mockedUpdateFunc).toHaveBeenCalledWith(defaultExpectedResultForUpdate);
    });
  });

  describe('Component updating', () => {
    let rerender;

    beforeEach(() => {
      rerender = renderComponent();
    });

    it('should get new settings', () => {
      const newProps = {
        ...defaultProps,
        resources: {
          ...defaultProps.resources,
          configs: {
            hasLoaded: true,
            records: [{
              value: {
                createTitleLevelRequestsByDefault: true,
              },
            }],
          },
        },
      };

      rerender(
        <CalloutContext.Provider value={{ sendCallout: () => {} }}>
          <RequestsRoute {...newProps} />
        </CalloutContext.Provider>,
      );

      expect(getTlrSettings).toHaveBeenCalledWith(newProps.resources.configs.records[0].value);
    });

    it('should not get new settings', () => {
      const newProps = {
        ...defaultProps,
        addressTypes: {},
      };
      const getUpdatedSettingsCallNumber = 2;

      rerender(
        <CalloutContext.Provider value={{ sendCallout: () => {} }}>
          <RequestsRoute {...newProps} />
        </CalloutContext.Provider>,
      );

      expect(getTlrSettings).not.toHaveBeenNthCalledWith(getUpdatedSettingsCallNumber, defaultProps.resources.configs.records[0].value);
    });
  });

  describe('buildHoldRecords method', () => {
    it('should build hold records when there are first name and last name', () => {
      const records = [{
        requester: {
          firstName: 'Pasha',
          lastName: 'Abramov',
        },
      }, {
        requester: {
          firstName: 'Alex',
          lastName: 'Green',
        },
      }];
      const expectedResult = [{
        requester: {
          firstName: 'Pasha',
          lastName: 'Abramov',
          name: 'Abramov, Pasha',
        },
      }, {
        requester: {
          firstName: 'Alex',
          lastName: 'Green',
          name: 'Green, Alex',
        },
      }];

      expect(buildHoldRecords(records)).toEqual(expectedResult);
    });

    it('should build hold records when there is only first name', () => {
      const records = [{
        requester: {
          firstName: 'firstNameWithoutLastName',
        },
      }];
      const expectedResult = [{
        requester: {
          firstName: 'firstNameWithoutLastName',
          name: 'firstNameWithoutLastName',
        },
      }];

      expect(buildHoldRecords(records)).toEqual(expectedResult);
    });

    it('should build hold records when there is only last name', () => {
      const records = [{
        requester: {
          lastName: 'lastNameWithoutFirstName',
        },
      }];
      const expectedResult = [{
        requester: {
          lastName: 'lastNameWithoutFirstName',
          name: 'lastNameWithoutFirstName',
        },
      }];

      expect(buildHoldRecords(records)).toEqual(expectedResult);
    });

    it('should build hold records when there is middle name', () => {
      const records = [{
        requester: {
          firstName: 'Pasha',
          lastName: 'Abramov',
          middleName: 'Patric',
        },
      }];
      const expectedResult = [{
        requester: {
          firstName: 'Pasha',
          lastName: 'Abramov',
          middleName: 'Patric',
          name: 'Abramov, Pasha',
        },
      }];

      expect(buildHoldRecords(records)).toEqual(expectedResult);
    });

    it('should build hold records when there is no requester', () => {
      const records = [{}];
      const expectedResult = [{}];

      expect(buildHoldRecords(records)).toEqual(expectedResult);
    });
  });

  describe('getListFormatter', () => {
    const getRowURLMock = jest.fn(id => id);
    const getPrintContentRefMock = jest.fn(id => id);
    const isPrintableMock = jest.fn(id => id);
    const toggleRowSelectionMock = jest.fn(id => id);
    const onBeforeGetContentForSinglePrintButtonMock = jest.fn(id => id);
    const onBeforePrintForSinglePrintButtonMock = jest.fn(id => id);
    const listFormatter = getListFormatter(
      {
        getRowURL: getRowURLMock,
      },
      {
        intl,
        selectedRows: '',
        pickSlipsToCheck: '',
        pickSlipsData: '',
        getPrintContentRef: getPrintContentRefMock,
        isPrintableMock,
        pickSlipsPrintTemplate: '',
        toggleRowSelection: toggleRowSelectionMock,
        onBeforeGetContentForSinglePrintButton: onBeforeGetContentForSinglePrintButtonMock,
        onBeforePrintForSinglePrintButton: onBeforePrintForSinglePrintButtonMock,
        isProxyAvailable: true,
      }
    );
    const requestWithData = {
      id: 'id',
      select: 'test value',
      item: {
        barcode: 'itemBarcode',
        retrievalServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
        retrievalServicePointName: 'Circ Desk 1',
      },
      position: 'position',
      proxy: {},
      requestDate: '02.02.2023',
      singlePrint: 'singlePrint',
      requester: {
        lastName: 'lastName',
        firstName: 'firstName',
        barcode: 'barcode',
      },
      status: requestStatuses.CANCELLED,
      requestType: requestTypesMap.RECALL,
      instance: {
        title: 'title',
        publication: 'publication',
      },
      pickupServicePoint: {
        name: 'name',
      },
      printDetails: printDetailsMockData,
    };
    const requestWithoutData = {};

    afterEach(() => {
      NoValue.mockClear();
    });

    describe('select', () => {
      it('should render CheckboxColumn', () => {
        const selectedRequest = {};
        const options = {
          intl,
          selectedRows: [],
          pickSlipsToCheck: [],
          pickSlipsData: {},
          getPrintContentRef: jest.fn(),
          pickSlipsPrintTemplate: jest.fn(),
          toggleRowSelection: jest.fn(),
          onBeforeGetContentForSinglePrintButton: jest.fn(),
          onBeforePrintForSinglePrintButton: jest.fn(),
        };
        const formatter = getListFormatter({}, options);
        const result = formatter.select(selectedRequest);

        render(result);

        expect(screen.getByTestId(testIds.rowCheckbox)).toBeInTheDocument();
      });
    });

    describe('singlePrint', () => {
      it('should render SinglePrintButtonForPickSlip', () => {
        const selectedRequest = {};
        const options = {
          intl,
          selectedRows: [],
          pickSlipsToCheck: [],
          pickSlipsData: {},
          getPrintContentRef: jest.fn(),
          pickSlipsPrintTemplate: jest.fn(),
          toggleRowSelection: jest.fn(),
          onBeforeGetContentForSinglePrintButton: jest.fn(),
          onBeforePrintForSinglePrintButton: jest.fn(),
        };
        const formatter = getListFormatter({}, options);
        const singlePrintButton = formatter.singlePrint(selectedRequest);

        render(singlePrintButton);

        expect(screen.getByTestId(testIds.singlePrintButton)).toBeInTheDocument();
      });
    });

    describe('itemBarcode', () => {
      it('should return item barcode', () => {
        expect(listFormatter.itemBarcode(requestWithData)).toBe(requestWithData.item.barcode);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.itemBarcode(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('position', () => {
      it('should return item position', () => {
        expect(listFormatter.position(requestWithData)).toBe(requestWithData.position);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.position(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('proxy', () => {
      it('should return request proxy', () => {
        const mockProxy = 'proxy full name';

        getFullName.mockReturnValueOnce(mockProxy);

        expect(listFormatter.proxy(requestWithData)).toBe(mockProxy);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.proxy(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('requestDate', () => {
      beforeEach(() => {
        render(listFormatter.requestDate(requestWithData));
      });

      it('should render request date', () => {
        const requestDate = screen.getByText(requestWithData.requestDate);

        expect(requestDate).toBeInTheDocument();
      });

      it('should render "AppIcon" with correct props', () => {
        const expectedProps = {
          size: 'small',
          app: 'requests',
        };

        expect(AppIcon).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('requester', () => {
      it('should return requester information', () => {
        const mockRequester = `${requestWithData.requester.lastName}, ${requestWithData.requester.firstName}`;

        getFullName.mockReturnValueOnce(mockRequester);

        expect(listFormatter.requester(requestWithData)).toBe(mockRequester);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.requester(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('requesterBarcode', () => {
      it('should return requester barcode', () => {
        expect(listFormatter.requesterBarcode(requestWithData)).toBe(requestWithData.requester.barcode);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.requesterBarcode(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('requestStatus', () => {
      it('should render request status', () => {
        render(listFormatter.requestStatus(requestWithData));

        const requestStatus = screen.getByText(labelIds.closedCancelledRequest);

        expect(requestStatus).toBeInTheDocument();
      });

      it('should render "NoValue"', () => {
        render(listFormatter.requestStatus(requestWithoutData));

        const noValue = screen.getByText('No value');

        expect(noValue).toBeInTheDocument();
      });
    });

    describe('type', () => {
      it('should render request type', () => {
        render(listFormatter.type(requestWithData));

        const requestType = screen.getByText(labelIds.requestType);

        expect(requestType).toBeInTheDocument();
      });
    });

    describe('title', () => {
      it('should render instance title', () => {
        render(listFormatter.title(requestWithData));

        const instanceTitle = screen.getByText(requestWithData.instance.title);

        expect(instanceTitle).toBeInTheDocument();
      });

      it('should render "TextLink" with correct props', () => {
        const expectedProps = {
          to: requestWithData.id,
        };

        render(listFormatter.title(requestWithData));

        expect(TextLink).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('type', () => {
      it('should trigger "getFormattedYears" with correct arguments', () => {
        const expectedArgs = [requestWithData.instance.publication, DEFAULT_DISPLAYED_YEARS_AMOUNT];

        listFormatter.year(requestWithData);

        expect(getFormattedYears).toHaveBeenCalledWith(...expectedArgs);
      });
    });

    describe('callNumber', () => {
      it('should trigger "effectiveCallNumber" with correct argument', () => {
        listFormatter.callNumber(requestWithData);

        expect(effectiveCallNumber).toHaveBeenCalledWith(requestWithData.item);
      });
    });

    describe('servicePoint', () => {
      it('should return service point', () => {
        expect(listFormatter.servicePoint(requestWithData)).toBe(requestWithData.pickupServicePoint.name);
      });
    });

    describe('retrieval service point', () => {
      it('should return retrieval service point', () => {
        expect(listFormatter.retrievalServicePoint(requestWithData)).toBe(requestWithData.item.retrievalServicePointName);
      });
    });

    describe('when formatting copies column', () => {
      it('should return copies for copies column', () => {
        expect(listFormatter.copies(requestWithData)).toBe(requestWithData.printDetails.printCount);
      });
    });

    describe('when formatting printed column', () => {
      it('should return last printed details for printed column', () => {
        getFullName.mockReturnValueOnce('lastName, firstName middleName');

        const expectedFormattedDate = intl.formatDate(requestWithData.printDetails.printEventDate);
        const expectedFormattedTime = intl.formatTime(requestWithData.printDetails.printEventDate);
        const expectedOutput =
        `lastName, firstName middleName ${expectedFormattedDate}${expectedFormattedTime ? ', ' : ''}${expectedFormattedTime}`;

        expect(listFormatter.printed(requestWithData)).toBe(expectedOutput);
      });

      it('should trigger NoValue component', () => {
        render(listFormatter.printed(requestWithoutData));

        expect(NoValue).toHaveBeenCalled();
      });
    });
  });

  describe('getLastPrintedDetails', () => {
    const lastPrintDetails = {
      lastPrintRequester: { firstName: 'firstName', middleName: 'middleName', lastName: 'lastName' },
      lastPrintedDate: '2024-08-03T13:33:31.868Z',
    };
    beforeEach(() => {
      getFullName.mockClear().mockReturnValue('lastName, firstName middleName');
    });

    it('should render getLastPrintedDetails() correctly', () => {
      expect(getLastPrintedDetails(lastPrintDetails, intl)).toBeTruthy();
    });

    it('should return the formatted full name and date/time correctly', () => {
      const printedDetails = getLastPrintedDetails(lastPrintDetails, intl);
      const expectedFormattedDate = intl.formatDate(lastPrintDetails.printEventDate);
      const expectedFormattedTime = intl.formatTime(lastPrintDetails.printEventDate);
      const expectedOutput =
        `lastName, firstName middleName ${expectedFormattedDate}${expectedFormattedTime ? ', ' : ''}${expectedFormattedTime}`;

      expect(printedDetails).toBe(expectedOutput);
    });
  });

  describe('getFilteredColumnHeadersMap', () => {
    const columnHeaders = [
      { value: 'patronComments' },
      { value: PRINT_DETAILS_COLUMNS.COPIES },
      { value: PRINT_DETAILS_COLUMNS.PRINTED },
    ];

    it('should render getFilteredColumnHeadersMap() correctly', () => {
      expect(getFilteredColumnHeadersMap(columnHeaders)).toBeTruthy();
    });

    it('should return properly filtered column headers', () => {
      const filteredColumnHeaders = getFilteredColumnHeadersMap(columnHeaders);
      const expectedColumnHeaders = [{ value: 'patronComments' }];

      expect(filteredColumnHeaders).toEqual(expectedColumnHeaders);
    });
  });

  describe('urls', () => {
    const mockedQueryValue = 'testQuery';
    const idType = 'id';

    beforeEach(() => {
      stringify.mockReturnValue(mockedQueryValue);
    });

    describe('user', () => {
      const value = 'value';
      let queryString;

      beforeEach(() => {
        queryString = urls.user(value, idType);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(${idType}=="${value}")`,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `users?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('item', () => {
      describe('when "value" is an array', () => {
        const value = ['value_1', 'value_2'];
        let queryString;

        beforeEach(() => {
          queryString = urls.item(value, idType);
        });

        it('should trigger "stringify" with correct argument', () => {
          const expectedArgument = {
            query: `(${ITEM_QUERIES[idType]}=="${value[0]}" or ${ITEM_QUERIES[idType]}=="${value[1]}")`,
          };

          expect(stringify).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return correct url', () => {
          const expectedResult = `circulation-bff/requests/search-instances?${mockedQueryValue}`;

          expect(queryString).toBe(expectedResult);
        });
      });

      describe('when "value" is not an array', () => {
        const value = 'value';
        let queryString;

        beforeEach(() => {
          queryString = urls.item(value, idType);
        });

        it('should trigger "stringify" with correct argument', () => {
          const expectedArgument = {
            query: `(${ITEM_QUERIES[idType]}=="${value}")`,
          };

          expect(stringify).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return correct url', () => {
          const expectedResult = `circulation-bff/requests/search-instances?${mockedQueryValue}`;

          expect(queryString).toBe(expectedResult);
        });
      });
    });

    describe('instance', () => {
      const value = 'value';
      const instanceQueryString = 'instanceQueryString';
      let queryString;

      beforeEach(() => {
        getInstanceQueryString.mockReturnValue(instanceQueryString);
        queryString = urls.instance(value, idType);
      });

      it('should trigger "getInstanceQueryString" with correct argument', () => {
        expect(getInstanceQueryString).toHaveBeenCalledWith(value);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: instanceQueryString,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `circulation-bff/requests/search-instances?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('loan', () => {
      const value = 'value';
      let queryString;

      beforeEach(() => {
        queryString = urls.loan(value, idType);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(itemId=="${value}") and status.name==Open`,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `circulation/loans?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('requestsForItem', () => {
      const value = 'value';
      const statusQuery = 'statusQuery';
      let queryString;

      beforeEach(() => {
        getStatusQuery.mockReturnValue(statusQuery);
        queryString = urls.requestsForItem(value);
      });

      it('should trigger "getStatusQuery" with correct argument', () => {
        expect(getStatusQuery).toHaveBeenCalledWith(OPEN_REQUESTS_STATUSES);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(itemId=="${value}" and (${statusQuery}))`,
          limit: MAX_RECORDS,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `circulation/requests?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('requestsForInstance', () => {
      const value = 'value';
      const statusQuery = 'statusQuery';
      let queryString;

      beforeEach(() => {
        getStatusQuery.mockReturnValue(statusQuery);
        queryString = urls.requestsForInstance(value);
      });

      it('should trigger "getStatusQuery" with correct argument', () => {
        expect(getStatusQuery).toHaveBeenCalledWith(OPEN_REQUESTS_STATUSES);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(instanceId=="${value}" and (${statusQuery}))`,
          limit: MAX_RECORDS,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `circulation/requests?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('requestPreferences', () => {
      const value = 'value';
      let queryString;

      beforeEach(() => {
        queryString = urls.requestPreferences(value);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(userId=="${value}")`,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `request-preference-storage/request-preference?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('requestTypes', () => {
      const requesterId = 'requesterIdUrl';
      const operation = REQUEST_OPERATIONS.CREATE;
      const itemId = 'itemIdUrl';
      const instanceId = 'instanceIdUrl';
      const requestUrl = 'circulation-bff/requests/allowed-service-points';

      it('should return url with "itemId"', () => {
        const expectedResult = `${requestUrl}?requesterId=${requesterId}&operation=${operation}&itemId=${itemId}`;

        expect(urls.requestTypes({
          requesterId,
          itemId,
          operation,
        })).toBe(expectedResult);
      });

      it('should return url with "instanceId"', () => {
        const expectedResult = `${requestUrl}?requesterId=${requesterId}&operation=${operation}&instanceId=${instanceId}`;

        expect(urls.requestTypes({
          requesterId,
          instanceId,
          operation,
        })).toBe(expectedResult);
      });

      it('should return url with "requestId"', () => {
        const requestId = 'requestId';
        const expectedResult = `${requestUrl}?operation=${operation}&requestId=${requestId}`;

        expect(urls.requestTypes({
          requestId,
          operation,
        })).toBe(expectedResult);
      });
    });

    describe('ecsTlrSettings', () => {
      describe('When user in central tenant', () => {
        it('should return correct endpoint', () => {
          checkIfUserInCentralTenant.mockReturnValueOnce(true);

          const ecsTlrSettingsEndpoint = 'tlr/settings';
          const result = urls.ecsTlrSettings();

          expect(result).toBe(ecsTlrSettingsEndpoint);
        });
      });

      describe('When user in data tenant', () => {
        it('should return correct endpoint', () => {
          checkIfUserInCentralTenant.mockReturnValueOnce(false);

          const ecsTlrSettingsEndpoint = 'circulation/settings?query=name==ecsTlrFeature';
          const result = urls.ecsTlrSettings();

          expect(result).toBe(ecsTlrSettingsEndpoint);
        });
      });
    });
  });

  describe('extractPickSlipRequestIds', () => {
    it('removes duplicate ids', () => {
      expect(extractPickSlipRequestIds(Array(2).fill({ 'request.requestID': 'mockId0' }))).toEqual(['mockId0']);
    });
  });
});
