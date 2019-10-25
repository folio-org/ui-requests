import {
  interactor,
  isPresent,
  clickable,
} from '@bigtest/interactor';

import SortableListInteractor from './sortable-list';

@interactor class ConfirmReorderModal {
  clickConfirm = clickable('[data-test-confirmation-modal-confirm-button]');
}

@interactor class RequestQueue {
  sortableList = new SortableListInteractor();
  sortableListPresent = isPresent('[class^="mclScrollable---"]');
  confirmReorderModalIsPresent = isPresent('#confirm-reorder');

  confirmReorderModal = new ConfirmReorderModal('#confirm-reorder');

  whenSortableListPresent() {
    return this.when(() => this.sortableListPresent);
  }

  confirmReorderModalPresent() {
    return this.when(() => this.confirmReorderModalIsPresent);
  }
}

export default new RequestQueue();
