import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class ChooseRequestTypeDialog {
  clickConfirm = clickable('[data-test-confirm-request-type]');
}

export default ChooseRequestTypeDialog;
