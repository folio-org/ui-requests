import {
  escape,
} from 'lodash';
import '../test/jest/__mock__';

import {
  buildTemplate,
  createUserHighlightBoxLink,
  duplicateRequest,
  escapeValue,
  getTlrSettings,
  getRequestLevelValue,
  getInstanceRequestTypeOptions,
  getInstanceQueryString,
  generateUserName,
  handleKeyCommand,
  isValidRequest,
  memoizeValidation,
} from './utils';

import {
  INVALID_REQUEST_HARDCODED_ID,
  itemStatuses,
  requestTypesMap,
  REQUEST_LEVEL_TYPES,
  REQUEST_TYPES,
} from './constants';

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

  describe('adjusts request type if necessary', () => {
    it('leaves request type if it is valid for item type', () => {
      const r = {
        monkey: 'bagel',
        requestType: requestTypesMap.RECALL,
        item: { status: itemStatuses.CHECKED_OUT },
      };
      const duped = duplicateRequest(r);
      expect(duped.requestType).toBe(requestTypesMap.RECALL);
    });

    it('changes request type if it is invalid for item-status', () => {
      const r = {
        monkey: 'bagel',
        requestType: requestTypesMap.RECALL,
        item: { status: itemStatuses.AVAILABLE },
      };
      const duped = duplicateRequest(r);
      expect(duped.requestType).toBe(requestTypesMap.PAGE);
    });

    it('omits request type if it is invalid for item-status', () => {
      const r = {
        monkey: 'bagel',
        requestType: requestTypesMap.RECALL,
        item: { status: itemStatuses.AGED_TO_LOST },
      };
      const duped = duplicateRequest(r);
      expect(duped.requestType).toBeUndefined();
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

describe('getInstanceRequestTypeOptions', () => {
  it('should return `Page`, `HOLD` and `RECALL` request type for instance request', () => {
    const expectedResult = [
      REQUEST_TYPES[requestTypesMap.PAGE],
      REQUEST_TYPES[requestTypesMap.HOLD],
      REQUEST_TYPES[requestTypesMap.RECALL],
    ];

    expect(getInstanceRequestTypeOptions()).toEqual(expectedResult);
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
  it('Should return full name', () => {
    const firstName = 'Bob';
    const lastName = 'Marley';
    const middleName = 'Test';

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(`${lastName}, ${firstName} ${middleName}`);
  });

  it('Should return last name and first name', () => {
    const firstName = 'Bob';
    const lastName = 'Marley';
    const middleName = undefined;

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(`${lastName}, ${firstName}`);
  });

  it('Should return last name only', () => {
    const firstName = undefined;
    const lastName = 'Marley';
    const middleName = undefined;

    expect(generateUserName({ firstName, lastName, middleName }))
      .toEqual(lastName);
  });

  it('Should return last name only if lastName and middleName presented', () => {
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


// see ui-checkin/src/util.test.js for a template
// that can largely be copy-pasted here
// describe('convertToSlipData', () => {
// });
