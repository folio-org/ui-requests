import React from 'react';
import {
  stringify,
} from 'query-string';

import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  SearchAndSort,
} from '@folio/stripes/smart-components';
import {
  CalloutContext,
  AppIcon,
} from '@folio/stripes/core';
import {
  TextLink,
} from '@folio/stripes/components';
import {
  exportCsv,
  effectiveCallNumber,
} from '@folio/stripes/util';

import RequestsRoute, {
  buildHoldRecords,
  getRequestErrorMessage,
  getPrintHoldRequestsEnabled,
  urls,
  REQUEST_ERROR_MESSAGE_CODE,
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
  DEFAULT_FORMATTER_VALUE,
} from './RequestsRoute';
import {
  duplicateRequest,
  getTlrSettings,
  getFullName,
  getInstanceQueryString,
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
} from '../constants';
import { historyData } from '../../test/jest/fixtures/historyData';

const createRefMock = {
  current: {
    focus: jest.fn(),
  },
};
const createDocumentRefMock = {
  focus: jest.fn(),
};
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
    children,
  }) => (
    <div>
      <button
        type="button"
        onClick={onBeforeGetContent}
      >onBeforeGetContent
      </button>
      {children}
    </div>
  )),
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

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({
    requests: [
      {
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
      }
    ],
  }),
}));

const testIds = {
  searchAndSort: 'searchAndSort',
  pickSlipsPrintTemplate: 'pickSlipsPrintTemplate',
  searchSlipsPrintTemplate: 'searchSlipsPrintTemplate',
};
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
  printPickSlips: 'ui-requests.printPickSlips',
  printSearchSlips: 'ui-requests.printSearchSlips',
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
  parentResources: {
    records: {
      records,
    },
  },
  renderFilters,
  resultIsSelected,
  viewRecordOnCollapse,
}) => {
  const onClickActions = () => {
    onDuplicate(records[0]);
    buildRecordsForHoldsShelfReport();
    massageNewRecord({});
    resultIsSelected({
      item: {
        id: 'id',
      },
    });
    viewRecordOnCollapse();
  };
  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div>
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
      </div>
      {actionMenu({ onToggle: jest.fn() })}
      <div paneTitleRef={paneTitleRef} />
    </div>
  );
}));

describe('RequestsRoute', () => {
  const mockedUpdateFunc = jest.fn();
  const mockedRequest = {
    requestLevel: REQUEST_LEVEL_TYPES.ITEM,
    itemId: 'testItemId',
    instanceId: 'testInstanceId',
    item: {
      barcode: 'testItemBarcode',
    },
    requester: {
      barcode: 'testRequesterBarcode',
    },
  };
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
      activeRecord: {
        update: jest.fn(),
      },
      currentServicePoint: {
        update: jest.fn(),
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
      user: {},
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
          value: '{"printHoldRequestsEnabled": true}',
        }],
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
            name: 'pick slip',
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

  const renderComponent = (props = defaultProps) => render(
    <CalloutContext.Provider value={{ sendCallout: () => {} }}>
      <RequestsRoute {...props} />
    </CalloutContext.Provider>,
  );

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
      await await userEvent.click(screen.getByRole('button', { name: 'onClear' }));

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

    it('should trigger "exportCsv"', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsToCsv' }));

      await waitFor(() => {
        expect(exportCsv).toBeCalled();
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

      expect(defaultProps.mutator.query.update).toBeCalledWith(expectFilterValue);
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

      await userEvent.click(screen.getAllByRole('button', { name: 'onBeforeGetContent' })[0]);

      expect(printPickSlipsLabel).toBeInTheDocument();
    });

    it('should render print search slips label', async () => {
      const printSearchSlipsLabel = screen.getByText(labelIds.printSearchSlips);

      await userEvent.click(screen.getAllByRole('button', { name: 'onBeforeGetContent' })[1]);

      expect(printSearchSlipsLabel).toBeInTheDocument();
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

  describe('getRequestErrorMessage', () => {
    const formatMessage = jest.fn(({ id }) => id);
    const intl = {
      formatMessage,
    };
    const message = 'test message';

    it('should have same count of code and translation keys', () => {
      expect(Object.keys(REQUEST_ERROR_MESSAGE_CODE).length).toEqual(Object.keys(REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS).length);
    });

    describe('should have translation key for each code', () => {
      Object.keys(REQUEST_ERROR_MESSAGE_CODE).forEach((key) => {
        it(`should have translation key for code: ${key}`, () => {
          expect(!!REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS[key]).toBeTruthy();
        });
      });
    });

    it('should return translation key for code', () => {
      expect(getRequestErrorMessage({
        code: REQUEST_ERROR_MESSAGE_CODE.REQUEST_NOT_ALLOWED_FOR_PATRON_TITLE_COMBINATION,
      }, intl)).toEqual(REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS.REQUEST_NOT_ALLOWED_FOR_PATRON_TITLE_COMBINATION);
    });

    it('should trigger formatMessage with correct props', () => {
      getRequestErrorMessage({
        code: REQUEST_ERROR_MESSAGE_CODE.REQUEST_NOT_ALLOWED_FOR_PATRON_TITLE_COMBINATION,
      }, intl);

      expect(formatMessage).toHaveBeenCalledWith({
        id: REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS.REQUEST_NOT_ALLOWED_FOR_PATRON_TITLE_COMBINATION,
      });
    });

    it('should return message when code empty', () => {
      expect(getRequestErrorMessage({
        message,
      }, intl)).toEqual(message);
    });

    it('should return default message when code and message empty', () => {
      expect(getRequestErrorMessage({}, intl)).toEqual('');
    });
  });

  describe('getPrintHoldRequestsEnabled', () => {
    it('should return true when printHoldRequestsEnabled is true', () => {
      expect(getPrintHoldRequestsEnabled({
        records: [{
          value: '{"printHoldRequestsEnabled": true}',
        }],
      })).toBeTruthy();
    });

    it('should return false when printHoldRequestsEnabled is false', () => {
      expect(getPrintHoldRequestsEnabled({
        records: [{
          value: '{"printHoldRequestsEnabled": false}',
        }],
      })).toBeFalsy();
    });

    it('should return false when value absent', () => {
      expect(getPrintHoldRequestsEnabled({
        records: [],
      })).toBeFalsy();
    });
  });

  describe('urls', () => {
    const mockedQueryValue = 'testQuery';
    const idType = 'idType';

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
            query: `(${idType}=="${value[0]}" or ${idType}=="${value[1]}")`,
          };

          expect(stringify).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return correct url', () => {
          const expectedResult = `inventory/items?${mockedQueryValue}`;

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
            query: `(${idType}=="${value}")`,
          };

          expect(stringify).toHaveBeenCalledWith(expectedArgument);
        });

        it('should return correct url', () => {
          const expectedResult = `inventory/items?${mockedQueryValue}`;

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
        const expectedResult = `inventory/instances?${mockedQueryValue}`;

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

    describe('holding', () => {
      const value = 'value';
      let queryString;

      beforeEach(() => {
        queryString = urls.holding(value, idType);
      });

      it('should trigger "stringify" with correct argument', () => {
        const expectedArgument = {
          query: `(${idType}=="${value}")`,
        };

        expect(stringify).toHaveBeenCalledWith(expectedArgument);
      });

      it('should return correct url', () => {
        const expectedResult = `holdings-storage/holdings?${mockedQueryValue}`;

        expect(queryString).toBe(expectedResult);
      });
    });

    describe('requestTypes', () => {
      const requesterId = 'requesterIdUrl';
      const operation = REQUEST_OPERATIONS.CREATE;
      const itemId = 'itemIdUrl';
      const instanceId = 'instanceIdUrl';

      it('should return url with "itemId"', () => {
        const expectedUrl = `circulation/requests/allowed-service-points?requesterId=${requesterId}&operation=${operation}&itemId=${itemId}`;

        expect(urls.requestTypes({
          requesterId,
          itemId,
          operation,
        })).toBe(expectedUrl);
      });

      it('should return url with "instanceId"', () => {
        const expectedUrl = `circulation/requests/allowed-service-points?requesterId=${requesterId}&operation=${operation}&instanceId=${instanceId}`;

        expect(urls.requestTypes({
          requesterId,
          instanceId,
          operation,
        })).toBe(expectedUrl);
      });

      it('should return url with "requestId"', () => {
        const requestId = 'requestId';
        const expectedUrl = `circulation/requests/allowed-service-points?operation=${operation}&requestId=${requestId}`;

        expect(urls.requestTypes({
          requestId,
          operation,
        })).toBe(expectedUrl);
      });
    });
  });
});
