import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PickupServicePointFilter from './PickupServicePointFilter';

jest.mock('@folio/stripes/components', () => ({
  Accordion: jest.fn(({ name, children, onClearFilter }) => (
    <div>
      <div><button type="button" onClick={() => onClearFilter()} data-testid={`clear-${name}`}>Clear</button></div>
      <div data-testid={`accordion-${name}`}>{children}</div>
    </div>
  )),
  FilterAccordionHeader: jest.fn(() => <div>Filter Accordion Header</div>),
}));

jest.mock('@folio/stripes/smart-components', () => ({
  MultiSelectionFilter: jest.fn(() => <div>Multi Selection Filter</div>)
}));

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
  it('should render the component with default props', () => {
    render(
      <PickupServicePointFilter
        activeValues={[]}
        servicePoints={servicePoints}
        onChange={onChange}
        onClear={onClear}
      />
    );
    const pickupServicePointsButton = screen.getByTestId('clear-pickupServicePoints');
    expect(pickupServicePointsButton).toBeInTheDocument();
    userEvent.click(pickupServicePointsButton);
    expect(onClear).toHaveBeenCalled();
  });
});
