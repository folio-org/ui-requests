// FullItemDetail.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import FullItemDetail from './FullItemDetail';
import { useOkapiKy } from '@folio/stripes/core';
import ItemDetail from '../../../ItemDetail';

// Mock the useOkapiKy hook
jest.mock('@folio/stripes/core', () => ({
  useOkapiKy: jest.fn(),
}));

// Mock the ItemDetail component
jest.mock('../../../ItemDetail', () => jest.fn(() => <div>ItemDetail Component</div>));

describe('FullItemDetail', () => {
  it('fetches full item by barcode and passes it to ItemDetail', async () => {
    const mockItem = { id: '1', barcode: '123456' };
    const fullItem = { id: '1', barcode: '123456', title: 'Mock Title' };

    const json = jest.fn().mockResolvedValue({ items: [fullItem] });
    const mockFetch = jest.fn().mockResolvedValue({ json });
    useOkapiKy.mockReturnValue(mockFetch);

    render(<FullItemDetail item={mockItem} />);

    // Wait for useEffect fetch to complete
    await waitFor(() => {
      expect(ItemDetail).toHaveBeenCalledWith(
        expect.objectContaining({
          item: fullItem,
        }),
        {}
      );
    });

    // Make sure the component still renders
    expect(screen.getByText('ItemDetail Component')).toBeInTheDocument();

    // Check if correct fetch URL was used
    expect(mockFetch).toHaveBeenCalledWith('inventory/items?query=barcode=="123456"');
  });
});
