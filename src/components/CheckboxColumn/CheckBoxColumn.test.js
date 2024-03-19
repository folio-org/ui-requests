import React from 'react';
import { render, fireEvent } from '@folio/jest-config-stripes/testing-library/react';
import CheckboxColumn from './CheckboxColumn';

describe('CheckboxColumn', () => {
  const rq = { identifier: '1' };
  const selectedRows = {};
  const toggleRowSelection = jest.fn();

  it('should renders correctly with checkbox', () => {
    const { getByRole } = render(
      <CheckboxColumn rq={rq} selectedRows={selectedRows} toggleRowSelection={toggleRowSelection} />
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should be unchecked by default', () => {
    const { getByRole } = render(
      <CheckboxColumn rq={rq} selectedRows={selectedRows} toggleRowSelection={toggleRowSelection} />
    );
    const checkbox = getByRole('checkbox');
    expect(checkbox.checked).toBe(false);
  });

  it('should toggles selection on click', () => {
    const { getByRole } = render(
      <CheckboxColumn rq={rq} selectedRows={selectedRows} toggleRowSelection={toggleRowSelection} />
    );
    const checkbox = getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(toggleRowSelection).toHaveBeenCalledWith(rq);
  });
});
