import React from 'react';
import {
  render,
  fireEvent,
  screen,
} from '@testing-library/react';

import '../../test/jest/__mock__';

import {
  SearchAndSort,
} from '@folio/stripes/smart-components';


import { CommandList, defaultKeyboardShortcuts } from '@folio/stripes/components';

import RequestsRoute, {
  buildHoldRecords,
} from './RequestsRoute';

import {
  duplicateRequest,
  getTlrSettings,
} from '../utils';
import {
  REQUEST_LEVEL_TYPES,
  createModes,
} from '../constants';

jest.mock('../utils', () => ({
  ...jest.requireActual('../utils'),
  duplicateRequest: jest.fn((request) => request),
  getTlrSettings: jest.fn(() => ({})),
}));
jest.mock('../components', () => ({
  ErrorModal: jest.fn(() => null),
  PrintButton: jest.fn(() => null),
  PrintContent: jest.fn(() => null),
  LoadingButton: jest.fn(() => null),
}));

SearchAndSort.mockImplementation(jest.fn(({
  parentResources: { records: { records } },
  detailProps: { onDuplicate },
}) => (
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  <div
    data-testid="searchAndSort"
    onClick={() => onDuplicate(records[0])}
  />
)));

jest.mock('../ViewRequest', () => jest.fn());
jest.mock('../RequestForm', () => jest.fn());

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
  const defaultProps = {
    mutator: {
      pickSlips: {},
      currentServicePoint: {
        update: jest.fn(),
      },
      proxy: {
        reset: jest.fn(),
        GET: jest.fn(),
      },
      query: {
        update: mockedUpdateFunc,
      },
    },
    resources: {
      addressTypes: {
        hasLoaded: true,
      },
      currentServicePoint: {},
      records: {
        hasLoaded: true,
        records: [mockedRequest],
      },
      staffSlips: {
        records: [{ name: 'staffSlipName' }],
      },
      pickSlips: {
        records: [{}],
      },
      configs: {
        records: [{ value: 'testConfig' }],
      },
    },
    stripes: {
      connect: jest.fn(),
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
      user: {},
      timezone: 'timezone',
      locale: 'en-US',
    },
    location: {},
  };

  const defaultExpectedProps = {
    requestType: 'Hold',
    fulfilmentPreference: 'Hold Shelf',
  };

  const renderComponent = (props = defaultProps) => {
    render(
      <CommandList commands={defaultKeyboardShortcuts}>
        <RequestsRoute {...props} />,
      </CommandList>,
    );
  };

  afterEach(() => {
    getTlrSettings.mockClear();
  });

  describe('"TLR" settings should be passed correctly', () => {
    getTlrSettings.mockReturnValueOnce({ createTitleLevelRequestsByDefault: true });

    beforeEach(() => {
      renderComponent(defaultProps);
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

      fireEvent.click(screen.getByTestId('searchAndSort'));

      expect(duplicateRequest).toHaveBeenCalledWith(mockedRequest);
      expect(mockedUpdateFunc).toHaveBeenCalledWith(expectedResultForUpdate);
    });

    it('should pass correct props if `requestLevel` is `Title`', () => {
      mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.TITLE;

      renderComponent(defaultProps);

      fireEvent.click(screen.getByTestId('searchAndSort'));

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
