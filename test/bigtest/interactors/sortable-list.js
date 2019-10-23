import {
  interactor,
  focusable,
  triggerable,
  attribute,
} from '@bigtest/interactor';

@interactor class DraggableRowInteractor {
  focusRow = focusable();

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
      .focusRow()
      .pressSpace()
      .whenDragStart()
      .pressArrowUp()
      .wait()
      .pressSpace();
  }

  moveDown() {
    return this
      .focusRow()
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
}

export default SortableListInteractor;
