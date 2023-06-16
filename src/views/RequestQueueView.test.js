import '__mock__/';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
    const refreshButton = screen.getByRole('button', { name: /ui-requests.requestQueue.refresh/i });
    expect(refreshButton).toBeInTheDocument();
    userEvent.click(refreshButton);
  });
  it('should perform drag event', () => {
    const dragButton = screen.getByRole('button', { name: /Drag Button/i });
    expect(dragButton).toBeInTheDocument();
    userEvent.click(dragButton);
  });
  it('should perform confrim event', () => {
    const confirmButton = screen.getByRole('button', { name: /ui-requests.requestQueue.confirmReorder.confirm/i });
    expect(confirmButton).toBeInTheDocument();
    userEvent.click(confirmButton);
  });
  it('should perform cancel event', () => {
    const cancelButton = screen.getByRole('button', { name: /ui-requests.requestQueue.confirmReorder.cancel/i });
    expect(cancelButton).toBeInTheDocument();
    userEvent.click(cancelButton);
  });
  it('should render isRowDraggable value', () => {
    const isDraggable = screen.getByTestId('rowDraggable');
    expect(isDraggable.textContent).toBe('true');
  });
  it('toggle Not Yet Filled', () => {
    const toggleField = screen.getByText('Toggle Not Yet Filled');
    expect(toggleField).toBeInTheDocument();
    userEvent.click(toggleField);
  });
  it('toggle event should be in progress', () => {
    const toggleInProcess = screen.getByText('Toggle in Progress');
    expect(toggleInProcess).toBeInTheDocument();
    userEvent.click(toggleInProcess);
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
