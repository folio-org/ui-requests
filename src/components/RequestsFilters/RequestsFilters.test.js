import '__mock__/';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RequestsFilters from './RequestsFilters';

jest.mock('./PickupServicePointFilter', () => ({
  PickupServicePointFilter: jest.fn(() => <div>PickupServicePointFilter</div>),
}));

jest.mock('./RequestLevelFilter', () => ({
  RequestLevelFilter: jest.fn(() => <div>RequestLevelFilter</div>),
}));

const props = {
  activeFilters: {
    requestStatus: ['Open'],
    requestType: ['Hold'],
    pickupServicePoints: ['1'],
    tags: ['Urgent'],
  },
  onChange: jest.fn(),
  onClear: jest.fn(),
  resources: {
    servicePoints: { records: [{ id: '1', name: 'Service Point 1' }] },
    tags: { records: [{ label: 'Urgent' }] },
  },
  titleLevelRequestsFeatureEnabled: false,
};

describe('RequestsFilters', () => {
  beforeEach(() => {
    render(<RequestsFilters {...props} />);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  describe('onClear tests', () => {
    it('should call onClear with "requestType" argument when clear-requestType button is clicked', () => {
      userEvent.click(screen.getByTestId('clear-requestType'));
      expect(props.onClear).toHaveBeenCalledWith('requestType');
    });
    it('should call onClear with "requestStatus" argument when clear-requestStatus button is clicked', () => {
      userEvent.click(screen.getByTestId('clear-requestStatus'));
      expect(props.onClear).toHaveBeenCalledWith('requestStatus');
    });
    it('should call onClear with "tags" argument when clear-tags button is clicked', () => {
      userEvent.click(screen.getByTestId('clear-tags'));
      expect(props.onClear).toHaveBeenCalledWith('tags');
    });
  });
  describe('CheckboxFilter', () => {
    it('should render the PickupServicePointFilter', () => {
      expect(screen.getByText(/PickupServicePointFilter/i)).toBeInTheDocument();
    });
    it('should render the MultiSelectionFilter', () => {
      expect(screen.getByText(/MultiSelectionFilter/i)).toBeInTheDocument();
    });
    it('should not render RequestLevelFilter when titleLevelRequestsFeatureEnabled is false', () => {
      expect(screen.queryByText(/RequestLevelFilter/i)).toBeNull();
    });
    describe('should render the CheckboxFilter twice', () => {
      beforeEach(() => {
        render(
          <RequestsFilters
            {...props}
            activeFilters={{}}
            titleLevelRequestsFeatureEnabled
          />
        );
      });
      it('PickupServicePointFilter', () => {
        expect(screen.getAllByText('PickupServicePointFilter')).toHaveLength(2);
      });
      it('MultiSelectionFilter', () => {
        expect(screen.getAllByText('MultiSelectionFilter')).toHaveLength(2);
      });
      it('should render RequestLevelFilter when titleLevelRequestsFeatureEnabled is true', () => {
        expect(screen.getByText('RequestLevelFilter')).toBeInTheDocument();
      });
    });
  });
});