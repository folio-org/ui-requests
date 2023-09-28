import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import '__mock__';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';

import EffectiveLocationServicePointFilter from './EffectiveLocationServicePointFilter';
import { requestFilterTypes } from '../../../constants';

const servicePoints = [
  {
    id: requestFilterTypes.EffLocation_SERVICE_POINT,
    name: requestFilterTypes.EffLocation_SERVICE_POINT,
  }
];
const activeValues = ['test', 'test2'];
const onChange = jest.fn();
const onClear = jest.fn();
const testIds = {
  effectiveLocationServicePointAccordionButton: 'effectiveLocationServicePointAccordionButton',
};

describe('EffectiveLocationServicePointFilter', () => {
  beforeEach(() => {
    onChange.mockClear();
    onClear.mockClear();
    render(
      <EffectiveLocationServicePointFilter
        activeValues={activeValues}
        servicePoints={servicePoints}
        onChange={onChange}
        onClear={onClear}
      />
    );
  });

  it('should render "Accordion" with correct props', () => {
    const expectedProps = {
      id: requestFilterTypes.EffLocation_SERVICE_POINT,
      name: requestFilterTypes.EffLocation_SERVICE_POINT,
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
    const effectiveLocationServicePointButton = screen.getByTestId(testIds.effectiveLocationServicePointAccordionButton);

    await userEvent.click(effectiveLocationServicePointButton);

    expect(onClear).toHaveBeenCalledWith(requestFilterTypes.EffLocation_SERVICE_POINT);
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
