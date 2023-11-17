import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Button,
  Icon,
} from '@folio/stripes/components';

import LoadingButton from './LoadingButton';

const props = {
  children: 'LoadingButton'
};

describe('LoadingButton', () => {
  beforeEach(() => {
    render(<LoadingButton {...props} />);
  });

  it('should render button label', () => {
    expect(screen.getByText(props.children)).toBeInTheDocument();
  });

  it('should render "Button" with correct props', () => {
    const expectedProps = {
      buttonStyle: 'dropdownItem',
      disabled: true,
    };

    expect(Button).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });

  it('should render "Icon" with correct props', () => {
    const expectedProps = {
      icon: 'spinner-ellipsis',
      width: '10px',
    };

    expect(Icon).toHaveBeenCalledWith(expectedProps, {});
  });
});
