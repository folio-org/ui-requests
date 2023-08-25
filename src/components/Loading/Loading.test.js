import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { Layout } from '@folio/stripes/components';

import Loading from './Loading';

const testIds = {
  loading: 'loading',
};

describe('Loading', () => {
  beforeEach(() => {
    render(<Loading />);
  });

  it('should be rendered into the document', () => {
    const loading = screen.getByTestId(testIds.loading);

    expect(loading).toBeInTheDocument();
  });

  it('should call "Layout" with correct props', () => {
    const expectedProps = {
      className: 'centered full',
      style: {
        maxWidth: '15rem',
        height: '8rem',
      }
    };

    expect(Layout).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
  });
});
