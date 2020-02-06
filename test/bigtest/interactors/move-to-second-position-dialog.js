import {
  clickable,
  interactor,
} from '@bigtest/interactor';

@interactor class MoveToSecondPositionDialog {
  clickClose = clickable('[data-test-confirmation-modal-cancel-button]');
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}

export default MoveToSecondPositionDialog;
