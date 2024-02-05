import React from 'react';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import SinglePrintButtonForPickSlip from './SinglePrintButtonForPickSlip';

const testIds = {
  printContent: 'printContent',
};
const mockAccordionStatusRef = () => ({
  current: <div data-testid={testIds.testContent} />,
});
describe('SinglePrintButtonForPickSlip', () => {
  const basicProps = {
    rq: { id: 11 },
    pickSlipsToCheck: [
      {
        request: {
          requestID: '11'
        }
      },
      {
        request: {
          requestID: '22'
        }
      }
    ],

    pickSlipsPrintTemplate: '<div></div>',
    pickSlipsData: [
      { request: { requestID: '11' } },
      { request: { requestID: '22' } },
    ],
    onBeforeGetContentForSinglePrintButton: jest.fn(),

    getPrintContentRef: mockAccordionStatusRef
  };

  it('renders without crashing', () => {
    render(
      <SinglePrintButtonForPickSlip
        {...basicProps}
      />
    );
  });

  it('disables the button if not printable', () => {
    jest.spyOn(require('../../utils'), 'isPrintable').mockReturnValueOnce(false);

    const { getByTestId } = render(
      <SinglePrintButtonForPickSlip
        {...basicProps}
      />
    );

    // expect(getByTestId('singlePrintPickSlipsBtn')).toBeDisabled();
    expect(screen.getByRole('button', { name: /ui-requests\.requests\.printButtonLabel/i })).toBeDisabled();
  });

  it('enables the button if printable', () => {
    jest.spyOn(require('../../utils'), 'isPrintable').mockReturnValueOnce(true);

    const { getByTestId } = render(
      <SinglePrintButtonForPickSlip
        {...basicProps}
      />
    );

    expect(screen.getByRole('button', { name: /ui-requests\.requests\.printButtonLabel/i })).toBeEnabled();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
