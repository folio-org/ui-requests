import {
  clickable,
  collection,
  interactor,
  isPresent,
  scoped,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  defaultScope = '[data-test-error-modal]';

  content = scoped('[data-test-error-modal-content]');
  errors = collection('[data-test-error-text]');
  closeButton = scoped('[data-test-error-modal-close-button]');

  modalIsPresent = isPresent('[data-test-error-modal]');
  clickCloseBtn = clickable('[data-test-error-modal-close-button]');

  whenModalIsPresent() {
    return this.when(() => this.modalIsPresent);
  }
}

export default ErrorModal;
