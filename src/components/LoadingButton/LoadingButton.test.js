import '__mock__/';
import { render, screen } from '@testing-library/react';
import LoadingButton from './LoadingButton';

const defaultProp = {
  children: 'LoadingButton'
};

describe('LoadingButton', () => {
  beforeEach(() => {
    render(<LoadingButton {...defaultProp} />);
  });
  it('Component should render correctly', () => {
    expect(screen.getByText('LoadingButton')).toBeInTheDocument();
  });
  it('Button should have disabled attribute', () => {
    expect(screen.getByRole('button', { name: 'LoadingButton' })).toHaveAttribute('disabled');
  });
});
