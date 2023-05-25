import React from 'react';
import { render } from '@testing-library/react';
import LoadingButton from './LoadingButton';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(() => 'test'),
  Icon: jest.fn(() => 'stripeIcon'),
}));

describe('LoadingButton', () => {
  it('renders the loading button correctly', () => {
    const { getAllByText } = render(<LoadingButton>Test</LoadingButton>);
    expect(getAllByText('test').length).toBe(1);
  });
  it('renders the styling for Button', () => {
    render(<LoadingButton>Test</LoadingButton>);
    const button = document.querySelector('button[buttonStyle="dropdownItem"]');
    expect(button).toBeDefined();
  });
});
