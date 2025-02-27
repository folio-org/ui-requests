import { BrowserRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import { NoValue } from '@folio/stripes/components';

import ItemLink from './ItemLink';

describe('ItemLink', () => {
  const mockedItem = {
    barcode: 'testItemBarcode',
  };
  const mockedRequest = {
    instanceId: 'testInstanceId',
    holdingsRecordId: 'testHoldingsRecordId',
    itemId: 'testItemId',
  };

  describe('if `item` is present in request', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <ItemLink
            request={{
              ...mockedRequest,
              item: mockedItem,
            }}
          />
        </BrowserRouter>
      );
    });

    it('should render `Link` with correct label', () => {
      expect(screen.getByText(mockedItem.barcode)).toBeInTheDocument();
    });

    it('should render `Link` with correct `href` attribute', () => {
      const expectedResult = `/inventory/view/${mockedRequest.instanceId}/${mockedRequest.holdingsRecordId}/${mockedRequest.itemId}`;

      expect(screen.getByRole('link')).toHaveAttribute('href', expectedResult);
    });
  });

  describe('if there is no `item` in request', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <ItemLink
            request={mockedRequest}
          />
        </BrowserRouter>
      );
    });

    it('should trigger NoValue component', () => {
      expect(NoValue).toHaveBeenCalled();
    });
  });
});
