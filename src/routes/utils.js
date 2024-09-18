import {
  requestStatuses,
  requestTypesMap,
} from '../constants';

const YEAR_SEPARATOR = ', ';
const YEAR_REGEX = /^([1-9][0-9]{0,3})$/;

const isYear = (value) => YEAR_REGEX.test(value);

// eslint-disable-next-line import/prefer-default-export
export const getFormattedYears = (publications, limit) => {
  const years = publications
    ?.map(({ dateOfPublication }) => dateOfPublication)
    .filter((year) => isYear(year));

  return years?.length
    ? years
      .map((year) => parseInt(year, 10))
      .sort((a, b) => b - a)
      .slice(0, limit)
      .join(YEAR_SEPARATOR)
    : '';
};

export const getFormattedPublishers = (publications) => (
  publications?.find(({ publisher }) => !!publisher)?.publisher ?? ''
);

export const getFormattedContributors = (contributors) => (
  contributors?.find(({ name }) => !!name)?.name ?? ''
);

export const isReorderableRequest = request => {
  return request.status === requestStatuses.NOT_YET_FILLED && request.requestType !== requestTypesMap.PAGE;
};

export const getStatusQuery = (statuses = []) => statuses.reduce((acc, val) => `${acc ? acc + ' or ' : acc}status=="${val}"`, '');

export const getFullNameForCsvRecords = (record) => {
  const { firstName = '', middleName = '', lastName = '' } = record;
  return [firstName, middleName, lastName].filter(Boolean).join(' ');
};

export const processQuerySortString = (str) => {
  const removeSubstrings = ['printed', 'copies', '-copies', '-printed'];
  const remainingParts = str.split(',').filter(part => !removeSubstrings.includes(part));

  return remainingParts.join(',') || '';
};
