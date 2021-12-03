import React from 'react';

import {
  escape,
} from 'lodash';
import '../test/jest/__mock__';

import {
  // buildLocaleDateAndTime,
  buildTemplate,
  // buildUrl,
  // convertToSlipData,
  createUserHighlightBoxLink,
  duplicateRequest,
  escapeValue,
  // formatNoteReferrerEntityData,
  // getFullName,
  // getPatronGroup,
  // getRequestTypeOptions,
  // hasNonRequestableStatus,
  // isDelivery,
  // isNotYetFilled,
  // isPagedItem,
  // isPageRequest,
  // parseErrorMessage,
  // toUserAddress,
  // userHighlightBox,
  getTlrSettings,
  getRequestLevelValue,
} from './utils';

import {
  // requestTypesByItemStatus,
  // requestTypeOptionMap,
  itemStatuses,
  // fulfilmentTypeMap,
  // requestStatuses,
  requestTypesMap,
  // requestTypes,
  REQUEST_LEVEL_TYPES,
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




// see ui-checkin/src/util.test.js for a template
// that can largely be copy-pasted here
// describe('convertToSlipData', () => {
// });
