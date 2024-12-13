import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import { CheckboxFilter } from '@folio/stripes/smart-components';

import RequestLevelFilter from './RequestLevelFilter';
import {
  requestFilterTypes,
  requestLevelFilters,
} from '../../../constants';

const testIds = {
  requestLevelFilter: 'requestLevelFilter',
};
const labelIds = {
  requestLevel: 'ui-requests.requestLevel',
};

describe('RequestLevelFilter', () => {
  const testOnClearCallback = jest.fn();
  const testOnChangeCallback = () => {};
  const defaultTestActiveValues = [];
  const defaultTestProps = {
    activeValues: defaultTestActiveValues,
    onChange: testOnChangeCallback,
    onClear: testOnClearCallback,
  };

  afterEach(() => {
    FilterAccordionHeader.mockClear();
    CheckboxFilter.mockClear();
    testOnClearCallback.mockClear();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(
        <RequestLevelFilter {...defaultTestProps} />
      );
    });

    it('should render Accordion component', () => {
      expect(Accordion).toHaveBeenCalledWith(expect.objectContaining({
        displayClearButton: false,
        id: requestFilterTypes.REQUEST_LEVELS,
        header: FilterAccordionHeader,
        label: labelIds.requestLevel,
        name: requestFilterTypes.REQUEST_LEVELS,
        separator: false,
      }), {});
    });

    it('should handle clear filters', () => {
      expect(testOnClearCallback).not.toHaveBeenCalled();

      fireEvent.click(screen.getByTestId(`${testIds.requestLevelFilter}Button`));

      expect(testOnClearCallback).toHaveBeenCalledWith(requestFilterTypes.REQUEST_LEVELS);
    });

    it('should render CheckboxFilter component', () => {
      expect(CheckboxFilter).toHaveBeenCalledWith(expect.objectContaining({
        dataOptions: [{
          label: requestLevelFilters[0].label,
          value: requestLevelFilters[0].value,
        }, {
          label: requestLevelFilters[1].label,
          value: requestLevelFilters[1].value,
        }],
        name: requestFilterTypes.REQUEST_LEVELS,
        selectedValues: defaultTestActiveValues,
        onChange: testOnChangeCallback,
      }), {});
    });
  });

  describe('when activeValues has items', () => {
    const testActiveValues = [
      requestLevelFilters[0].value,
    ];

    beforeEach(() => {
      render(
        <RequestLevelFilter
          {...defaultTestProps}
          activeValues={testActiveValues}
        />
      );
    });

    it('should render Accordion component', () => {
      expect(Accordion).toHaveBeenCalledWith(expect.objectContaining({
        displayClearButton: true,
      }), {});
    });

    it('should render CheckboxFilter component', () => {
      expect(CheckboxFilter).toHaveBeenCalledWith(expect.objectContaining({
        selectedValues: testActiveValues,
      }), {});
    });
  });
});
