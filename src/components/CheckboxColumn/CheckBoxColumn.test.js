import {
  render,
  fireEvent,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import CheckboxColumn from './CheckboxColumn';

const basicProps = {
  request: {
    id: '1',
  },
  selectedRows: {},
  toggleRowSelection: jest.fn(),
};

describe('CheckboxColumn', () => {
  beforeEach(() => {
    render(
      <CheckboxColumn
        {...basicProps}
      />
    );
  });

  it('should render checkbox', () => {
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toBeInTheDocument();
  });

  it('should render unchecked checkbox by default', () => {
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox.checked).toBe(false);
  });

  it('should toggles selection on click', () => {
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(checkbox);

    expect(basicProps.toggleRowSelection).toHaveBeenCalledWith(basicProps.request);
  });
});
