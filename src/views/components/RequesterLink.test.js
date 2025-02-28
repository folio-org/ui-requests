import { BrowserRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import RequesterLink from './RequesterLink';

describe('RequesterLink', () => {
  describe('When barcode is presented', () => {
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

  describe('When barcode is not presented', () => {
    const request = {
      requester: {},
    };

    beforeEach(() => {
      render(
        <BrowserRouter>
          <RequesterLink request={request} />
        </BrowserRouter>
      );
    });

    it('should trigger NoValue component', () => {
      expect(NoValue).toHaveBeenCalled();
    });
  });
});
