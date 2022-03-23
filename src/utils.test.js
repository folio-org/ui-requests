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
} from './utils';

import {
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
  const missedItem = {
    status: {
      name: itemStatuses.MISSING,
    },
  };
  const availableItem = {
    status: {
      name: itemStatuses.AVAILABLE,
    },
  };
  const checkedOutItem = {
    status: {
      name: itemStatuses.CHECKED_OUT,
    },
  };

  it('should return `Page` request type if at least one available item is present', () => {
    const expectedResult = [
      REQUEST_TYPES[requestTypesMap.PAGE],
    ];

    expect(getInstanceRequestTypeOptions([missedItem, availableItem, checkedOutItem])).toEqual(expectedResult);
  });

  it('should return `Hold` request type if only missing items is present', () => {
    const expectedResult = [
      REQUEST_TYPES[requestTypesMap.HOLD],
    ];

    expect(getInstanceRequestTypeOptions([missedItem])).toEqual(expectedResult);
  });

  it('should return `Hold` and `Recall` request types if no available items and not all of them are missing', () => {
    const expectedResult = [
      REQUEST_TYPES[requestTypesMap.HOLD],
      REQUEST_TYPES[requestTypesMap.RECALL],
    ];

    expect(getInstanceRequestTypeOptions([missedItem, checkedOutItem])).toEqual(expectedResult);
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

    expect(generateUserName(firstName, lastName)).toEqual(`${lastName}, ${firstName}`);
  });

  it('Should return last name', () => {
    const firstName = undefined;
    const lastName = 'Marley';

    expect(generateUserName(firstName, lastName)).toEqual(lastName);
  });
});



// see ui-checkin/src/util.test.js for a template
// that can largely be copy-pasted here
// describe('convertToSlipData', () => {
// });
