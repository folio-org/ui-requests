import {
  interactor,
} from '@bigtest/interactor';

import SortableListInteractor from './sortable-list';

@interactor class RequestQueue {
  sortableList = new SortableListInteractor('[data-react-beautiful-dnd-droppable]');
}

export default new RequestQueue();
