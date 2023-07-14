import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../test/jest/__mock__';
import '../../test/jest/__mock__/stripesUtils.mock';
import {
  SearchAndSort,
} from '@folio/stripes/smart-components';
import { CalloutContext } from '@folio/stripes-core';
import { exportCsv } from '@folio/stripes/util';

import RequestsRoute, {
  buildHoldRecords,
  REQUEST_ERROR_MESSAGE_CODE,
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
  getRequestErrorMessage,
} from './RequestsRoute';

import {
  duplicateRequest,
  getTlrSettings,
} from '../utils';
import {
  REQUEST_LEVEL_TYPES,
  createModes,
  DEFAULT_REQUEST_TYPE_VALUE,
} from '../constants';
import { historyData } from '../../test/jest/fixtures/historyData';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createRef: jest.fn(),
}));
jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  duplicateRequest: jest.fn((request) => request),
  getTlrSettings: jest.fn(() => ({})),
}));
jest.mock('../components', () => ({
  ErrorModal: jest.fn(({ onClose }) => (
    <div>
      <span>ErrorModel</span>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  )),
  LoadingButton: jest.fn(() => null),
  PrintButton: jest.fn(({ onBeforeGetContent, children }) => (
    <div>
      <button type="button" onClick={onBeforeGetContent}>onBeforeGetContent</button>
      {children}
    </div>
  )),
  PrintContent: jest.fn(() => <div>PrintContent</div>)
}));

jest.mock('../components/RequestsFilters/RequestsFilters', () => ({ onClear }) => {
  return (
    <div>
      <span>RequestsFilter</span>
      <button type="button" onClick={onClear}>onClear</button>
    </div>
  );
});
jest.mock('../ViewRequest', () => jest.fn());
jest.mock('../RequestForm', () => jest.fn());

global.fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({ requests: [{ requestLevel: REQUEST_LEVEL_TYPES.TITLE }] }),
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

const resultFormatterData = {
  id: 'resultFormatterTestId',
  instance: {
    publication: [
      { dateOfPublication: '2021-01-01' },
      { dateOfPublication: '2020-05-10' },
      { dateOfPublication: '2019-09-15' },
      { dateOfPublication: '2018-03-20' },
      { dateOfPublication: '2017-07-25' }
    ],
    title: 'testTitle',
  },
  item: {
    barcode: 'testBarcode'
  },
  pickupServicePoint: {
    name: 'TestPickupServicePoint'
  },
  position: 'testPositon',
  proxy: {
    personal: {
      lastName: 'testLastName',
      firstName: 'testFirstName',
      middleName: 'testMiddleName'
    }
  },
  status: '',
  requester: {
    barcode: 'testRequesterBarcode',
    firstName: 'requesterFirstName',
    lastName: 'requesterLastName',
  },
  requestDate: '2023-04-21',
  requestType: 'Recall',
};

SearchAndSort.mockImplementation(jest.fn(({
  actionMenu,
  detailProps: { onDuplicate, buildRecordsForHoldsShelfReport, onChangePatron, joinRequest },
  getHelperResourcePath,
  massageNewRecord,
  onCloseNewRecord,
  onFilterChange,
  parentResources: { records: { records } },
  renderFilters,
  resultsFormatter,
  resultIsSelected,
  viewRecordOnCollapse
}) => {
  const resultsFormatterResult = (key) => {
    const value = resultsFormatter[key];
    return value ? value(resultFormatterData) : '';
  };
  const onClickActions = () => {
    onDuplicate(records[0]);
    buildRecordsForHoldsShelfReport();
    massageNewRecord({});
    resultIsSelected({ item: { id: 'id' } });
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
        <p>itemBarcode: {resultsFormatterResult('itemBarcode')}</p>
        <p>position: {resultsFormatterResult('position')}</p>
        <p>proxy: {resultsFormatterResult('proxy')}</p>
        <p>requestDate: {resultsFormatterResult('requestDate')}</p>
        <p>requester: {resultsFormatterResult('requester')}</p>
        <p>requesterBarcode: {resultsFormatterResult('requesterBarcode')}</p>
        <p>requestStatus: {resultsFormatterResult('requestStatus')}</p>
        <p>type: {resultsFormatterResult('type')}</p>
        <div>title: {resultsFormatterResult('title')}</div>
        <p>year: {resultsFormatterResult('year')}</p>
        <p>callNumber: {resultsFormatterResult('callNumber')}</p>
        <p>servicePoint: {resultsFormatterResult('servicePoint')}</p>
      </div>
      <div>
        {renderFilters(RequestFilterData.onChange)}
      </div>
      <div>
        <button type="button" onClick={onChangePatron}>onChangePatron</button>
        <button type="button" onClick={onCloseNewRecord}>onCloseNewRecord</button>
        <button type="button" onClick={() => joinRequest(request)}>addRequestFields</button>
        <button type="button" onClick={onFilterChange({ name: 'filter4', values: ['Value4', 'Value5'] })}>onFilterChange</button>
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
          { name: 'John Doe' },
          { name: 'Jane Smith' }
        ]
      },
      tags: {
        tagList: ['tag1', 'tag2']
      },
      requester: {
        firstName: 'Alice',
        lastName: 'Johnson'
      },
      proxy: {
        firstName: 'Bob',
        lastName: 'Williams'
      },
      deliveryAddress: {
        addressLine1: '123 Main St',
        city: 'Cityville',
        region: 'State',
        postalCode: '12345',
        countryId: 'US'
      }
    }
  ];
  const defaultProps = {
    history: historyData,
    location: historyData.location,
    match: {
      params: {
        noteId: 'viewNoteRouteID'
      },
      path: 'viewPath',
      url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules'
    },
    mutator: {
      activeRecord: {
        update: jest.fn(),
      },
      currentServicePoint: {
        update: jest.fn(),
      },
      expiredHolds: {
        GET: jest.fn(() => ({ requests: [{
          requester: {
            firstName: 'firstName',
            lastName: 'lastName',
            name: ''
          }
        }] })),
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
        POST: jest.fn().mockResolvedValue()
      },
      reportRecords: {
        GET: jest.fn().mockReturnValueOnce(mockRecordValues).mockRejectedValue(),
        reset: jest.fn()
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
        records: [{ value: 'testConfig' }],
      },
      currentServicePoint: {},
      patronBlocks: {
        records: [
          {
            expirationDate: '2023-09-11'
          }
        ]
      },
      pickSlips: {
        records: [
          { name: 'pick slip' }
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
        records: [{ name: 'staffSlipName' }],
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
    it('RequestsFilter should render on renderFilter', () => {
      expect(screen.getByText('RequestsFilter')).toBeInTheDocument();
    });
    it('onChange to be called on onClear of RequestsFilter', () => {
      userEvent.click(screen.getByRole('button', { name: 'onClear' }));
      expect(RequestFilterData.onChange).toBeCalled();
    });
    it('PrintContent should render', () => {
      expect(screen.getByText('PrintContent')).toBeInTheDocument();
    });
    it('exportCsv function to be called when ui-requests.exportSearchResultsToCsv button clicked', async () => {
      userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsToCsv' }));
      await waitFor(() => {
        expect(exportCsv).toBeCalled();
      });
    });
    it('ErrorModel model should render', () => {
      userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));
      expect(screen.queryByText('ErrorModel')).toBeInTheDocument();
    });
    it('ErrorModel model should close on clicking close Button', () => {
      userEvent.click(screen.getByTestId('exportExpiredHoldShelfToCsvButton'));
      userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(screen.queryByText('ErrorModel')).not.toBeInTheDocument();
    });
    it('mutator.query.update function to be called on onFilterChange', () => {
      const expectFilterValue = { 'filters': 'filter1.value1,filter1.value2,filter2.value3,filter4.Value4,filter4.Value5' };
      userEvent.click(screen.getByRole('button', { name: 'onFilterChange' }));
      expect(defaultProps.mutator.query.update).toBeCalledWith(expectFilterValue);
    });
    it('mutator.activeRecord.update to be called on onChangePatron', () => {
      userEvent.click(screen.getByRole('button', { name: 'onChangePatron' }));
      expect(defaultProps.mutator.activeRecord.update).toBeCalled();
    });
    it('fetch function to be called on addRequestFields', () => {
      userEvent.click(screen.getByRole('button', { name: 'addRequestFields' }));
      expect(global.fetch).toBeCalled();
    });
    it('PUSH function of history to be called on onCloseNewRecord', () => {
      userEvent.click(screen.getByRole('button', { name: 'onCloseNewRecord' }));
      expect(defaultProps.history.push).toBeCalled();
    });
    it('ui-requests.printPickSlips should render', () => {
      userEvent.click(screen.getByRole('button', { name: 'onBeforeGetContent' }));
      expect(screen.getByText('ui-requests.printPickSlips')).toBeInTheDocument();
    });
  });

  describe('resultsFormatter function', () => {
    beforeEach(() => {
      renderComponent(defaultProps);
    });
    it('itemBarcode of resultsFormatter should have value "testBarcode"', () => {
      expect(screen.getByText(/itemBarcode: testBarcode/i)).toBeInTheDocument();
    });
    it('position of resultsFormatter should have value "testPositon"', () => {
      expect(screen.getByText(/position: testPositon/i)).toBeInTheDocument();
    });
    it('proxy of resultsFormatter should have value "testLastName, testFirstName testMiddleName"', () => {
      expect(screen.getByText(/proxy: testLastName, testFirstName testMiddleName/i)).toBeInTheDocument();
    });
    it('requestDate of resultsFormatter should have value "2023-04-21"', () => {
      expect(screen.getByText('2023-04-21')).toBeInTheDocument();
    });
    it('requester of resultsFormatter should have value "requesterLastName, requesterFirstName"', () => {
      expect(screen.getByText(/requester: requesterLastName, requesterFirstName/i)).toBeInTheDocument();
    });
    it('requesterBarcode of resultsFormatter should have value "testRequesterBarcode"', () => {
      expect(screen.getByText(/requesterBarcode: testRequesterBarcode/i)).toBeInTheDocument();
    });
    it('requestStatus of resultsFormatter should have value "No Value"', () => {
      expect(screen.getByText(/No value/i)).toBeInTheDocument();
    });
    it('type of resultsFormatter should have value "ui-requests.requestMeta.type.recall"', () => {
      expect(screen.getByText(/type: ui-requests.requestMeta.type.recall/i)).toBeInTheDocument();
    });
    it('servicePoint of resultsFormatter should have value "TestPickupServicePoint"', () => {
      expect(screen.getByText(/servicePoint: TestPickupServicePoint/i)).toBeInTheDocument();
    });
    it('title of resultsFormatter should have value link with value', () => {
      expect(screen.getByRole('link', { name: 'testTitle' })).toHaveAttribute('href', 'viewPath/view/resultFormatterTestId?instanceId=12345&foo=bar');
    });
  });

  describe('getHelperResourcePath', () => {
    it('getHelperResourcePath to have value "circulation/requests/testID1"', () => {
      renderComponent(defaultProps);
      expect(screen.getByText('getHelperResourcePath: circulation/requests/testID1')).toBeInTheDocument();
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
});
