import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import '../../../test/jest/__mock__';

import ItemLink from './ItemLink';

import {
  MISSING_VALUE_SYMBOL,
} from '../../constants';

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

    it('should render `-` instead of link', () => {
      expect(screen.getByText(MISSING_VALUE_SYMBOL)).toBeInTheDocument();
    });
  });
});
