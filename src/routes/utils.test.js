import { getFormattedYears } from './utils';

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
    }])).toBe('2020, 2000, 1992');
  });
});
