import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';

import PickupServicePointFilter from './PickupServicePointFilter';
import { requestFilterTypes } from '../../../constants';

const servicePoints = [
  {
    id: requestFilterTypes.PICKUP_SERVICE_POINT,
    name: requestFilterTypes.PICKUP_SERVICE_POINT,
  }
];
const activeValues = ['test', 'test2'];
const onChange = jest.fn();
const onClear = jest.fn();
const testIds = {
  pickupServicePointAccordionButton: 'pickupServicePointAccordionButton',
};

describe('PickupServicePointFilter', () => {
  beforeEach(() => {
    onChange.mockClear();
    onClear.mockClear();
    render(
      <PickupServicePointFilter
        activeValues={activeValues}
        servicePoints={servicePoints}
        onChange={onChange}
        onClear={onClear}
      />
    );
  });

  it('should render "Accordion" with correct props', () => {
    const expectedProps = {
      id: requestFilterTypes.PICKUP_SERVICE_POINT,
      name: requestFilterTypes.PICKUP_SERVICE_POINT,
      header: FilterAccordionHeader,
      separator: false,
      onClearFilter: expect.any(Function),
    };

    expect(Accordion).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });

  it('should render MultiSelectionFilter', () => {
    const MultiSelectionFilter = screen.getByText('MultiSelectionFilter');

    expect(MultiSelectionFilter).toBeInTheDocument();
  });

  it('should perform onClear event', async () => {
    const pickupServicePointsButton = screen.getByTestId(testIds.pickupServicePointAccordionButton);

    await userEvent.click(pickupServicePointsButton);

    expect(onClear).toHaveBeenCalledWith(requestFilterTypes.PICKUP_SERVICE_POINT);
  });

  describe('MultiSelectionFilter activeValues', () => {
    activeValues.forEach(value => {
      it(`should render "${value}"`, () => {
        const activeValue = screen.getByText(value, {
          exact: false,
        });

        expect(activeValue).toBeInTheDocument();
      });
    });
  });
});
