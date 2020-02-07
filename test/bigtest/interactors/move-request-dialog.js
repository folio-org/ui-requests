import {
  interactor,
  clickable,
} from '@bigtest/interactor';

@interactor class MoveRequestDialog {
  chooseItem = clickable('#instance-items-list [class^="mclRow---"]:first-of-type');
}

export default MoveRequestDialog;
