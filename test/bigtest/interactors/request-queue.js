import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import SortableListInteractor from './sortable-list';

@interactor class RequestQueue {
  sortableList = new SortableListInteractor('body');
  sortableListPresent = isPresent('[class^="mclScrollable---"]');

  whenSortableListPresent() {
    return this.when(() => this.sortableListPresent);
  }
}

export default new RequestQueue();
