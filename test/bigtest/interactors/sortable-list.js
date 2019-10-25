import {
  interactor,
  focusable,
  triggerable,
  collection,
  text,
  isPresent,
  scoped,
} from '@bigtest/interactor';

@interactor class DraggableRowInteractor {
  focus = focusable();
  cols = collection('[role="gridcell"]');

  pressSpace = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 32,
    which: 32,
  });

  pressArrowUp = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 38,
    key: 'ArrowUp',
  });

  pressArrowDown = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 40,
    key: 'ArrowDown',
  });
}

@interactor class SortableListInteractor {
  log = text('[role="log"]');
  logPresent = isPresent('[role="log"]');
  rows = collection('[data-test-draggable-row]', DraggableRowInteractor);

  row1 = scoped('#row-0', DraggableRowInteractor);
  row2 = scoped('#row-1', DraggableRowInteractor);
  row3 = scoped('#row-2', DraggableRowInteractor);

  moveRowUp() {
    return this
      .row3.focus()
      .row3.pressSpace()
      .whenRowLifted()
      .row3
      .pressArrowUp()
      .whenRowMoved()
      .row3
      .pressSpace()
      .whenRowDropped();
  }

  moveRowDown() {
    return this
      .row2.focus()
      .row2.pressSpace()
      .whenRowLifted()
      .row2
      .pressArrowDown()
      .whenRowMoved()
      .row2
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
