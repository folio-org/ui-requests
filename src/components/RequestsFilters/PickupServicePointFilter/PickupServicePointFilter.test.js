import '__mock__/';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { requestFilterTypes } from '../../../constants';
import PickupServicePointFilter from './PickupServicePointFilter';

const servicePoints = [
  {
    id: requestFilterTypes.PICKUP_SERVICE_POINT,
    name: requestFilterTypes.PICKUP_SERVICE_POINT
  }
];
const activeValues = ['test'];
const onChange = jest.fn();
const onClear = jest.fn();
describe('PickupServicePointFilter', () => {
  const setupPickupServicePointFilter = () => render(
    <PickupServicePointFilter
      activeValues={activeValues}
      servicePoints={servicePoints}
      onChange={onChange}
      onClear={onClear}
    />
  );
  beforeEach(() => {
    onChange.mockClear();
    onClear.mockClear();
    setupPickupServicePointFilter();
  });
  it('should render MultiSelectionFilter', () => {
    const MultiSelectionFilter = screen.getByText('MultiSelectionFilter');
    expect(MultiSelectionFilter).toBeInTheDocument();
  });
  it('MultiSelectionFilter should render with activeValues', () => {
    const activeValue = screen.getByText('test');
    expect(activeValue).toBeInTheDocument();
  });
  it('should perform onClear event', () => {
    const pickupServicePointsButton = screen.getByTestId('clear-pickupServicePoints');
    userEvent.click(pickupServicePointsButton);
    expect(onClear).toHaveBeenCalledWith(requestFilterTypes.PICKUP_SERVICE_POINT);
  });
});
