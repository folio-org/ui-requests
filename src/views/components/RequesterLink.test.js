import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import '../../../test/jest/__mock__';

import RequesterLink from './RequesterLink';

describe('RequesterLink', () => {
  const mockedRequester = {
    barcode: 'testRequesterBarcode',
  };
  const mockedRequest = {
    requesterId: 'testRequesterId',
    requester: mockedRequester,
  };

  beforeEach(() => {
    render(
      <BrowserRouter>
        <RequesterLink request={mockedRequest} />
      </BrowserRouter>
    );
  });

  it('should render `Link` with correct label', () => {
    expect(screen.getByText(mockedRequester.barcode)).toBeInTheDocument();
  });

  it('should render `Link` with correct `href` attribute', () => {
    const expectedResult = `/users/view/${mockedRequest.requesterId}`;

    expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
  });
});
