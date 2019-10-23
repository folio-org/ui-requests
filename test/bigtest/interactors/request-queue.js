import {
  interactor,
} from '@bigtest/interactor';

import SortableListInteractor from './sortable-list';

@interactor class RequestQueue {
  sortableList = new SortableListInteractor('[data-react-beautiful-dnd-droppable="1"]');
}

export default new RequestQueue();
