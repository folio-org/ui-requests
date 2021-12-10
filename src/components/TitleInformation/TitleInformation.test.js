import React from 'react';
import {
  render,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import {
  KeyValue,
} from '@folio/stripes/components';

import TitleInformation, {
  TEXT_SEPARATOR,
  CONTRIBUTOR_SEPARATOR,
  MAX_IDENTIFIERS_COUNT,
  getContributors,
  getEditions,
  getIdentifiers,
} from './TitleInformation';

KeyValue.mockImplementation(jest.fn(() => null));

describe('TitleInformation', () => {
  const instanceId = 'instanceId';
  const titleLevelRequestsCount = 5;
  const title = 'Title';
  const contributors = [{
    name: 'Name 1 LastName 1',
  }, {
    name: 'Name 2 LastName 2',
  }];
  const publications = [{
    dateOfPublication: '2021',
  }];
  const editions = ['edition 1', 'edition 2'];
  const identifiers = [{
    value: 'identifiers 1',
  }, {
    value: 'identifiers 2',
  }, {
    value: 'identifiers 3',
  }, {
    value: 'identifiers 4',
  }, {
    value: 'identifiers 5',
  }];
  const labelIds = {
    titleLevelRequests: 'ui-requests.titleInformation.titleLevelRequests',
    title: 'ui-requests.titleInformation.title',
    contributors: 'ui-requests.titleInformation.contributors',
    publicationsDate: 'ui-requests.titleInformation.publicationsDate',
    editions: 'ui-requests.titleInformation.editions',
    identifiers: 'ui-requests.titleInformation.identifiers',
  };
  const orderOfKeyValueCall = {
    titleLevelRequests: 1,
    title: 2,
    contributors: 3,
    publicationsDate: 4,
    editions: 5,
    identifiers: 6,
  };
  const expects = {
    contributors: 'Name 1 LastName 1; Name 2 LastName 2',
    publications: '2021',
    editions: 'edition 1, edition 2',
    identifiers: 'identifiers 1, identifiers 2, identifiers 3, identifiers 4',
  };
  const defaultProps = {
    instanceId,
    titleLevelRequestsCount,
    title,
    contributors,
    publications,
    editions,
    identifiers,
  };

  afterEach(() => {
    KeyValue.mockClear();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(
        <TitleInformation {...defaultProps} />
      );
    });

    it('should render title level requests section', () => {
      const expectedProps = {
        label: labelIds.titleLevelRequests,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(
        orderOfKeyValueCall.titleLevelRequests,
        expect.objectContaining(expectedProps),
        {}
      );
    });

    it('should render title section', () => {
      const expectedProps = {
        label: labelIds.title,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(
        orderOfKeyValueCall.title,
        expect.objectContaining(expectedProps),
        {}
      );
    });

    it('should render contributors section', () => {
      const expectedProps = {
        label: labelIds.contributors,
        value: expects.contributors,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(orderOfKeyValueCall.contributors, expectedProps, {});
    });

    it('should render title publicationsDate', () => {
      const expectedProps = {
        label: labelIds.publicationsDate,
        value: expects.publications,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(orderOfKeyValueCall.publicationsDate, expectedProps, {});
    });

    it('should render title editions', () => {
      const expectedProps = {
        label: labelIds.editions,
        value: expects.editions,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(orderOfKeyValueCall.editions, expectedProps, {});
    });

    it('should render title identifiers', () => {
      const expectedProps = {
        label: labelIds.identifiers,
        value: expects.identifiers,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(orderOfKeyValueCall.identifiers, expectedProps, {});
    });
  });

  describe('when titleLevelRequestsLink is false', () => {
    beforeEach(() => {
      render(
        <TitleInformation
          {...defaultProps}
          titleLevelRequestsLink={false}
        />
      );
    });

    it('should render title level requests section', () => {
      const expectedProps = {
        label: labelIds.titleLevelRequests,
        value: titleLevelRequestsCount,
      };

      expect(KeyValue).toHaveBeenNthCalledWith(
        orderOfKeyValueCall.titleLevelRequests,
        expectedProps,
        {}
      );
    });
  });

  describe('getContributors', () => {
    it('should return contributors', () => {
      expect(getContributors(contributors, CONTRIBUTOR_SEPARATOR)).toBe(expects.contributors);
    });
  });

  describe('getEditions', () => {
    it('should return editions,', () => {
      expect(getEditions(editions, TEXT_SEPARATOR)).toBe(expects.editions);
    });
  });

  describe('getIdentifiers', () => {
    it('should return identifiers', () => {
      expect(getIdentifiers(identifiers, TEXT_SEPARATOR, MAX_IDENTIFIERS_COUNT)).toBe(expects.identifiers);
    });
  });
});
