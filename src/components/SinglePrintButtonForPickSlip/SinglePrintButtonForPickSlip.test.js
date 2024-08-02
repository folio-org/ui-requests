import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import SinglePrintButtonForPickSlip from './SinglePrintButtonForPickSlip';
import { isPrintable } from '../../utils';
import PrintButton from '../PrintButton';

const mockAccordionStatusRef = () => ({
  current: <div />,
});
const labelIds = {
  printButtonLabel: 'ui-requests.requests.printButtonLabel',
};

jest.mock('../../utils', () => ({
  isPrintable: jest.fn(),
  getSelectedSlipData: jest.fn(),
}));
jest.mock('../PrintButton', () => jest.fn(({ children }) => (
  <button type="button">
    {children}
  </button>
)));
jest.mock('../PrintContent', () => jest.fn(() => <div />));

describe('SinglePrintButtonForPickSlip', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const basicProps = {
    request: {
      id: 11,
    },
    pickSlipsToCheck: [
      {
        request: {
          requestID: '11',
        },
      },
      {
        request: {
          requestID: '22',
        },
      }
    ],
    pickSlipsPrintTemplate: '<div />',
    pickSlipsData: [
      {
        request: {
          requestID: '11',
        },
      },
      {
        request: {
          requestID: '22',
        },
      }
    ],
    onBeforeGetContentForSinglePrintButton: jest.fn(),
    onBeforePrintForSinglePrintButton: jest.fn(),
    getPrintContentRef: mockAccordionStatusRef,
  };

  describe('When content is printable', () => {
    beforeEach(() => {
      isPrintable.mockReturnValueOnce(true);

      render(
        <SinglePrintButtonForPickSlip
          {...basicProps}
        />
      );
    });

    it('should render enabled button', () => {
      const expectedProps = {
        disabled: false,
      };

      expect(PrintButton).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render print button label', () => {
      const printButtonLabel = screen.getByText(labelIds.printButtonLabel);

      expect(printButtonLabel).toBeInTheDocument();
    });
  });

  describe('When content is not printable', () => {
    beforeEach(() => {
      isPrintable.mockReturnValueOnce(false);

      render(
        <SinglePrintButtonForPickSlip
          {...basicProps}
        />
      );
    });

    it('should render disabled button', () => {
      const expectedProps = {
        disabled: true,
      };

      expect(PrintButton).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });
});
