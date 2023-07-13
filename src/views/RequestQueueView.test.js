import {
  screen,
  render,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '__mock__';

import {
  AccordionSet,
} from '@folio/stripes/components';

import RequestQueueView from './RequestQueueView';

jest.mock('./components/FulfillmentRequestsData', () => jest.fn(() => <div>FulfillmentRequestsData</div>));
jest.mock('./components/NotYetFilledRequestsData', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(({ onDragEnd, isRowDraggable }) => (
    <div>
      <button
        type="button"
        data-testid="dragButton"
        onClick={() => onDragEnd({ source: { index: 1 }, destination: { index: 0 } })}
      >
        Drag Button
      </button>
      <span data-testid="rowDraggable">{isRowDraggable({ id: 1 }, 1).toString()}</span>
    </div>
  )),
}));
jest.mock('../components', () => ({
  Loading: jest.fn(() => <div>Loading...</div>),
}));
jest.mock('../utils', () => ({
  isNotYetFilled: jest.fn(() => true),
  isPageRequest: jest.fn(() => false),
}));
jest.mock('../routes/utils', () => ({
  getFormattedYears: jest.fn(() => '2023'),
  getFormattedPublishers: jest.fn(() => 'Publisher'),
  getFormattedContributors: jest.fn(() => 'Contributors'),
}));

const loadmock = false;
const loadingmock = true;
const data = {
  notYetFilledRequests: [
    { position: 1, title: 'Request 1' },
    { position: 2, title: 'Request 2' },
    { position: 3, title: 'Request 3' },
  ],
  inProgressRequests: [
    { id: '3', position: 3, length: 4 },
  ],
  request: {
    instance: {
      title: 'Test Title',
      publication: {
        publisher: 'Test Publisher',
      },
      contributorNames: ['Author 1', 'Author 2'],
    },
  }
};
const mockOnReorder = jest.fn().mockResolvedValue();
const mockOnClose = jest.fn();
const mockisTlrEnabled = true;

describe('RequestQueueView', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    render(
      <RequestQueueView
        data={data}
        isTlrEnabled={mockisTlrEnabled}
        onClose={mockOnClose}
        onReorder={mockOnReorder}
        isLoading={loadmock}
      />
    );
  });

  it('should perform reload event', () => {
    const reloadMock = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadMock },
    });
    const refreshButton = screen.getByRole('button', { name: /ui-requests.requestQueue.refresh/i });

    userEvent.click(refreshButton);

    expect(reloadMock).toHaveBeenCalled();
  });

  it('should perform confrim event', () => {
    const confirmButton = screen.getByRole('button', { name: /ui-requests.requestQueue.confirmReorder.confirm/i });

    userEvent.click(confirmButton);

    expect(mockOnReorder).toHaveBeenCalled();
  });

  it('should perform cancel event', () => {
    const cancelButton = screen.getByRole('button', { name: /ui-requests.requestQueue.confirmReorder.cancel/i });

    userEvent.click(cancelButton);

    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should render isRowDraggable value', () => {
    const isDraggable = screen.getByTestId('rowDraggable');

    expect(isDraggable.textContent).toBe('true');
  });

  it('should perform drag event', () => {
    const dragButton = screen.getByRole('button', { name: /Drag Button/i });

    userEvent.click(dragButton);

    expect(mockOnReorder).toHaveBeenCalled();
  });

  it('should perform toggle event', () => {
    const toggleField = screen.getByText('Toggle');

    userEvent.click(toggleField);

    expect(AccordionSet).toHaveBeenCalledTimes(2);
  });
});

describe('RequestQueueView should be in loading state', () => {
  it('isLoading should be true', () => {
    const { getByText } = render(
      <RequestQueueView
        data={data}
        isTlrEnabled={mockisTlrEnabled}
        onClose={mockOnClose}
        onReorder={mockOnReorder}
        isLoading={loadingmock}
      />
    );

    expect(getByText('Loading...')).toBeInTheDocument();
  });
});
