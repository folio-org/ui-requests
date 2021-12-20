import {
  collection,
  interactor,
  isPresent,
  scoped,
  text,
} from '@bigtest/interactor';

import DraggableRow from './draggable-row';

@interactor class SortableListInteractor {
  // rbd v11 placed three attributes, role=log, aria-live=assertive, and aria-atomic
  // on the container of the sortable list.
  // `role=log` was removed in https://github.com/atlassian/react-beautiful-dnd/commit/45ef30cd3ea422f8b9fb7eb142072f7e97b5272b#diff-98d5d7eb2b2f94535a8212ec54f4ec17c94c1bf123d9ffd0f22d0ec687a60a33
  // as part of https://github.com/atlassian/react-beautiful-dnd/pull/1741
  // to clean up lift announcements (https://github.com/atlassian/react-beautiful-dnd/issues/1695)
  //
  // because log and logPresent are part of the public API here,
  // the name has been left in place
  log = text('[aria-live="assertive"][aria-atomic]');
  logPresent = isPresent('[aria-live="assertive"][aria-atomic]');

  rows = collection('[data-test-draggable-row]', DraggableRow);

  row = scoped('#row-1', DraggableRow);

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
