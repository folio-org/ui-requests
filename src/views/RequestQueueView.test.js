import React from 'react';
import {
  render,
} from '@testing-library/react';

import '../../test/jest/__mock__';

import RequestQueueView from './RequestQueueView';
import {
  SortableList,
  Loading,
} from '../components';
import FulfillmentRequestsData from './components/FulfillmentRequestsData';
import { requestStatuses } from '../constants';

jest.mock('./components/FulfillmentRequestsData', () => jest.fn(() => null));
jest.mock('../components', () => ({
  SortableList: jest.fn(() => null),
  Loading: jest.fn(() => null),
}));

describe('RequestQueueView', () => {
  const inProgressRequests = [
    {
      status: requestStatuses.AWAITING_DELIVERY,
    },
    {
      status: requestStatuses.AWAITING_PICKUP,
    },
    {
      status: requestStatuses.IN_TRANSIT,
    },
  ];
  const notYetFilledRequests = [
    {
      status: requestStatuses.NOT_YET_FILLED,
    },
  ];
  const mockedData = {
    inProgressRequests,
    notYetFilledRequests,
  };

  afterEach(() => {
    FulfillmentRequestsData.mockClear();
    SortableList.mockClear();
    Loading.mockClear();
  });

  describe('when all data is already loaded', () => {
    beforeEach(() => {
      render(
        <RequestQueueView
          data={mockedData}
          isLoading={false}
        />
      );
    });

    it('should execute `FulfillmentRequestsData` with correct requests collection', () => {
      const expectedResult = {
        contentData: inProgressRequests,
      };

      expect(FulfillmentRequestsData).toHaveBeenCalledWith(expectedResult, {});
    });
  });

  describe('when data is loading', () => {
    beforeEach(() => {
      render(
        <RequestQueueView
          data={mockedData}
          isLoading
        />
      );
    });

    it('should execute `Loading` istead of two accordions', () => {
      expect(Loading).toHaveBeenCalled();
      expect(SortableList).not.toHaveBeenCalled();
      expect(FulfillmentRequestsData).not.toHaveBeenCalled();
    });
  });
});
