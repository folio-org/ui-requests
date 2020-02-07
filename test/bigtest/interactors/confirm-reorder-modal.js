import {
  interactor,
  clickable,
} from '@bigtest/interactor';


@interactor class ConfirmReorderModal {
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
  clickCancel = clickable('[data-test-confirmation-modal-cancel-button]');
}

export default ConfirmReorderModal;
