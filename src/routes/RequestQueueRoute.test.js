import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestQueueRoute from './RequestQueueRoute';

jest.mock('@folio/stripes/core', () => ({
  stripesConnect: jest.fn(Component => props => <Component {...props} />)
}));

jest.mock('react-router-prop-types', () => ({
  location: jest.fn(),
}));

jest.mock('../views/RequestQueueView', () => {
  return function MockRequestQueueView(props) {
    return (
      <div>
        <p>Mock RequestQueueView</p>
        <button type="button" onClick={props.onClose}>Close</button>
      </div>
    );
  };
});

jest.mock('../utils', () => ({
  getTlrSettings: jest.fn(() => ({ titleLevelRequestsFeatureEnabled: false })),
  isPageRequest: jest.fn(),
}));

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

const mockMutator = {
  reorderInstanceQueue: {
    POST: jest.fn(),
  },
  reorderItemQueue: {
    POST: jest.fn(),
  },
  requests: {
    reset: jest.fn(),
    GET: jest.fn(),
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
  it('renders without error', () => {
    const { container } = render(
      <RequestQueueRoute
        resources={mockResources}
        mutator={mockMutator}
        history={mockHistory}
        location={mockLocation}
        match={mockMatch}
      />
    );
    expect(container).toBeInTheDocument();
  });
  it('should call setTlrSettings on mount if configs have loaded', () => {
    render(
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

    expect(mockMutator.requests.GET).not.toHaveBeenCalled();
    expect(mockMutator.requests.reset).not.toHaveBeenCalled();
    expect(mockMutator.reorderInstanceQueue.POST).not.toHaveBeenCalled();
    expect(mockMutator.reorderItemQueue.POST).not.toHaveBeenCalled();

    render(
      <RequestQueueRoute
        resources={mockResources}
        mutator={mockMutator}
        history={mockHistory}
        location={mockLocation}
        match={mockMatch}
      />
    );

    expect(mockMutator.requests.GET).toHaveBeenCalled();
    expect(mockMutator.requests.reset).toHaveBeenCalled();
    expect(mockMutator.reorderInstanceQueue.POST).not.toHaveBeenCalled();
    expect(mockMutator.reorderItemQueue.POST).not.toHaveBeenCalled();
  });
  it('calls setTlrSettings on update', () => {
    const { rerender } = render(
      <RequestQueueRoute
        resources={{
          ...mockResources,
          configs: {
            ...mockResources.configs,
            hasLoaded: false,
          },
        }}
        mutator={mockMutator}
        history={mockHistory}
        match={mockMatch}
        location={mockLocation}
      />
    );
    rerender(
      <RequestQueueRoute
        resources={mockResources}
        mutator={mockMutator}
        history={mockHistory}
        match={mockMatch}
        location={mockLocation}
      />
    );
    expect(mockMutator.requests.reset).toHaveBeenCalledTimes(1);
    expect(mockMutator.requests.GET).toHaveBeenCalledTimes(1);
    expect(mockMutator.requests.GET).toHaveBeenCalledWith({
      path: 'circulation/requests/queue/item/2',
    });
  });
  it('calls history.goBack() if location.state.request is truthy', () => {
    const goBack = jest.fn();
    const { getByText } = render(
      <RequestQueueRoute
        match={{ params: {} }}
        history={{ goBack, push: jest.fn() }}
        resources={{
          configs: { records: [{ value: {} }], hasLoaded: true },
          request: { records: [{ id: '1' }] },
          requests: { records: [{ id: '2' }] },
        }}
        mutator={{
          reorderInstanceQueue: {},
          reorderItemQueue: {},
          requests: {
            reset: jest.fn(),
            GET: jest.fn(),
          },
        }}
        location={{ state: { request: {} } }}
      />,
    );
    userEvent.click(getByText('Close'));
    expect(goBack).toHaveBeenCalledTimes(1);
  });
  it('calls history.push() with the correct URL if location.state.request is falsy', () => {
    const push = jest.fn();
    const { getByText } = render(
      <RequestQueueRoute
        match={{ params: { requestId: '123' } }}
        history={{ goBack: jest.fn(), push }}
        resources={{
          configs: { records: [{ value: {} }], hasLoaded: true },
          request: { records: [{ id: '1' }] },
          requests: { records: [{ id: '2' }] },
        }}
        mutator={{
          reorderInstanceQueue: {},
          reorderItemQueue: {},
          requests: {
            reset: jest.fn(),
            GET: jest.fn(),
          },
        }}
        location={{ state: {} }}
      />,
    );
    userEvent.click(getByText('Close'));
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith('/requests/view/1');
  });
});
