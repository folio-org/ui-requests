import { cloneDeep } from 'lodash';

import {
  requestPrintStatusType,
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

export const filterRecordsByPrintStatus = (records, printStatusFilters) => {
  const isPrintedFilterSelected = printStatusFilters[0] === requestPrintStatusType.PRINTED;
  return records.filter(record => {
    const hasCopiesCount = record?.printDetails?.count !== undefined;

    return isPrintedFilterSelected ? hasCopiesCount : !hasCopiesCount;
  });
};

export const getPrintStatusFilteredData = (resources, printStatusFilters) => {
  const clonedResources = cloneDeep(resources);
  const filteredRecords = filterRecordsByPrintStatus(clonedResources.records.records, printStatusFilters);

  clonedResources.records.records = filteredRecords;
  clonedResources.records.other.totalRecords = filteredRecords.length;

  return clonedResources;
};
