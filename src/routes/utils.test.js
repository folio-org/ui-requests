import {
  requestStatuses,
  requestTypesMap,
} from '../constants';
import {
  getFormattedYears,
  getFormattedPublishers,
  getFormattedContributors,
  isReorderableRequest,
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
});
