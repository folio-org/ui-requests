import {
  collection,
  count,
  interactor,
} from '@bigtest/interactor';

@interactor class InstanceList {
  static defaultScope = '#list-requests';
  size = count('[role=row] a');
  items = collection('[role=row] a');
}

export default InstanceList;
