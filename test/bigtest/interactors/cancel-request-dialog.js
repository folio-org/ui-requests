import {
  interactor,
  clickable,
  selectable,
} from '@bigtest/interactor';

@interactor class CancelRequestDialog {
  clickConfirm = clickable('[data-test-confirm-cancel-request]');
  clickCancel = clickable('[data-test-cancel-cancel-request]');
  chooseReason = selectable('[data-test-select-cancelation-reason]');
}

export default CancelRequestDialog;
