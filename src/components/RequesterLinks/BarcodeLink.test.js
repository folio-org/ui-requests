import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import BarcodeLink from './BarcodeLink';

describe('BarcodeLink', () => {
  describe('When barcode is presented', () => {
    const mockedRequester = {
      id: 'testRequesterId',
      barcode: 'testRequesterBarcode',
    };
    const mockedRequesterId = 'testRequestRequesterId';

    it('should render `Link` with correct label', () => {
      render(
        <MemoryRouter>
          <BarcodeLink userId={mockedRequesterId} user={mockedRequester} />
        </MemoryRouter>
      );

      expect(screen.getByText(mockedRequester.barcode)).toBeInTheDocument();
    });

    describe('and the requester has an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        const expectedResult = `/users/view/${mockedRequester.id}`;
        render(
          <MemoryRouter>
            <BarcodeLink userId={mockedRequesterId} user={mockedRequester} />
          </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });

    describe('and the requester does not have an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        mockedRequester.id = null;
        const expectedResult = `/users/view/${mockedRequesterId}`;
        render(
          <MemoryRouter>
            <BarcodeLink userId={mockedRequesterId} user={mockedRequester} />
          </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });
  });

  describe('When barcode is not presented', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <BarcodeLink user={{}} />
        </MemoryRouter>
      );
    });

    it('should trigger NoValue component', () => {
      expect(NoValue).toHaveBeenCalled();
    });
  });
});
