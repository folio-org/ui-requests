import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class MoveRequestDialog {
  clickClose = clickable('[data-test-cancel-move-request]');
  chooseItem = clickable('[data-test-select-cancelation-reason]');
}

export default MoveRequestDialog;
