import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import * as utils from '../../utils';
import { BarcodeLink, FullNameLink } from './index';

describe('BarcodeLink', () => {
  describe('When barcode is presented', () => {
    let mockedRequester;
    let mockedRequesterId;
    beforeEach(() => {
      mockedRequester = {
        id: 'testRequesterId',
        barcode: 'testRequesterBarcode',
      };
      mockedRequesterId = 'testRequestRequesterId';
    });

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

describe('FullNameLink', () => {
  let mockedRequesterId;
  let getFullNameSpy;
  beforeEach(() => {
    mockedRequesterId = 'testRequestRequesterId';
    getFullNameSpy = jest.spyOn(utils, 'getFullName');
  });
  afterEach(() => {
    getFullNameSpy.mockClear();
  });
  describe('When requester is present', () => {
    let mockedRequester;
    beforeEach(() => {
      mockedRequester = {
        id: 'testRequesterId',
        lastName: 'lastName',
      };
    });

    it('should render `Link` with correct label', () => {
      render(
        <MemoryRouter>
          <FullNameLink userId={mockedRequesterId} user={mockedRequester} />
        </MemoryRouter>
      );

      expect(getFullNameSpy).toHaveBeenCalled();
      expect(screen.getByText(mockedRequester.lastName)).toBeInTheDocument();
    });

    describe('and the requester has an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        const expectedResult = `/users/view/${mockedRequester.id}`;
        render(
          <MemoryRouter>
            <FullNameLink userId={mockedRequesterId} user={mockedRequester} />
          </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });

    describe('and the requester does not have an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        mockedRequester.id = null;
        render(
          <MemoryRouter>
            <FullNameLink userId={mockedRequesterId} user={mockedRequester} />
          </MemoryRouter>
        );
        const expectedResult = `/users/view/${mockedRequesterId}`;

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });
  });

  describe('When requester is not presented', () => {
    describe('and the requesterId exists', () => {
      it('should render unknown', () => {
        render(
          <MemoryRouter>
            <FullNameLink userId={mockedRequesterId} user={null} />
          </MemoryRouter>
        );
        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.queryAllByText('ui-requests.errors.user.unknown')).toHaveLength(1);
      });
    });

    describe('and the requesterId does not exist', () => {
      it('should render anonymized', () => {
        render(
          <MemoryRouter>
            <FullNameLink userId={null} user={null} />
          </MemoryRouter>
        );
        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.queryAllByText('ui-requests.requestMeta.anonymized')).toHaveLength(1);
      });
    });
  });
});
