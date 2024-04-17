import {
  escape,
  noop,
} from 'lodash';

import {
  buildTemplate,
  createUserHighlightBoxLink,
  convertToSlipData,
  buildLocaleDateAndTime,
  duplicateRequest,
  escapeValue,
  getTlrSettings,
  getRequestLevelValue,
  getInstanceQueryString,
  generateUserName,
  handleKeyCommand,
  isValidRequest,
  memoizeValidation,
  getFulfillmentTypeOptions,
  getDefaultRequestPreferences,
  getFulfillmentPreference,
  isDeliverySelected,
  getSelectedAddressTypeId,
  getProxy,
  isSubmittingButtonDisabled,
  isFormEditing,
  getRequestErrorMessage,
  resetFieldState,
  getRequestTypeOptions,
  isVirtualItem,
  getSelectedSlipData,
  getSelectedSlipDataMulti,
  selectedRowsNonPrintable,
  isPrintable,
  getNextSelectedRowsState,
} from './utils';

import {
  INVALID_REQUEST_HARDCODED_ID,
  REQUEST_LEVEL_TYPES,
  fulfillmentTypeMap,
  requestTypeOptionMap,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
  REQUEST_ERROR_MESSAGE_CODE,
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
} from './constants';

const pickSlipsForSinglePrint = [
  {
    request: {
      requestID: '123',
    },
  },
  {
    request: {
      requestID: '456',
    },
  },
];
const pickSlipsDataForSinglePrint = [
  {
    'request.requestID': '1',
  },
  {
    'request.requestID': '2',
  },
  {
    'request.requestID': '3',
  },
];
const pickSlipsDataWithRequest = [
  {
    'request.requestID': '1',
    data: 'slip1',
  },
  {
    'request.requestID': '2',
    data: 'slip2',
  },
  {
    'request.requestID': '3',
    data: 'slip3',
  },
];
const rowForSinglePrint = {
  id: 1,
  name: 'John Doe',
};

describe('escapeValue', () => {
  it('escapes values', () => {
    const input = '<monkey>value</monkey>';

    expect(escapeValue(input)).toEqual(escape(input));
  });

  it('does not escape "<Barcode>" values', () => {
    const input = '<Barcode>value</Barcode>';

    expect(escapeValue(input)).toEqual(input);
  });
});

describe('buildTemplate', () => {
  it('substitutes strings and numbers', () => {
    const t = buildTemplate('{{a}}, {{b}}! {{a}}, {{b}}! And {{c}} and {{c}}');
    const v = t({ a: 1, b: 2, c: 'through' });

    expect(v).toEqual('1, 2! 1, 2! And through and through');
  });

  it('elides other types ', () => {
    const t = buildTemplate('The {{a}}{{b}}{{c}}vorpal blade went snicker-snack!');
    const v = t({
      a: Boolean(true),
      b: { key: 'value' },
      c: () => 'function',
    });

    expect(v).toEqual('The vorpal blade went snicker-snack!');
  });
});

describe('createUserHighlightBoxLink', () => {
  it('returns a link given values', () => {
    const text = 't';
    const id = 'id';
    const c = createUserHighlightBoxLink(text, id);

    expect(c.props.to).toMatch(`/users/view/${id}`);
    expect(c.props.children).toMatch(text);
  });

  it('returns empty string given no values', () => {
    const text = createUserHighlightBoxLink('', '');
    expect(text).toMatch('');
  });
});

describe('duplicateRequest', () => {
  it('omits non-cloneable attributes', () => {
    const r = {
      monkey: 'bagel',
      requestType: 'r',
      cancellationAdditionalInformation: '',
      cancellationReasonId: '',
      cancelledByUserId: '',
      cancelledDate: '',
      holdShelfExpirationDate: '',
      id: '',
      metadata: '',
      position: '',
      proxy: '',
      proxyUserId: '',
      requestCount: '',
      requester: '',
      requesterId: '',
      status: '',
    };
    const duped = duplicateRequest(r);

    const omit = [
      'cancellationAdditionalInformation',
      'cancellationReasonId',
      'cancelledByUserId',
      'cancelledDate',
      'holdShelfExpirationDate',
      'id',
      'metadata',
      'position',
      'proxy',
      'proxyUserId',
      'requestCount',
      'requester',
      'requesterId',
      'status',
    ];

    omit.forEach(i => {
      expect(duped).not.toHaveProperty(i);
    });
  });
});

describe('getTlrSettings', () => {
  const defaultSettings = {
    titleLevelRequestsFeatureEnabled: true,
    createTitleLevelRequestsByDefault: false,
  };

  it('should return parsed settings', () => {
    expect(getTlrSettings(JSON.stringify(defaultSettings))).toEqual(defaultSettings);
  });

  it('should return empty object if nothing passed', () => {
    expect(getTlrSettings()).toEqual({});
  });

  it('should return empty object if invalid settings passed', () => {
    expect(getTlrSettings("{'foo': 1}")).toEqual({});
  });
});

describe('getRequestLevelValue', () => {
  it('should return `Title` if true is passed', () => {
    expect(getRequestLevelValue(true)).toBe(REQUEST_LEVEL_TYPES.TITLE);
  });

  it('should return `Item` if false is passed', () => {
    expect(getRequestLevelValue(false)).toBe(REQUEST_LEVEL_TYPES.ITEM);
  });
});

describe('getInstanceQueryString', () => {
  const hrid = 'hrid';
  const id = 'instanceId';

  it('should return correct query string if both values are passed', () => {
    const expectedResult = `("hrid"=="${hrid}" or "id"=="${id}")`;

    expect(getInstanceQueryString(hrid, id)).toBe(expectedResult);
  });

  it('should return correct query string if only `hrid` value is passed', () => {
    const expectedResult = `("hrid"=="${hrid}" or "id"=="${hrid}")`;

    expect(getInstanceQueryString(hrid)).toBe(expectedResult);
  });

  it('should return correct query string if only `id` value is passed', () => {
    const expectedResult = `("hrid"=="${id}" or "id"=="${id}")`;

    expect(getInstanceQueryString(id)).toBe(expectedResult);
  });
});

describe('generateUserName', () => {
  it('should return full name', () => {
    const firstName = 'Bob';
    const lastName = 'Marley';
    const middleName = 'Test';

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(`${lastName}, ${firstName} ${middleName}`);
  });

  it('should return last name and first name', () => {
    const firstName = 'Bob';
    const lastName = 'Marley';
    const middleName = undefined;

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(`${lastName}, ${firstName}`);
  });

  it('should return last name only', () => {
    const firstName = undefined;
    const lastName = 'Marley';
    const middleName = undefined;

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(lastName);
  });

  it('should return last name only if lastName and middleName presented', () => {
    const firstName = undefined;
    const lastName = 'Marley';
    const middleName = 'Test';

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(lastName);
  });
});

describe('handlekeycommand', () => {
  const event = {
    preventDefault: jest.fn(),
  };
  const handler = jest.fn();

  afterEach(() => {
    event.preventDefault.mockClear();
    handler.mockClear();
  });

  it('should call handler function and preventDefault', () => {
    handleKeyCommand(handler)(event);
    expect(handler).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call handler function when disabled is true', () => {
    handleKeyCommand(handler, { disabled: true })(event);
    expect(handler).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not call preventDefault when event is not passed', () => {
    handleKeyCommand(handler)();
    expect(handler).toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});

describe('isValidRequest', () => {
  it('should return true if request is valid', () => {
    const request = {
      instanceId: 'testInstanceId',
      holdingsRecordId: 'testHoldingRecordId',
    };

    expect(isValidRequest(request)).toBe(true);
  });

  it('should return false if "instanceId" in request have hardcoded invalid value', () => {
    const request = {
      instanceId: INVALID_REQUEST_HARDCODED_ID,
      holdingsRecordId: 'testHoldingRecordId',
    };

    expect(isValidRequest(request)).toBe(false);
  });

  it('should return false if "holdingsRecordId" in request have hardcoded invalid value', () => {
    const request = {
      instanceId: 'testInstanceId',
      holdingsRecordId: INVALID_REQUEST_HARDCODED_ID,
    };

    expect(isValidRequest(request)).toBe(false);
  });

  it('should return false if "instanceId" and "holdingsRecordId" in request have hardcoded invalid value', () => {
    const request = {
      instanceId: INVALID_REQUEST_HARDCODED_ID,
      holdingsRecordId: INVALID_REQUEST_HARDCODED_ID,
    };

    expect(isValidRequest(request)).toBe(false);
  });
});

describe('isVirtualItem', () => {
  it('should return true if item is virtual', () => {
    expect(isVirtualItem(DCB_INSTANCE_ID, DCB_HOLDINGS_RECORD_ID)).toBe(true);
  });

  it('should return false if "holdingsRecordId" in request have hardcoded invalid value', () => {
    expect(isVirtualItem(DCB_INSTANCE_ID, 'testHoldingRecordId')).toBe(false);
  });

  it('should return false if "instanceId" in request have hardcoded invalid value', () => {
    expect(isVirtualItem('testInstanceId', DCB_HOLDINGS_RECORD_ID)).toBe(false);
  });

  it('should return false if "instanceId" and "holdingsRecordId" in request have hardcoded invalid value', () => {
    expect(isVirtualItem('testInstanceId', 'testHoldingRecordId')).toBe(false);
  });
});

describe('memoizeValidation', () => {
  const result1 = 'result 1';
  const fn = jest.fn(() => result1);
  const fieldName = 'item.barcode';
  const key1 = 0;
  const key2 = 1;
  const arg = '123';

  beforeEach(() => {
    fn.mockClear();
  });

  describe('memoized function', () => {
    it('should be invoked when the `arg !== lastArg`', () => {
      memoizeValidation(fn)(fieldName, key1)(arg);
      expect(fn).toBeCalledWith(arg);
    });

    it('should be invoked when the `key !== lastKey && arg === lastArg`', () => {
      memoizeValidation(fn)(fieldName, key2)(arg);
      expect(fn).toBeCalledWith(arg);
    });

    describe('when `key === lastKey && arg === lastArg`', () => {
      let result;

      beforeEach(() => {
        const returnedFunc = memoizeValidation(fn);
        returnedFunc(fieldName, key1)(arg);
        result = returnedFunc(fieldName, key1)(arg);
      });

      it('should be invoked one time only', () => {
        expect(fn).toBeCalledTimes(1);
      });

      it('should return the cashed result', () => {
        expect(result).toBe(result1);
      });
    });
  });
});

describe('getFulfillmentTypeOptions', () => {
  const fulfillmentTypes = [
    {
      label: 'test',
      id: 'test',
    },
    {
      label: 'test_2',
      id: fulfillmentTypeMap.DELIVERY,
    },
  ];

  describe('when "hasDelivery" is true', () => {
    it('should return not filtered "fulfillmentTypeOptions"', () => {
      const expectedResult = [
        {
          labelTranslationPath: fulfillmentTypes[0].label,
          value: fulfillmentTypes[0].id,
        },
        {
          labelTranslationPath: fulfillmentTypes[1].label,
          value: fulfillmentTypes[1].id,
        }
      ];

      expect(getFulfillmentTypeOptions(true, fulfillmentTypes)).toEqual(expectedResult);
    });
  });

  describe('when "hasDelivery" is false', () => {
    it('should return filtered "fulfillmentTypeOptions"', () => {
      const expectedResult = [
        {
          labelTranslationPath: fulfillmentTypes[0].label,
          value: fulfillmentTypes[0].id,
        }
      ];

      expect(getFulfillmentTypeOptions(false, fulfillmentTypes)).toEqual(expectedResult);
    });
  });
});

describe('getDefaultRequestPreferences', () => {
  describe('when "pickupServicePointId" and "deliveryAddressTypeId" are presented', () => {
    it('should return correct data', () => {
      const request = {
        pickupServicePointId: 'id',
      };
      const initialValues = {
        deliveryAddressTypeId: 'id',
      };
      const expectedResult = {
        hasDelivery: false,
        requestPreferencesLoaded: false,
        defaultDeliveryAddressTypeId: '',
        defaultServicePointId: request.pickupServicePointId,
        deliverySelected: false,
        selectedAddressTypeId: initialValues.deliveryAddressTypeId,
      };

      expect(getDefaultRequestPreferences(request, initialValues)).toEqual(expectedResult);
    });
  });

  describe('when "pickupServicePointId" and "deliveryAddressTypeId" are not presented', () => {
    it('should return correct data', () => {
      const expectedResult = {
        hasDelivery: false,
        requestPreferencesLoaded: false,
        defaultDeliveryAddressTypeId: '',
        defaultServicePointId: '',
        deliverySelected: false,
        selectedAddressTypeId: '',
      };

      expect(getDefaultRequestPreferences({}, {})).toEqual(expectedResult);
    });
  });
});

describe('getFulfillmentPreference', () => {
  describe('when "requesterId" equals "userId"', () => {
    const fulfillmentPreference = 'fulfillmentPreference';
    const initialValues = {
      requesterId: 'id',
      fulfillmentPreference,
    };
    const preferences = {
      userId: 'id'
    };

    it('should return "fulfillmentPreference"', () => {
      expect(getFulfillmentPreference(preferences, initialValues)).toEqual(fulfillmentPreference);
    });
  });

  describe('when "requesterId" is not equal "userId"', () => {
    const fulfillment = 'fulfillment';
    const initialValues = {
      requesterId: 'requesterId',
    };
    const preferences = {
      userId: 'userId',
      fulfillment,
    };

    it('should return "fulfillment"', () => {
      expect(getFulfillmentPreference(preferences, initialValues)).toEqual(fulfillment);
    });
  });
});

describe('isDeliverySelected', () => {
  it('should return true', () => {
    expect(isDeliverySelected(fulfillmentTypeMap.DELIVERY)).toBe(true);
  });

  it('should return false', () => {
    expect(isDeliverySelected('test')).toBe(false);
  });
});

describe('getSelectedAddressTypeId', () => {
  it('should return "defaultDeliveryAddressTypeId"', () => {
    const defaultDeliveryAddressTypeId = 'id';

    expect(getSelectedAddressTypeId(true, defaultDeliveryAddressTypeId)).toEqual(defaultDeliveryAddressTypeId);
  });

  it('should return empty string', () => {
    expect(getSelectedAddressTypeId(false)).toEqual('');
  });
});

describe('getProxy', () => {
  describe('when "request" and "proxy" are not presented', () => {
    it('should return null', () => {
      expect(getProxy()).toBeNull();
    });
  });

  describe('when "request" is presented and "proxy" is not presented', () => {
    const request = {
      proxy: {
        test: 'test',
      },
      proxyUserId: 'id',
    };

    it('should return correct data', () => {
      const expectedResult = {
        ...request.proxy,
        id: request.proxyUserId,
      };

      expect(getProxy(request, {})).toEqual(expectedResult);
    });
  });

  describe('when "request" is not presented and "proxy" is presented', () => {
    const proxy = {
      test: 'test',
      id: 'id',
    };

    it('should return correct data', () => {
      const expectedResult = {
        ...proxy,
        id: proxy.id,
      };

      expect(getProxy(undefined, proxy)).toEqual(expectedResult);
    });
  });
});

describe('isSubmittingButtonDisabled', () => {
  describe('when "pristine" is true and "submitting" is false', () => {
    it('should return true', () => {
      expect(isSubmittingButtonDisabled(true, false)).toBe(true);
    });
  });

  describe('when "pristine" is false and "submitting" is true', () => {
    it('should return true', () => {
      expect(isSubmittingButtonDisabled(false, true)).toBe(true);
    });
  });

  describe('when "pristine" is true and "submitting" is true', () => {
    it('should return true', () => {
      expect(isSubmittingButtonDisabled(true, true)).toBe(true);
    });
  });

  describe('when "pristine" is false and "submitting" is false', () => {
    it('should return true', () => {
      expect(isSubmittingButtonDisabled(false, false)).toBe(false);
    });
  });
});

describe('isFormEditing', () => {
  describe('when "id" is presented', () => {
    it('should return true', () => {
      expect(isFormEditing({ id: 'id' })).toBe(true);
    });
  });

  describe('when "id" is not presented', () => {
    it('should return true', () => {
      expect(isFormEditing({})).toBe(false);
    });
  });
});

describe('getNextSelectedRowsState', () => {
  it('should add a row to selectedRows if not selected', () => {
    const selectedRows = {};
    const result = getNextSelectedRowsState(selectedRows, rowForSinglePrint);

    expect(result).toEqual({ [rowForSinglePrint.id]: rowForSinglePrint });
  });

  it('should remove a row from selectedRows if already selected', () => {
    const selectedRows = { [rowForSinglePrint.id]: rowForSinglePrint };
    const result = getNextSelectedRowsState(selectedRows, rowForSinglePrint);

    expect(result).toEqual({});
  });

  it('should not mutate the original selectedRows object', () => {
    const selectedRows = { [rowForSinglePrint.id]: rowForSinglePrint };
    const result = getNextSelectedRowsState(selectedRows, rowForSinglePrint);

    expect(selectedRows).toEqual({ [rowForSinglePrint.id]: rowForSinglePrint });
    expect(result).not.toBe(selectedRows);
  });
});
describe('isPrintable', () => {
  it('should return true when pickSlips contain a match for requestId', () => {
    const requestId = '123';
    const result = isPrintable(requestId, pickSlipsForSinglePrint);

    expect(result).toBe(true);
  });

  it('should return false when pickSlips do not contain a match for requestId', () => {
    const requestId = '789';
    const result = isPrintable(requestId, pickSlipsForSinglePrint);

    expect(result).toBe(false);
  });

  it('should return false when pickSlips is undefined', () => {
    const requestId = '123';
    const pickSlipsUndefined = undefined;
    const result = isPrintable(requestId, pickSlipsUndefined);

    expect(result).toBe(false);
  });
});

describe('getSelectedSlipData', () => {
  const pickSlipsData = [
    {
      'request.requestID': 1,
      data: 'some data 1',
    },
    {
      'request.requestID': 2,
      data: 'some data 2',
    },
    {
      'request.requestID': 3,
      data: 'some data 3',
    },
  ];

  it('should return an empty array if selectedRequestId is not found', () => {
    const selectedRequestId = 999;
    const result = getSelectedSlipData(pickSlipsData, selectedRequestId);

    expect(result).toEqual([]);
  });

  it('should return an array with the selected slip data if found', () => {
    const selectedRequestId = 2;
    const result = getSelectedSlipData(pickSlipsData, selectedRequestId);
    const expectedResult = [
      {
        'request.requestID': 2,
        data: 'some data 2',
      }
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should return an array even if only one matching slip is found', () => {
    const selectedRequestId = 3;
    const result = getSelectedSlipData(pickSlipsData, selectedRequestId);
    const expectedResult = [
      {
        'request.requestID': 3,
        data: 'some data 3',
      }
    ];

    expect(result).toEqual(expectedResult);
  });

  it('should handle an empty pickSlipsData array', () => {
    const selectedRequestId = 1;
    const result = getSelectedSlipData([], selectedRequestId);

    expect(result).toEqual([]);
  });
});

describe('selectedRowsNonPrintable', () => {
  it('should return true when selectedRows is empty', () => {
    const selectedRows = {};
    const result = selectedRowsNonPrintable(pickSlipsDataForSinglePrint, selectedRows);

    expect(result).toBe(true);
  });

  it('should return true when no matching rows are selected', () => {
    const selectedRows = {
      '4': true,
      '5': true,
    };
    const result = selectedRowsNonPrintable(pickSlipsDataForSinglePrint, selectedRows);

    expect(result).toBe(true);
  });

  it('should return false when at least one matching row is selected', () => {
    const selectedRows = {
      '2': true,
      '4': true,
    };
    const result = selectedRowsNonPrintable(pickSlipsDataWithRequest, selectedRows);

    expect(result).toBe(false);
  });
});

describe('getSelectedSlipDataMulti', () => {
  it('should return an empty array when selectedRows is empty', () => {
    const pickSlipsData = [
      {
        'request.requestID': '1',
      },
      {
        'request.requestID': '2',
      },
    ];
    const selectedRows = {};
    const result = getSelectedSlipDataMulti(pickSlipsData, selectedRows);

    expect(result).toEqual([]);
  });

  it('should return selected pickSlipsData when there are matching entries in selectedRows', () => {
    const selectedRows = {
      '1': true,
      '3': true,
    };
    const result = getSelectedSlipDataMulti(pickSlipsDataWithRequest, selectedRows);

    expect(result).toEqual(
      [
        {
          'request.requestID': '1',
          data: 'slip1',
        },
        {
          'request.requestID': '3',
          data: 'slip3',
        },
      ]
    );
  });

  it('should return an empty array when there are no matching entries in selectedRows', () => {
    const selectedRows = {
      '4': true,
      '5': true,
    };
    const result = getSelectedSlipDataMulti(pickSlipsDataWithRequest, selectedRows);

    expect(result).toEqual([]);
  });
});

describe('convertToSlipData', () => {
  const intl = {
    formatMessage: (o) => o.id,
    formatDate: (d, options) => `${d} ${options.timeZone} ${options.locale}`,
  };
  const tz = 'America/New_York';
  const locale = 'en';

  const item = {
    title: 'The Long Way to a Small, Angry Planet',
    barcode: '036000291452',
    status: 'Paged',
    primaryContributor: 'Chambers, Becky',
    allContributors: 'Chambers, Becky',
    enumeration: 'v.70:no.7-12',
    volume: 'vol.1',
    chronology: '1984:July-Dec.',
    yearCaption: '1984; 1985',
    materialType: 'Book',
    loanType: 'Can Circulate',
    copy: 'cp.2',
    numberOfPieces: '3',
    descriptionOfPieces: 'Description of three pieces',
    effectiveLocationSpecific: '3rd Floor',
    effectiveLocationLibrary: 'Djanogly Learning Resource Centre',
    effectiveLocationCampus: 'Jubilee Campus',
    effectiveLocationInstitution: 'Nottingham University',
    effectiveLocationPrimaryServicePointName: 'Circulation Desk',
    callNumber: '123456',
    callNumberPrefix: 'PREFIX',
    callNumberSuffix: 'SUFFIX',
    displaySummary: 'Display summary',
    lastCheckedInDateTime: '2020-02-17T12:12:33.374Z',
  };
  const request = {
    requestID: 'dd606ca6-a2cb-4723-9a8d-e73b05c42232',
    servicePointPickup: 'Circ Desk 1',
    requestExpirationDate: '2019-07-30T00:00:00.000+03:00',
    holdShelfExpirationDate: '2019-08-31T00:00:00.000+03:00',
    requestDate: '2019-08-31T00:00:00.000+03:00',
    deliveryAddressType: 'Home',
    patronComments: 'Please hurry!',
  };
  const requester = {
    firstName: 'Steven',
    lastName: 'Jones',
    middleName: 'Jacob',
    preferredFirstName: 'Paul',
    patronGroup: 'Undergraduate',
    barcode: '5694596854',
    addressLine1: '16 Main St',
    addressLine2: 'Apt 3a',
    city: 'Northampton',
    region: 'MA',
    postalCode: '01060',
    countryId: 'US',
    departments: 'department1; department2',
  };
  const currentDateTime = '2023-04-28T06:04:54.296Z';
  const pickSlips = [{
    item,
    request,
    requester,
    currentDateTime,
  }];
  const slipData = {
    'staffSlip.Name': 'Pick slip',
    'staffSlip.currentDateTime': buildLocaleDateAndTime(currentDateTime, tz, locale),
    'requester.firstName': 'Steven',
    'requester.lastName': 'Jones',
    'requester.middleName': 'Jacob',
    'requester.preferredFirstName': 'Paul',
    'requester.patronGroup': 'Undergraduate',
    'requester.addressLine1': '16 Main St',
    'requester.addressLine2': 'Apt 3a',
    'requester.country': 'stripes-components.countries.US',
    'requester.city': 'Northampton',
    'requester.stateProvRegion': 'MA',
    'requester.zipPostalCode': '01060',
    'requester.barcode': '5694596854',
    'requester.barcodeImage': '<Barcode>5694596854</Barcode>',
    'requester.departments': 'department1; department2',
    'item.fromServicePoint': undefined,
    'item.toServicePoint': undefined,
    'item.title': 'The Long Way to a Small, Angry Planet',
    'item.primaryContributor': 'Chambers, Becky',
    'item.allContributors': 'Chambers, Becky',
    'item.barcode': '036000291452',
    'item.barcodeImage': '<Barcode>036000291452</Barcode>',
    'item.callNumber': '123456',
    'item.callNumberPrefix': 'PREFIX',
    'item.callNumberSuffix': 'SUFFIX',
    'item.displaySummary': 'Display summary',
    'item.enumeration': 'v.70:no.7-12',
    'item.volume': 'vol.1',
    'item.chronology': '1984:July-Dec.',
    'item.copy': 'cp.2',
    'item.yearCaption': '1984; 1985',
    'item.materialType': 'Book',
    'item.loanType': 'Can Circulate',
    'item.numberOfPieces': '3',
    'item.descriptionOfPieces': 'Description of three pieces',
    'item.lastCheckedInDateTime': buildLocaleDateAndTime('2020-02-17T12:12:33.374Z', tz, locale),
    'item.effectiveLocationInstitution': 'Nottingham University',
    'item.effectiveLocationCampus': 'Jubilee Campus',
    'item.effectiveLocationLibrary': 'Djanogly Learning Resource Centre',
    'item.effectiveLocationSpecific': '3rd Floor',
    'item.effectiveLocationPrimaryServicePointName': 'Circulation Desk',
    'request.servicePointPickup': 'Circ Desk 1',
    'request.deliveryAddressType': 'Home',
    'request.requestExpirationDate': '2019-07-30T00:00:00.000+03:00 America/New_York en',
    'request.holdShelfExpirationDate': '2019-08-31T00:00:00.000+03:00 America/New_York en',
    'request.requestDate': '2019-08-31T00:00:00.000+03:00 America/New_York en',
    'request.requestID': 'dd606ca6-a2cb-4723-9a8d-e73b05c42232',
    'request.patronComments': 'Please hurry!',
  };
  const expectSlipData = [slipData];

  it('substitutes values', () => {
    expect(convertToSlipData(pickSlips, intl, tz, locale)).toEqual(expectSlipData);
  });

  it('should convert to slip data wth empty date', () => {
    const pickSlipsWithEmptyDate = [{
      item,
      request: {
        ...request,
        requestExpirationDate: '',
        holdShelfExpirationDate: '',
      },
      requester: {
        ...requester,
        countryId: '',
      },
      currentDateTime,
    }];
    const expectSlipDataWithEmptyDate = [{
      ...slipData,
      'request.requestExpirationDate': '',
      'request.holdShelfExpirationDate': '',
      'requester.country': '',
    }];

    expect(convertToSlipData(pickSlipsWithEmptyDate, intl, tz, locale)).toEqual(expectSlipDataWithEmptyDate);
  });

  it('handles missing elements', () => {
    const emptySource = [];
    const o = convertToSlipData(emptySource, intl, tz, locale);

    expect(o['requester.country']).toBeUndefined();
    expect(o['request.requestExpirationDate']).toBeUndefined();
    expect(o['request.holdShelfExpirationDate']).toBeUndefined();
  });

  it('handles empty requester barcode', () => {
    const sourceWithoutRequesterBarcode = [{
      ...pickSlips,
      requester: {
        ...pickSlips.requester,
        barcode: noop(),
      },
    }];
    const o = convertToSlipData(sourceWithoutRequesterBarcode, intl, tz, locale);

    expect(o['requester.barcodeImage']).toBeUndefined();
  });

  it('should handle preferred first name when preferred first name is null', () => {
    const pickSlipsWithoutPreferredFirstName = [{
      item,
      request,
      requester: {
        ...requester,
        preferredFirstName: null,
      },
      currentDateTime,
    }];

    const expectSlipDataWithoutPreferredFirstName = [{
      ...slipData,
      'requester.preferredFirstName': 'Steven',
    }];

    expect(convertToSlipData(pickSlipsWithoutPreferredFirstName, intl, tz, locale)).toEqual(expectSlipDataWithoutPreferredFirstName);
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

describe('resetFieldState', () => {
  const form = {
    getRegisteredFields: jest.fn(),
    resetFieldState: jest.fn(),
  };
  const fieldName = 'test';

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('when field exists', () => {
    beforeEach(() => {
      form.getRegisteredFields.mockReturnValue([fieldName]);
      resetFieldState(form, fieldName);
    });

    it('should trigger "getRegisteredFields"', () => {
      expect(form.getRegisteredFields).toHaveBeenCalled();
    });

    it('should trigger "resetFieldState" with correct argument', () => {
      expect(form.resetFieldState).toHaveBeenCalledWith(fieldName);
    });
  });

  describe('when field does not exist', () => {
    beforeEach(() => {
      form.getRegisteredFields.mockReturnValue([]);
      resetFieldState(form, fieldName);
    });

    it('should not trigger "resetFieldState"', () => {
      expect(form.resetFieldState).not.toHaveBeenCalled();
    });
  });
});

describe('getRequestTypeOptions', () => {
  it('should return modified array of request type options', () => {
    const requestTypes = ['Hold'];
    const expectedResult = [
      {
        id: requestTypeOptionMap[requestTypes[0]],
        value: requestTypes[0],
      }
    ];

    expect(getRequestTypeOptions(requestTypes)).toEqual(expectedResult);
  });
});
