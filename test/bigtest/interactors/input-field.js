import {
  interactor,
  clickable,
  fillable,
  triggerable,
  blurrable,
} from '@bigtest/interactor';


@interactor class InputField {
  clickInput = clickable();
  fillInput = fillable();
  blurInput = blurrable();

  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  fillAndBlur(val) {
    return this
      .clickInput()
      .fillInput(val)
      .pressEnter()
      .blurInput();
  }
}

export default InputField;
