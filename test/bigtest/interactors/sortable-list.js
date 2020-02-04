import {
  interactor,
  collection,
  text,
  isPresent,
  scoped,
} from '@bigtest/interactor';

import DraggableRowInteractor from './draggable-row';

@interactor class SortableListInteractor {
  log = text('[role="log"]');
  logPresent = isPresent('[role="log"]');
  rows = collection('[data-test-draggable-row]', DraggableRowInteractor);

  row = scoped('#row-1', DraggableRowInteractor);

  moveRowUp() {
    return this
      .row.focus()
      .row.pressSpace()
      .whenRowLifted()
      .row
      .pressArrowUp()
      .whenRowMoved()
      .row
      .pressSpace()
      .whenRowDropped();
  }

  moveRowDown() {
    return this
      .row.focus()
      .row.pressSpace()
      .whenRowLifted()
      .row
      .pressArrowDown()
      .whenRowMoved()
      .row
      .pressSpace()
      .whenRowDropped();
  }

  whenRowLifted() {
    return this.when(() => !!this.log.match(/You have lifted an item/i));
  }

  whenRowMoved() {
    return this.when(() => !!this.log.match(/You have moved the item/i));
  }

  whenRowDropped() {
    return this.when(() => !!this.log.match(/You have dropped the item/i));
  }

  whenLogIsPresent() {
    return this.when(() => this.logPresent);
  }
}

export default SortableListInteractor;
