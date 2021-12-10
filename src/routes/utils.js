const YEAR_SEPARATOR = ', ';
const DISPLAYED_YEARS_AMOUNT = 3;
const YEAR_REGEX = /^([1-9][0-9]{0,3})$/;

const isYear = (value) => YEAR_REGEX.test(value);

// eslint-disable-next-line import/prefer-default-export
export const getFormattedYears = (publications) => {
  const years = publications
    ?.map(({ dateOfPublication }) => dateOfPublication)
    .filter((year) => isYear(year));

  return years?.length
    ? years
      .map((year) => parseInt(year, 10))
      .sort((a, b) => b - a)
      .slice(0, DISPLAYED_YEARS_AMOUNT)
      .join(YEAR_SEPARATOR)
    : '';
};
