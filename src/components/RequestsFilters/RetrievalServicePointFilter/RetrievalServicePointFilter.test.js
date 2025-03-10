import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';

import RetrievalServicePointFilter from './RetrievalServicePointFilter';
import { requestFilterTypes } from '../../../constants';

jest.mock('../../../hooks', () => ({
  ...jest.requireActual('../../../hooks'),
  useRetrievalServicePoints: jest.fn().mockReturnValue([
    {
      value: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
      label: 'Circ desk 1',
    },
    {
      value: '9d1b77e8-f02e-4b7f-b296-3f2042ddac54',
      label: 'Circ desk 2',
    },
  ]),
}));

const activeValues = ['test', 'test2'];
const onChange = jest.fn();
const onClear = jest.fn();
const testIds = {
  retrievalServicePointAccordionButton: 'retrievalServicePointAccordionButton',
};

describe('RetrievalServicePointFilter', () => {
  beforeEach(() => {
    onChange.mockClear();
    onClear.mockClear();
    render(
      <RetrievalServicePointFilter
        activeValues={activeValues}
        onChange={onChange}
        onClear={onClear}
      />
    );
  });

  it('should render "Accordion" with correct props', () => {
    const expectedProps = {
      id: requestFilterTypes.RETRIEVAL_SERVICE_POINT,
      name: requestFilterTypes.RETRIEVAL_SERVICE_POINT,
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
    const retrievalServicePointsButton = screen.getByTestId(testIds.retrievalServicePointAccordionButton);

    await userEvent.click(retrievalServicePointsButton);

    expect(onClear).toHaveBeenCalledWith(requestFilterTypes.RETRIEVAL_SERVICE_POINT);
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
