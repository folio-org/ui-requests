import {
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
  updateQuerySortString,
  getPrintedDetails,
  getPrintHoldRequestsEnabled,
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

    it('should return an empty string if the record is missing', () => {
      expect(getFullNameForCsvRecords()).toBe('');
    });
  });

  describe('updateQuerySortString', () => {
    it('should return the same string if no removable substrings are present', () => {
      const prop = 'title,requestDate';
      const expectedOutput = 'title,requestDate';
      expect(updateQuerySortString(prop)).toBe(expectedOutput);
    });

    it('should remove removable substrings and return non-removable substrings', () => {
      const prop = 'title,printed';
      const expectedOutput = 'title';
      expect(updateQuerySortString(prop)).toBe(expectedOutput);
    });

    it('should return "requestDate" when only removable substrings are present', () => {
      const prop = 'printed,copies';
      const expectedOutput = 'requestDate';
      expect(updateQuerySortString(prop)).toBe(expectedOutput);
    });
  });

  describe('getPrintedDetails', () => {
    it('should return full name when printEventDate is not passed', () => {
      const record = {
        printDetails: {
          lastPrintRequester: { firstName: 'John', lastName: 'Doe' },
        },
      };

      expect(getPrintedDetails(record)).toBe('John Doe');
    });

    it('should return printEventDate when when there is no full name', () => {
      const record = {
        printDetails: {
          lastPrintRequester: {},
          printEventDate: 'date1',
        },
      };

      expect(getPrintedDetails(record)).toBe('date1');
    });

    it('should return formatted string with full name and last printed date', () => {
      const record = {
        printDetails: {
          lastPrintRequester: { firstName: 'John', lastName: 'Doe' },
          printEventDate: 'date1',
        },
      };

      expect(getPrintedDetails(record)).toBe('John Doe, date1');
    });
  });

  describe('getPrintHoldRequestsEnabled', () => {
    it('should return false if input is undefined', () => {
      expect(getPrintHoldRequestsEnabled()).toBe(false);
    });

    it('should return false if records is missing', () => {
      expect(getPrintHoldRequestsEnabled({})).toBe(false);
    });

    it('should return false if records array is empty', () => {
      expect(getPrintHoldRequestsEnabled({ records: [] })).toBe(false);
    });

    it('should return false if value is missing in records[0]', () => {
      expect(getPrintHoldRequestsEnabled({ records: [{}] })).toBe(false);
    });

    it('should return false if printHoldRequestsEnabled is missing in value', () => {
      expect(getPrintHoldRequestsEnabled({ records: [{ value: {} }] })).toBe(false);
    });

    it('should return true if printHoldRequestsEnabled is true', () => {
      expect(getPrintHoldRequestsEnabled({ records: [{ value: { printHoldRequestsEnabled: true } }] })).toBe(true);
    });

    it('should return false if printHoldRequestsEnabled is false', () => {
      expect(getPrintHoldRequestsEnabled({ records: [{ value: { printHoldRequestsEnabled: false } }] })).toBe(false);
    });
  });
});
