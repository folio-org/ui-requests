import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '../../test/jest/__mock__';
import '../../test/jest/__mock__/stripesUtils.mock';
import { SearchAndSort } from '@folio/stripes/smart-components';
import { exportCsv } from '@folio/stripes/util';
import { CalloutContext } from '@folio/stripes-core';
import { historyData } from '../../test/jest/fixtures/historyData';
import { duplicateRequest, getTlrSettings } from '../utils';
import { REQUEST_LEVEL_TYPES, createModes } from '../constants';
import RequestsRoute, { buildHoldRecords } from './RequestsRoute';

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
  PrintButton: jest.fn(({ onBeforeGetContent, children }) => (
    <div>
      <button type="button" onClick={onBeforeGetContent}>onBeforeGetContent</button>
      {children}
    </div>
  )),
  PrintContent: jest.fn(() => null),
  LoadingButton: jest.fn(() => null),
}));
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
  instance: {
    publication: [
      {
        dateOfPublication: '2023-08-11'
      }
    ],
    title: '',
  },
  item: {
    barcode: 'itemBarcode'
  },
  position: 'positon',
  proxy: {
    personal: {
      lastName: 'lastName',
      firstName: 'firstName',
      middleName: 'middleName'
    }
  },
  status: '',
  requester: {
    barcode: 'requesterBarcode',
    firstName: 'requesterFirstName',
    lastName: 'requesterLastName',
  },
  requestDate: '2023-04-21',
  requestType: 'requestType',
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
  const resultsFormatterHandler = () => {
    resultsFormatter.itemBarcode(resultFormatterData);
    resultsFormatter.position(resultFormatterData);
    resultsFormatter.proxy(resultFormatterData);
    resultsFormatter.requestDate(resultFormatterData);
    resultsFormatter.requester(resultFormatterData);
    resultsFormatter.requesterBarcode(resultFormatterData);
    resultsFormatter.requestStatus(resultFormatterData);
    resultsFormatter.type(resultFormatterData);
    resultsFormatter.title(resultFormatterData);
    resultsFormatter.year(resultFormatterData);
    resultsFormatter.callNumber(resultFormatterData);
    resultsFormatter.servicePoint(resultFormatterData);
  };
  const onClickActions = () => {
    onDuplicate(records[0]);
    buildRecordsForHoldsShelfReport();
    getHelperResourcePath();
    massageNewRecord({});
    resultsFormatterHandler();
    renderFilters(RequestFilterData.onChange);
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
      locale: 'en-US',
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
      timezone: 'timezone',
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
        records: [{}],
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
    requestType: 'Hold',
    fulfillmentPreference: 'Hold Shelf',
  };

  const renderComponent = (props = defaultProps) => {
    render(
      <CalloutContext.Provider value={{ sendCallout: () => {} }}>
        <RequestsRoute {...props} />
      </CalloutContext.Provider>,
    );
  };

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
    it('exportCsv function to be called when ui-requests.exportSearchResultsToCsv button clicked', async () => {
      userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportSearchResultsToCsv' }));
      await waitFor(() => {
        expect(exportCsv).toBeCalled();
      });
    });
    it('ErrorModel model should render', () => {
      userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportExpiredHoldShelfToCsv' }));
      expect(screen.queryByText('ErrorModel')).toBeInTheDocument();
    });
    it('ErrorModel model should close on clicking close Button', () => {
      userEvent.click(screen.getByRole('button', { name: 'ui-requests.exportExpiredHoldShelfToCsv' }));
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
});
