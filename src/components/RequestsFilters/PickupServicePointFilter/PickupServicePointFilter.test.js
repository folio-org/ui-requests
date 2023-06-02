import '__mock__/';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PickupServicePointFilter from './PickupServicePointFilter';

const servicePoints = [
  { id: '1', name: 'Service Point 1' },
  { id: '2', name: 'Service Point 2' },
  { id: '3', name: 'Service Point 3' },
];

describe('PickupServicePointFilter', () => {
  const onChange = jest.fn();
  const onClear = jest.fn();
  beforeEach(() => {
    onChange.mockClear();
    onClear.mockClear();
  });
  it('should perform onClear event', () => {
    render(
      <PickupServicePointFilter
        activeValues={[]}
        servicePoints={servicePoints}
        onChange={onChange}
        onClear={onClear}
      />
    );
    const pickupServicePointsButton = screen.getByTestId('clear-pickupServicePoints');
    userEvent.click(pickupServicePointsButton);
    expect(onClear).toHaveBeenCalled();
  });
});
