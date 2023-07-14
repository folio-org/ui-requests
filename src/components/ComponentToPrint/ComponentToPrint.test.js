import React from 'react';
import { render, screen } from '@testing-library/react';
import { Parser } from 'html-to-react';
import ComponentToPrint from './ComponentToPrint';

jest.mock('react-barcode', () => {
  return jest.fn().mockImplementation(() => <div data-testid="barcode-component" />);
});

describe('ComponentToPrint', () => {
  const templateFnMock = jest.fn();
  const templateFn = jest.fn(() => '<barcode>123456</barcode>');
  const dataSource = { 'request':1 };
  const parser = new Parser();
  let originalParseWithInstructions;
  beforeEach(() => {
    templateFnMock.mockClear();
    originalParseWithInstructions = parser.parseWithInstructions;
  });
  afterEach(() => {
    parser.parseWithInstructions = originalParseWithInstructions;
  });
  it('should handle null result from parseWithInstructions', () => {
    parser.parseWithInstructions = jest.fn(() => null);
    render(<ComponentToPrint dataSource={dataSource} templateFn={templateFn} />);
    expect(screen.queryByTestId('barcode')).not.toBeInTheDocument();
  });
  it('should handle empty template string', () => {
    const emptyTemplateFn = jest.fn(() => null);
    const { container } = render(<ComponentToPrint dataSource={dataSource} templateFn={emptyTemplateFn} />);
    expect(container.firstChild).toBeNull();
  });
  it('should process the barcode rule with empty string', () => {
    const mockBarcodeValue = '123456789';
    const emptyString = '';
    const mockComponentStr = `<div><barcode>${mockBarcodeValue}</barcode><barcode>${emptyString}</barcode></div>`;
    templateFn.mockReturnValue(mockComponentStr);
    render(<ComponentToPrint dataSource={dataSource} templateFn={templateFn} />);
    const barcodeElement = screen.getAllByTestId('barcode-component')[0];
    expect(barcodeElement).toBeInTheDocument();
  });
  it('should process the barcode rule with data', () => {
    const mockParsedComponent = <div data-testid="mock-component">Mock Component</div>;
    parser.parseWithInstructions = jest.fn(() => mockParsedComponent);
    render(<ComponentToPrint dataSource={dataSource} templateFn={templateFn} />);
    const emptyBarcodeElement = screen.getAllByTestId('barcode-component')[1];
    expect(emptyBarcodeElement).toBeInTheDocument();
  });
});
