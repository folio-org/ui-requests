import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import '../test/jest/__mock__';

import CancelRequestDialog from './CancelRequestDialog';

const labelIds = {
  modalLabel: 'ui-requests.cancel.modalLabel',
  modalText: 'ui-requests.cancel.requestWillBeCancelled',
  cancelRequestDialogCancel: 'stripes-core.button.confirm',
  cancelRequestDialogClose: 'stripes-core.button.back',
};
const testIds = {
  cancelRequestDialog: 'cancelRequestDialog',
  cancelRequestDialogCancel: 'cancelRequestDialogCancel',
  cancelRequestDialogClose: 'cancelRequestDialogClose',
};

describe('CancelRequestDialog', () => {
  const onCancelRequest = jest.fn();
  const onClose = jest.fn();
  const cancellationReasons = {
    records: [{
      name: 'cancellation reasons',
      requiresAdditionalInformation: false,
    }, {
      name: 'other cancellation reasons',
      requiresAdditionalInformation: true,
    }],
  };
  const defaultProps = {
    request: {
      id: 'ad038163-7368-44e8-9057-c21bd2b9cd4c',
      instance: {
        title: 'title',
      },
    },
    onCancelRequest,
    onClose,
    open: true,
    resources: {
      cancellationReasons,
    },
    stripes: {
      user: {
        user: {
          id: 'bd038163-7368-44e8-9057-c21bd2b9cd4c',
        },
      },
    },
  };

  describe('CancelRequestDialog with request', () => {
    beforeEach(() => {
      render(
        <CancelRequestDialog {...defaultProps} />
      );
    });

    it('should render cancelRequestDialog', () => {
      expect(screen.getByTestId(testIds.cancelRequestDialog)).toBeInTheDocument();
    });

    it('should render modal label', () => {
      expect(screen.getByText(labelIds.modalLabel)).toBeInTheDocument();
    });

    it('should render modal text', () => {
      expect(screen.getByText(labelIds.modalText)).toBeInTheDocument();
    });

    it('should render close button text', () => {
      expect(screen.getByText(labelIds.cancelRequestDialogClose)).toBeInTheDocument();
    });

    it('should be called onClose after clicking on close button', () => {
      fireEvent.click(screen.getByTestId(testIds.cancelRequestDialogClose));

      expect(onClose).toBeCalled();
    });

    it('should render cancel button text', () => {
      expect(screen.getByText(labelIds.cancelRequestDialogCancel)).toBeInTheDocument();
    });

    it('should be called onCancelRequest after clicking on cancel button', () => {
      fireEvent.click(screen.getByTestId(testIds.cancelRequestDialogCancel));

      expect(onCancelRequest).toBeCalled();
    });
  });

  describe('CancelRequestDialog without request', () => {
    const propsWithoutRequest = {
      ...defaultProps,
      request: null,
    };

    beforeEach(() => {
      render(
        <CancelRequestDialog {...propsWithoutRequest} />
      );
    });

    it('should not render cancelRequestDialog', () => {
      expect(screen.queryByTestId(testIds.cancelRequestDialog)).not.toBeInTheDocument();
    });
  });
});
