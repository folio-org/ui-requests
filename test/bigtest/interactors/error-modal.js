import {
  interactor,
  clickable,
  isPresent,
  scoped,
} from '@bigtest/interactor';

@interactor class ErrorModalInteractor {
  modalIsPresent = isPresent('[data-test-error-modal]');
  clickCloseBtn = clickable('[data-test-error-modal-close-button]');
  content = scoped('[data-test-error-modal-content]');
  closeButton = scoped('[data-test-error-modal-close-button]');

  whenModalIsPresent() {
    return this.when(() => this.modalIsPresent);
  }
}

export default ErrorModalInteractor;
