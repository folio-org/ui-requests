import { cloneDeep } from 'lodash';
import {
  requestPrintStatusType,
  requestStatuses,
  requestTypesMap,
} from '../constants';
import {
  getFormattedYears,
  getFormattedPublishers,
  getFormattedContributors,
  isReorderableRequest,
  getStatusQuery,
  getFullNameForCsvRecords,
  filterRecordsByPrintStatus,
  getPrintStatusFilteredData,
} from './utils';

describe('utils', () => {
  describe('getFormattedYears', () => {
    it('should format correctly when publications are not passed', () => {
      expect(getFormattedYears()).toBe('');
    });

    it('should format correctly when there are no publications', () => {
      expect(getFormattedYears([])).toBe('');
    });

    it('should format correctly when publications have incorrect date of publication values', () => {
      expect(getFormattedYears([{}, {
        dateOfPublication: '0991',
      }, {
        dateOfPublication: ' 1992',
      }, {
        dateOfPublication: '1993 ',
      }, {
        dateOfPublication: 'notNumberValue',
      }, {
        dateOfPublication: '1994ParticallyNumberValue',
      }])).toBe('');
    });

    it('should format correctly when publications have correct date of publication values', () => {
      expect(getFormattedYears([{
        dateOfPublication: '1991',
      }, {
        dateOfPublication: '2000',
      }, {
        dateOfPublication: '1992',
      }, {
        dateOfPublication: '1990',
      }, {
        dateOfPublication: '2020',
      }])).toBe('2020, 2000, 1992, 1991, 1990');
    });

    it('should format correctly when limit is passed', () => {
      expect(getFormattedYears([{
        dateOfPublication: '1991',
      }, {
        dateOfPublication: '2000',
      }, {
        dateOfPublication: '1992',
      }, {
        dateOfPublication: '1990',
      }, {
        dateOfPublication: '2020',
      }], 3)).toBe('2020, 2000, 1992');
    });
  });

  describe('getFormattedPublishers', () => {
    it('should format correctly when publications are not passed', () => {
      expect(getFormattedPublishers()).toBe('');
    });

    it('should format correctly when there are no publications', () => {
      expect(getFormattedPublishers([])).toBe('');
    });

    it('should format correctly when publisher is not passed', () => {
      expect(getFormattedPublishers([{}])).toBe('');
    });

    it('should format correctly when there are multiple publishers', () => {
      expect(getFormattedPublishers([{
        publisher: 'Pavel',
      }, {
        publisher: 'Dmitry',
      }, {
        publisher: 'Alina',
      }])).toBe('Pavel');
    });
  });

  describe('getFormattedContributors', () => {
    it('should format correctly when contributors are not passed', () => {
      expect(getFormattedContributors()).toBe('');
    });

    it('should format correctly when there are no contributors', () => {
      expect(getFormattedContributors([])).toBe('');
    });

    it('should format correctly when contributor name is not passed', () => {
      expect(getFormattedContributors([{}])).toBe('');
    });

    it('should format correctly when there are multiple contributors', () => {
      expect(getFormattedContributors([{
        name: 'Pavel',
      }, {
        name: 'Dmitry',
      }, {
        name: 'Alina',
      }])).toBe('Pavel');
    });
  });

  describe('isReorderableRequest', () => {
    it('should return false if requestType is "Page"', () => {
      const request = {
        requestType: requestTypesMap.PAGE,
        status: requestStatuses.NOT_YET_FILLED,
      };

      expect(isReorderableRequest(request)).toBe(false);
    });

    it('should return false if status is not "Open - Not yet filled"', () => {
      const request = {
        requestType: requestTypesMap.HOLD,
        status: requestStatuses.AWAITING_PICKUP,
      };

      expect(isReorderableRequest(request)).toBe(false);
    });

    it('should return true if requestType is not "Page" and status is "Open - Not yet filled"', () => {
      const request = {
        requestType: requestTypesMap.HOLD,
        status: requestStatuses.NOT_YET_FILLED,
      };

      expect(isReorderableRequest(request)).toBe(true);
    });
  });

  describe('getStatusQuery', () => {
    it('should return query string', () => {
      const statusesList = ['test', 'test_2'];
      const expectedResult = 'status=="test" or status=="test_2"';

      expect(getStatusQuery(statusesList)).toBe(expectedResult);
    });

    it('should return empty string', () => {
      expect(getStatusQuery()).toBe('');
    });
  });

  describe('getFullNameForCsvRecords', () => {
    it('should return full name when all parts are provided', () => {
      const record = {
        firstName: 'firstName',
        middleName: 'middleName',
        lastName: 'lastName',
      };
      expect(getFullNameForCsvRecords(record)).toBe('firstName middleName lastName');
    });

    it('should return first and last name when middle name is missing', () => {
      const record = {
        firstName: 'firstName',
        lastName: 'lastName',
      };
      expect(getFullNameForCsvRecords(record)).toBe('firstName lastName');
    });

    it('should return middle and last name when first name is missing', () => {
      const record = {
        middleName: 'middleName',
        lastName: 'lastName',
      };
      expect(getFullNameForCsvRecords(record)).toBe('middleName lastName');
    });

    it('should return empty string when all name parts are missing', () => {
      const record = {};
      expect(getFullNameForCsvRecords(record)).toBe('');
    });
  });

  describe('filterRecordsByPrintStatus', () => {
    const records = [
      { id: 'a', printDetails: { count: 5 } },
      { id: 'b', printDetails: null },
      { id: 'c', printDetails: undefined },
    ];

    it('should filter and return only printed records when PRINTED filter is selected', () => {
      const printStatusFilters = [requestPrintStatusType.PRINTED];
      const result = filterRecordsByPrintStatus(records, printStatusFilters);
      expect(result).toEqual([
        { id: 'a', printDetails: { count: 5 } }
      ]);
    });

    it('should filter and return only non-printed records when NOT_PRINTED filter is selected', () => {
      const printStatusFilters = [requestPrintStatusType.NOT_PRINTED];
      const result = filterRecordsByPrintStatus(records, printStatusFilters);
      expect(result).toEqual([
        { id: 'b', printDetails: null },
        { id: 'c', printDetails: undefined }
      ]);
    });
  });

  describe('getPrintStatusFilteredData', () => {
    const resources = {
      records: {
        records: [
          { id: 1, printDetails: { count: 5 } },
          { id: 2, printDetails: null },
          { id: 3, printDetails: undefined },
        ],
        other: {
          totalRecords: 3
        }
      }
    };

    it('should return resources with only printed records when PRINTED filter is selected', () => {
      const printStatusFilters = [requestPrintStatusType.PRINTED];
      const result = getPrintStatusFilteredData(resources, printStatusFilters);

      expect(result.records.records).toEqual([
        { id: 1, printDetails: { count: 5 } }
      ]);
      expect(result.records.other.totalRecords).toBe(1);
    });

    it('should return resources with only non-printed records when NOT_PRINTED filter is selected', () => {
      const printStatusFilters = [requestPrintStatusType.NOT_PRINTED];
      const result = getPrintStatusFilteredData(resources, printStatusFilters);

      expect(result.records.records).toEqual([
        { id: 2, printDetails: null },
        { id: 3, printDetails: undefined }
      ]);
      expect(result.records.other.totalRecords).toBe(2);
    });

    it('should not modify the original resources object', () => {
      const printStatusFilters = [requestPrintStatusType.PRINTED];
      const clonedResources = cloneDeep(resources);

      getPrintStatusFilteredData(resources, printStatusFilters);

      expect(resources).toEqual(clonedResources);
    });
  });
});
