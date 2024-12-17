import filtersConfig, {
  escapingForSpecialCharactersWhichCanBreakCQL,
} from './RequestsFiltersConfig';

import {
  requestFilterTypes,
} from '../../../constants';

describe('RequestsFiltersConfig', () => {
  it('should have a filter for requestType', () => {
    const requestTypeFilter = filtersConfig.find(f => f.name === 'requestType');
    const expectedResult = {
      name: 'requestType',
      cql: 'requestType',
      values: [],
      operator: '==',
    };

    expect(requestTypeFilter).toEqual(expectedResult);
  });

  it('should have a filter for requestStatus', () => {
    const requestStatusFilter = filtersConfig.find(f => f.name === 'requestStatus');
    const expectedResult = {
      name: 'requestStatus',
      cql: 'status',
      values: [],
      operator: '==',
      label: 'ui-requests.requestMeta.status',
    };

    expect(requestStatusFilter).toEqual(expectedResult);
  });

  it('should have a filter for request levels', () => {
    const requestLevelsFilter = filtersConfig.find(f => f.name === requestFilterTypes.REQUEST_LEVELS);
    const expectedResult = {
      name: 'requestLevels',
      cql: 'requestLevel',
      values: [],
      operator: '==',
    };

    expect(requestLevelsFilter).toEqual(expectedResult);
  });

  it('should return the expected query string for a single tag', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');
    const expectedResult = {
      name: 'tags',
      cql: 'tags.tagList',
      values: [],
      operator: '==',
      parse: expect.any(Function),
    };

    expect(tagsFilter).toEqual(expectedResult);
  });

  it('should return the expected query string for a single tag', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');

    expect(tagsFilter.parse('tag1')).toEqual('(tags.tagList==("*\\"*tag1*\\"*"))');
  });

  it('should return the expected query string for an array of tags', () => {
    const tagsFilter = filtersConfig.find(f => f.name === 'tags');

    expect(tagsFilter.parse(['tag1', 'tag2'])).toEqual('(tags.tagList==("*\\"*tag1*\\"*" or "*\\"*tag2*\\"*"))');
  });

  it('should have a filter for pickup service point', () => {
    const pickupServicePointFilter = filtersConfig.find(f => f.name === requestFilterTypes.PICKUP_SERVICE_POINT);
    const expectedResult = {
      name: 'pickupServicePoints',
      cql: 'pickupServicePointId',
      values: [],
      operator: '==',
    };

    expect(pickupServicePointFilter).toEqual(expectedResult);
  });

  describe('Print Status Filter configuration', () => {
    it('should correctly match the filter configuration for printStatus', () => {
      const printStatusFilter = filtersConfig.find(f => f.name === 'printStatus');
      const expectedResult = {
        name: 'printStatus',
        cql: 'printStatus',
        values: [],
        operator: '==',
        parse: expect.any(Function),
      };

      expect(printStatusFilter).toEqual(expectedResult);
    });

    it('should generate the correct query string for the "Printed" filter', () => {
      const printStatusFilter = filtersConfig.find(f => f.name === 'printStatus');

      expect(printStatusFilter.parse(['Printed'])).toEqual('printDetails.isPrinted==true');
    });

    it('should generate the correct query string for the "Not printed" filter', () => {
      const printStatusFilter = filtersConfig.find(f => f.name === 'printStatus');

      expect(printStatusFilter.parse(['Not printed'])).toEqual('cql.allRecords=1 NOT printDetails.isPrinted=""');
    });

    it('should generate the correct query string for a combination of "Printed" and "Not printed" filters', () => {
      const printStatusFilter = filtersConfig.find(f => f.name === 'printStatus');

      expect(printStatusFilter.parse(['Printed', 'Not printed']))
        .toEqual('(cql.allRecords=1 NOT printDetails.printed="" or printDetails.printed==true)');
    });
  });

  describe('escapingForSpecialCharactersWhichCanBreakCQL', () => {
    it('should return empty string', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL()).toBe('');
    });

    it('should escape \\', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL('\\')).toBe('\\\\');
    });

    it('should escape "', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL('"')).toBe('\\"');
    });

    it('should escape ?', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL('?')).toBe('\\?');
    });

    it('should escape *', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL('*')).toBe('\\*');
    });

    it('should escape special characters in string', () => {
      expect(escapingForSpecialCharactersWhichCanBreakCQL('(test") + [test] * ? \\ (){}[]-_=+<>/?.,~'))
        .toBe('(test\\") + [test] \\* \\? \\\\ (){}[]-_=+<>/\\?.,~');
    });
  });
});
