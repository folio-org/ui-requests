import {
  clickable,
  interactor,
} from '@bigtest/interactor';

@interactor class MoveToSecondPositionDialog {
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}

export default MoveToSecondPositionDialog;
