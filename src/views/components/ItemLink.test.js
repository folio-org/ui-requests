import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import '../../../test/jest/__mock__';

import ItemLink from './ItemLink';

import {
  REQUEST_LEVEL_TYPES,
  MISSING_VALUE_SYMBOL,
} from '../../constants';

describe('ItemLink', () => {
  const mockedItem = {
    barcode: 'testItemBarcode',
  };
  const mockedRequest = {
    requestLevel: REQUEST_LEVEL_TYPES.ITEM,
    instanceId: 'testInstanceId',
    holdingsRecordId: 'testHoldingsRecordId',
    itemId: 'testItemId',
    item: mockedItem,
  };

  describe(`if request level is ${REQUEST_LEVEL_TYPES.ITEM}`, () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <ItemLink request={mockedRequest} />
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

  describe(`if request level is ${REQUEST_LEVEL_TYPES.TITLE}`, () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <ItemLink
            request={{
              ...mockedRequest,
              requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            }}
          />
        </BrowserRouter>
      );
    });

    it('should render `-` instead of link', () => {
      expect(screen.getByText(MISSING_VALUE_SYMBOL)).toBeInTheDocument();
    });
  });
});
