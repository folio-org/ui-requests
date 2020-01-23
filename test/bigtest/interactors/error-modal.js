import {
  interactor,
  clickable,
  isPresent,
} from '@bigtest/interactor';

@interactor class ErrorModalInteractor {
  modalIsPresent = isPresent('[data-test-error-modal]');
  clickCloseBtn = clickable('[data-test-error-modal-close-button]');

  whenModalIsPresent() {
    return this.when(() => this.modalIsPresent);
  }
}

export default new ErrorModalInteractor('#OverlayContainer');
