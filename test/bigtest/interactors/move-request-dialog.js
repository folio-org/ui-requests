import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class MoveRequestDialog {
  clickClose = clickable('[data-test-cancel-move-request]');
  chooseItem = clickable('#instance-items-list [class^="mclRow---"]:first-of-type');
}

export default MoveRequestDialog;
