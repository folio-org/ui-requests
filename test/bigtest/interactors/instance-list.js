import {
  collection,
  count,
  interactor,
  clickable,
  text,
} from '@bigtest/interactor';

@interactor class HeaderInteractor {
  click = clickable('[data-test-clickable-header]');
}

@interactor class CellInteractor {
  content = text();
}

@interactor class ItemInteractor {
  cells = collection('[role=gridcell]', CellInteractor);
}

@interactor class InstanceList {
  static defaultScope = '#list-requests';
  size = count('[role=row] a');
  items = collection('[role=rowgroup] [role=row]', ItemInteractor);
  headers = collection('[role=columnheader]', HeaderInteractor);
}

export default InstanceList;
