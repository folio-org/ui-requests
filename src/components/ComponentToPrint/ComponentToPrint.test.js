import React from 'react';
import { render } from '@testing-library/react';
import ComponentToPrint from './ComponentToPrint';

// Mock the react-barcode library
jest.mock('react-barcode', () => {
  return jest.fn().mockImplementation(() => <div data-testid="barcode-component" />);
});

describe('ComponentToPrint', () => {
  const templateFnMock = jest.fn();
  const dataSourceMock = {};

  beforeEach(() => {
    templateFnMock.mockClear();
  });

  it('renders without crashing', () => {
    render(<ComponentToPrint templateFn={templateFnMock} dataSource={dataSourceMock} />);
  });

  it('renders a Barcode component when encountering a "barcode" tag in the template', () => {
    const templateFn = jest.fn(() => '<barcode>123456</barcode>');
    const dataSource = {};

    const { getByTestId } = render(<ComponentToPrint templateFn={templateFn} dataSource={dataSource} />);

    const barcodeComponent = getByTestId('barcode-component');

    expect(barcodeComponent).toBeInTheDocument();
  });
});
