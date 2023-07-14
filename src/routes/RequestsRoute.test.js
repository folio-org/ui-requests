import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '../../test/jest/__mock__';

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
  getListFormatter,
  REQUEST_ERROR_MESSAGE_CODE,
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
  DEFAULT_FORMATTER_VALUE,
} from './RequestsRoute';
import {
  duplicateRequest,
  getTlrSettings,
  getFullName,
} from '../utils';
import {
  getFormattedYears,
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
} from '../constants';
import { historyData } from '../../test/jest/fixtures/historyData';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(),
}));
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
  PrintContent: jest.fn(() => <div>PrintContent</div>)
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
};

SearchAndSort.mockImplementation(jest.fn(({
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
      }
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
      query: {
        filters: 'filter1.value1,filter1.value2,filter2.value3',
        instanceId: 'instanceId',
        query: 'testQueryTerm'
      },
      records: {
        hasLoaded: true,
        other: {
          totalRecords: 1
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

    it('should trigger "onChange" after clicking on clear button', () => {
      userEvent.click(screen.getByRole('button', { name: 'onClear' }));

      expect(RequestFilterData.onChange).toBeCalled();
    });

    it('should render PrintContent', () => {
      const printContent = screen.getByText('PrintContent');

      expect(printContent).toBeInTheDocument();
    });

    it('should trigger "exportCsv"', async () => {
      userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsToCsv' }));

      await waitFor(() => {
        expect(exportCsv).toBeCalled();
      });
    });

    it('should render "ErrorModal"', () => {
      const errorModal = screen.queryByText('ErrorModal');

      userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));

      expect(errorModal).toBeInTheDocument();
    });

    it('should hide "ErrorModal"', () => {
      const errorModal = screen.queryByText('ErrorModal');

      userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));
      userEvent.click(screen.getByRole('button', { name: 'Close' }));

      expect(errorModal).not.toBeInTheDocument();
    });

    it('should trigger "mutator.query.update"', () => {
      const expectFilterValue = { 'filters': 'filter1.value1,filter1.value2,filter2.value3,filter4.Value4,filter4.Value5' };

      userEvent.click(screen.getByRole('button', { name: 'onFilterChange' }));

      expect(defaultProps.mutator.query.update).toBeCalledWith(expectFilterValue);
    });

    it('should trigger "mutator.activeRecord.update"', () => {
      userEvent.click(screen.getByRole('button', { name: 'onChangePatron' }));

      expect(defaultProps.mutator.activeRecord.update).toBeCalled();
    });

    it('should trigger "fetch"', () => {
      userEvent.click(screen.getByRole('button', { name: 'addRequestFields' }));

      expect(global.fetch).toBeCalled();
    });

    it('should trigger "history.push"', () => {
      userEvent.click(screen.getByRole('button', { name: 'onCloseNewRecord' }));

      expect(defaultProps.history.push).toBeCalled();
    });

    it('should render print pick slips label', () => {
      const printPickSlipsLabel = screen.getByText(labelIds.printPickSlips);

      userEvent.click(screen.getByRole('button', { name: 'onBeforeGetContent' }));

      expect(printPickSlipsLabel).toBeInTheDocument();
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

    it('should pass correct props if `requestLevel` is `Item`', () => {
      const expectedResultForUpdate = {
        ...defaultExpectedResultForUpdate,
        itemBarcode: mockedRequest.item.barcode,
        itemId: mockedRequest.itemId,
      };

      mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.ITEM;

      renderComponent(defaultProps);

      userEvent.click(screen.getByTestId(testIds.searchAndSort));

      expect(duplicateRequest).toHaveBeenCalledWith(mockedRequest);
      expect(mockedUpdateFunc).toHaveBeenCalledWith(expectedResultForUpdate);
    });

    it('should pass correct props if requestLevel is Title', () => {
      mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.TITLE;

      renderComponent(defaultProps);

      userEvent.click(screen.getByTestId(testIds.searchAndSort));

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

  describe('getListFormatter', () => {
    const getRowURLMock = jest.fn(id => id);
    const setURLMock = jest.fn(id => id);
    const listFormatter = getListFormatter(getRowURLMock, setURLMock);
    const requestWithData = {
      id: 'id',
      item: {
        barcode: 'itemBarcode',
      },
      position: 'position',
      proxy: {},
      requestDate: '02.02.2023',
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
    };
    const requestWithoutData = {};

    describe('itemBarcode', () => {
      it('should return item barcode', () => {
        expect(listFormatter.itemBarcode(requestWithData)).toBe(requestWithData.item.barcode);
      });

      it('should return empty string', () => {
        expect(listFormatter.itemBarcode(requestWithoutData)).toBe(DEFAULT_FORMATTER_VALUE);
      });
    });

    describe('position', () => {
      it('should return item position', () => {
        expect(listFormatter.position(requestWithData)).toBe(requestWithData.position);
      });

      it('should return empty string', () => {
        expect(listFormatter.position(requestWithoutData)).toBe(DEFAULT_FORMATTER_VALUE);
      });
    });

    describe('proxy', () => {
      it('should return request proxy', () => {
        const mockProxy = 'proxy full name';

        getFullName.mockReturnValueOnce(mockProxy);

        expect(listFormatter.proxy(requestWithData)).toBe(mockProxy);
      });

      it('should return empty string', () => {
        expect(listFormatter.proxy(requestWithoutData)).toBe(DEFAULT_FORMATTER_VALUE);
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
        const requesterInfo = `${requestWithData.requester.lastName}, ${requestWithData.requester.firstName}`;

        expect(listFormatter.requester(requestWithData)).toBe(requesterInfo);
      });

      it('should return empty string', () => {
        expect(listFormatter.requester(requestWithoutData)).toBe(DEFAULT_FORMATTER_VALUE);
      });
    });

    describe('requesterBarcode', () => {
      it('should return requester barcode', () => {
        expect(listFormatter.requesterBarcode(requestWithData)).toBe(requestWithData.requester.barcode);
      });

      it('should return empty string', () => {
        expect(listFormatter.requester(requestWithoutData)).toBe(DEFAULT_FORMATTER_VALUE);
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
          onClick: expect.any(Function),
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
  });
});
