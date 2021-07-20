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
  // duplicateRequest,
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
} from './utils';

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



// see ui-checkin/src/util.test.js for a template
// that can largely be copy-pasted here
// describe('convertToSlipData', () => {
// });
