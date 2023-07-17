import { fireEvent } from '@folio/jest-config-stripes/testing-library/react';

export const editRecordShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Ctrl',
    code: 'CtrlLeft',
    which: 17,
    keyCode: 17,
  });

  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
    ctrlKey: true,
  });

  fireEvent.keyDown(element, {
    key: 'e',
    keyCode: 69,
    which: 69,
    altKey: true,
    ctrlKey: true,
  });
};

export const duplicateRecordShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
  });

  fireEvent.keyDown(element, {
    key: 'c',
    keyCode: 67,
    which: 67,
    altKey: true,
  });
};

export const saveShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Ctrl',
    code: 'CtrlLeft',
    which: 17,
    keyCode: 17,
  });

  fireEvent.keyDown(element, {
    key: 's',
    keyCode: 83,
    which: 83,
    ctrlKey: true,
  });
};

export const cancelShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Esc',
    code: 'Escape',
    which: 27,
    keyCode: 27,
  });
};

export const openNewRecordShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
  });

  fireEvent.keyDown(element, {
    key: 'n',
    keyCode: 78,
    which: 78,
    altKey: true,
  });
};

export const focusSearchFieldShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Ctrl',
    code: 'CtrlLeft',
    which: 17,
    keyCode: 17,
  });

  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
    ctrlKey: true,
  });

  fireEvent.keyDown(element, {
    key: 'h',
    keyCode: 72,
    which: 72,
    altKey: true,
    ctrlKey: true,
  });
};

export const collapseSectionsShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Ctrl',
    code: 'CtrlLeft',
    which: 17,
    keyCode: 17,
  });

  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
    ctrlKey: true,
  });

  fireEvent.keyDown(element, {
    key: 'g',
    keyCode: 71,
    which: 71,
    altKey: true,
    ctrlKey: true,
  });
};

export const expandSectionsShortcut = element => {
  fireEvent.keyDown(element, {
    key: 'Ctrl',
    code: 'CtrlLeft',
    which: 17,
    keyCode: 17,
  });

  fireEvent.keyDown(element, {
    key: 'Alt',
    code: 'AltLeft',
    which: 18,
    keyCode: 18,
    ctrlKey: true,
  });

  fireEvent.keyDown(element, {
    key: 'b',
    keyCode: 66,
    which: 66,
    altKey: true,
    ctrlKey: true,
  });
};


