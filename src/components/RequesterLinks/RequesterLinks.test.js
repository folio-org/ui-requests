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
    let mockedRequest;
    beforeEach(() => {
      mockedRequester = {
        id: 'testRequesterId',
        barcode: 'testRequesterBarcode',
      };
      mockedRequest = {
        requesterId: 'testRequestRequesterId',
        requester: mockedRequester,
      };
    });

    it('should render `Link` with correct label', () => {
      render(
        <MemoryRouter>
          <BarcodeLink request={mockedRequest} />
        </MemoryRouter>
      );

      expect(screen.getByText(mockedRequester.barcode)).toBeInTheDocument();
    });

    describe('and the requester has an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        const expectedResult = `/users/view/${mockedRequester.id}`;
        render(
          <MemoryRouter>
            <BarcodeLink request={mockedRequest} />
          </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });

    describe('and the requester does not have an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        mockedRequest.requester.id = null;
        render(
          <MemoryRouter>
            <BarcodeLink request={mockedRequest} />
          </MemoryRouter>
        );
        const expectedResult = `/users/view/${mockedRequest.requesterId}`;

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });
  });

  describe('When barcode is not presented', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <BarcodeLink request={{}} />
        </MemoryRouter>
      );
    });

    it('should trigger NoValue component', () => {
      expect(NoValue).toHaveBeenCalled();
    });
  });
});

describe('FullNameLink', () => {
  let mockedRequest;
  let getFullNameSpy;
  beforeEach(() => {
    mockedRequest = {
      requesterId: 'testRequestRequesterId',
    };
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
      mockedRequest.requester = mockedRequester;
    });

    it('should render `Link` with correct label', () => {
      render(
        <MemoryRouter>
          <FullNameLink request={mockedRequest} />
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
            <FullNameLink request={mockedRequest} />
          </MemoryRouter>
        );

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });

    describe('and the requester does not have an id', () => {
      it('should render `Link` with correct `href` attribute', () => {
        mockedRequest.requester.id = null;
        render(
          <MemoryRouter>
            <FullNameLink request={mockedRequest} />
          </MemoryRouter>
        );
        const expectedResult = `/users/view/${mockedRequest.requesterId}`;

        expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
      });
    });
  });

  describe('When requester is not presented', () => {
    describe('and the requesterId exists', () => {
      it('should render unknown', () => {
        render(
          <MemoryRouter>
            <FullNameLink request={mockedRequest} />
          </MemoryRouter>
        );
        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.queryAllByText('ui-requests.requestMeta.unknown')).toHaveLength(1);
      });
    });

    describe('and the requesterId does not exist', () => {
      it('should render anonymized', () => {
        mockedRequest.requesterId = null;
        render(
          <MemoryRouter>
            <FullNameLink request={mockedRequest} />
          </MemoryRouter>
        );
        expect(screen.queryAllByRole('link')).toHaveLength(0);
        expect(screen.queryAllByText('ui-requests.requestMeta.anonymized')).toHaveLength(1);
      });
    });
  });
});
