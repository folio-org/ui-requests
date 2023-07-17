import React from 'react';
import {
  render,
  screen,
  within,
} from '@folio/jest-config-stripes/testing-library/react';

import '../test/jest/__mock__';

import ItemDetail from './ItemDetail';
import { INVALID_REQUEST_HARDCODED_ID } from './constants';

jest.mock('react-router-dom', () => ({
  Link: jest.fn(({ to, children }) => <a href={to}>{children}</a>),
}));

describe('ItemDetail', () => {
  const testIds = {
    itemBarcodeLink: 'itemBarcodeLink',
  };
  const defaultRequest = {
    itemId: 'testItemId',
    instance: {
      title: 'testTitle',
    },
  };
  const item = {
    barcode: 'testItemBarcode',
  };
  const defaultProps = {
    item,
  };

  describe('with valid request', () => {
    const validRequest = {
      ...defaultRequest,
      instanceId: 'testInstanceId',
      holdingsRecordId: 'testHoldingRecordId',
    };

    beforeEach(() => {
      render(
        <ItemDetail
          {...defaultProps}
          request={validRequest}
        />
      );
    });

    it('should render "item barcode" as a link', () => {
      const keyValueWithLink = screen.getByTestId(testIds.itemBarcodeLink);
      const link = within(keyValueWithLink).getByRole('link');

      expect(within(link).getByText(item.barcode)).toBeInTheDocument();
    });
  });

  describe('with invalid request', () => {
    const invalidRequest = {
      ...defaultRequest,
      instanceId: INVALID_REQUEST_HARDCODED_ID,
      holdingsRecordId: INVALID_REQUEST_HARDCODED_ID,
    };

    beforeEach(() => {
      render(
        <ItemDetail
          {...defaultProps}
          request={invalidRequest}
        />
      );
    });

    it('should render "item barcode" without link', () => {
      const keyValueWithLink = screen.getByTestId(testIds.itemBarcodeLink);
      const link = within(keyValueWithLink).queryByRole('link');

      expect(link).not.toBeInTheDocument();
      expect(within(keyValueWithLink).getByText(item.barcode)).toBeInTheDocument();
    });
  });
});
