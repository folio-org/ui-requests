import {
  interactor,
  focusable,
  triggerable,
  attribute,
  collection,
} from '@bigtest/interactor';

@interactor class DraggableRowInteractor {
  focus = focusable();

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

  isDragging = attribute('data-test-is-dragging');

  whenDragStart() {
    return this.when(() => this.isDragging === 'true');
  }

  // there is no easy way to detect if the row
  // has been dropped already so just wait
  wait(ms = 1000) {
    let ready;
    setTimeout(() => { ready = true; }, ms);
    return this.when(() => ready === true);
  }

  moveUp() {
    return this
      .focus()
      .pressSpace()
      .whenDragStart()
      .pressArrowUp()
      .wait()
      .pressSpace();
  }

  moveDown() {
    return this
      .focus()
      .pressSpace()
      .whenDragStart()
      .pressArrowDown()
      .wait()
      .pressSpace();
  }
}

@interactor class SortableListInteractor {
  firstRow = new DraggableRowInteractor('#draggable-0');
  secondRow = new DraggableRowInteractor('#draggable-1');
  thirdRow = new DraggableRowInteractor('#draggable-2');

  rows = collection('[data-test-is-dragging]', DraggableRowInteractor);
}

export default SortableListInteractor;
