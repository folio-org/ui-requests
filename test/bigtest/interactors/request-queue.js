import {
  interactor,
  isPresent,
  clickable,
  scoped,
} from '@bigtest/interactor';

import SortableListInteractor from './sortable-list';
import ConfirmReorderModal from './confirm-reorder-modal';
import KeyValue from './KeyValue';

@interactor class RequestQueue {
  itemCallNumber = scoped('[data-test-item-call-number] div', KeyValue);
  sortableList = new SortableListInteractor();
  sortableListPresent = isPresent('[class^="mclScrollable---"]');
  confirmReorderModalIsPresent = isPresent('#confirm-reorder');
  close = clickable('[data-test-close-request-queue-view]');

  confirmReorderModal = new ConfirmReorderModal('#confirm-reorder');

  whenSortableListPresent() {
    return this.when(() => this.sortableListPresent);
  }

  confirmReorderModalPresent() {
    return this.when(() => this.confirmReorderModalIsPresent);
  }
}

export default RequestQueue;
