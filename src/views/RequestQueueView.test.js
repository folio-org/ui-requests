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
import {
  requestStatuses,
  requestStatusesTranslations,
  requestTypesMap,
  requestTypesTranslations,
} from '../constants';

jest.mock('./components/FulfillmentRequestsData', () => jest.fn(({ contentData }) => contentData
  .map(({ status, requestType }) => (
    <>
      <span>{ status }</span>
      <span>{ requestType }</span>
    </>
  ))));
jest.mock('../components', () => ({
  SortableList: jest.fn(() => null),
  Loading: jest.fn(() => null),
}));

describe('RequestQueueView', () => {
  const inProgressRequests = [
    {
      status: requestStatuses.AWAITING_DELIVERY,
      requestType: requestTypesMap.HOLD,
    },
    {
      status: requestStatuses.AWAITING_PICKUP,
      requestType: requestTypesMap.PAGE,
    },
    {
      status: requestStatuses.IN_TRANSIT,
      requestType: requestTypesMap.RECALL,
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
    let container;

    beforeEach(() => {
      container = render(
        <RequestQueueView
          data={mockedData}
          isLoading={false}
        />
      );
    });

    it('`FulfillmentRequestsData` should correctly handle requests collection and render appropriate statuses', () => {
      expect(container.getByText(requestStatusesTranslations[requestStatuses.AWAITING_DELIVERY])).toBeInTheDocument();
      expect(container.getByText(requestStatusesTranslations[requestStatuses.AWAITING_PICKUP])).toBeInTheDocument();
      expect(container.getByText(requestStatusesTranslations[requestStatuses.IN_TRANSIT])).toBeInTheDocument();
    });

    it('`FulfillmentRequestsData` should correctly handle requests collection and render appropriate requestTypes', () => {
      expect(container.getByText(requestTypesTranslations[requestTypesMap.HOLD])).toBeInTheDocument();
      expect(container.getByText(requestTypesTranslations[requestTypesMap.PAGE])).toBeInTheDocument();
      expect(container.getByText(requestTypesTranslations[requestTypesMap.RECALL])).toBeInTheDocument();
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
