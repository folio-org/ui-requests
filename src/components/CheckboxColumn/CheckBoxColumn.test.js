import React from 'react';
import { render, fireEvent } from '@folio/jest-config-stripes/testing-library/react';
import CheckboxColumn from './CheckboxColumn';

describe('CheckboxColumn component', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <CheckboxColumn>
        <span>Test Content</span>
      </CheckboxColumn>
    );

    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('stops propagation of click event', () => {
    const onClickMock = jest.fn();
    const { container } = render(
      <CheckboxColumn>
        <span>Test Content</span>
      </CheckboxColumn>
    );

    const div = container.querySelector('div');
    fireEvent.click(div, { bubbles: true });

    expect(onClickMock).not.toHaveBeenCalled();
  });
});
