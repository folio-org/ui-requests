import { render } from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import RequestQueueRoute from './RequestQueueRoute';

jest.mock('react-router-prop-types', () => ({
  location: jest.fn(),
}));
jest.mock('../../../views/RequestQueueView', () => {
  return function MockRequestQueueView({ onClose }) {
    return (
      <div>
        <p>Mock RequestQueueView</p>
        <button
          type="button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    );
  };
});
jest.mock('../../../utils', () => ({
  getTlrSettings: jest.fn(() => ({ titleLevelRequestsFeatureEnabled: false })),
  isPageRequest: jest.fn(),
}));

const baseMockResources = {
  configs: {
    records: [
      {
        value: {},
      },
    ],
    hasLoaded: true,
  },
  request: {
    records: [
      {
        id: '1',
      },
    ],
  },
  requests: {
    records: [
      {
        id: '2',
      },
    ],
  },
};
const mockResources = {
  request: {
    records: [{
      id: '1',
      holdingsRecordId: '2',
      itemId: '3',
    }],
  },
  holdings: {
    records: [{
      id: '123',
      callNumber: 'ABC123',
    }]
  },
  items: {
    records: [{
      id: '3',
    }],
  },
  configs: {
    records: [{
      value: {
        titleLevelRequestsFeatureEnabled: true,
      },
    }],
    hasLoaded: true,
  },
  requests: {
    records: [{
      shouldRefresh: false,
    }],
  },
};
const baseMockMutator = {
  reorderInstanceQueue: {},
  reorderItemQueue: {},
  requests: {
    reset: jest.fn(),
    GET: jest.fn(),
  },
};
const mockMutator = {
  ...baseMockMutator,
  reorderInstanceQueue: {
    POST: jest.fn(),
  },
  reorderItemQueue: {
    POST: jest.fn(),
  },
};
const mockHistory = {
  push: jest.fn(),
  goBack: jest.fn(),
};
const mockMatch = {
  params: {
    id: '2',
    requestId: '1',
  },
};
const mockLocation = {
  state: {
    request: {
      id: '1',
    },
  },
};

describe('RequestQueueRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call requests.GET when component rerender', () => {
    const { rerender } = render(
      <RequestQueueRoute
        resources={{
          ...mockResources,
          configs: { ...mockResources.configs, hasLoaded: false },
        }}
        mutator={mockMutator}
        history={mockHistory}
        location={mockLocation}
        match={mockMatch}
      />
    );

    rerender(
      <RequestQueueRoute
        resources={mockResources}
        mutator={mockMutator}
        history={mockHistory}
        location={mockLocation}
        match={mockMatch}
      />
    );

    expect(mockMutator.requests.GET).toHaveBeenCalled();
  });

  it('should call "history.goBack" if "location.state.request" is truthy', async () => {
    const goBack = jest.fn();
    const { getByText } = render(
      <RequestQueueRoute
        match={{ params: {} }}
        history={{ goBack, push: jest.fn() }}
        resources={baseMockResources}
        mutator={baseMockMutator}
        location={{ state: { request: {} } }}
      />,
    );

    await userEvent.click(getByText('Close'));

    expect(goBack).toHaveBeenCalledTimes(1);
  });

  it('should call "history.push" with the correct URL if "location.state.request" is falsy', async () => {
    const push = jest.fn();
    const { getByText } = render(
      <RequestQueueRoute
        match={{ params: { requestId: '123' } }}
        history={{ goBack: jest.fn(), push }}
        resources={baseMockResources}
        mutator={baseMockMutator}
        location={{ state: {} }}
      />,
    );

    await userEvent.click(getByText('Close'));

    expect(push).toHaveBeenCalledWith('/requests/view/1');
  });
});
