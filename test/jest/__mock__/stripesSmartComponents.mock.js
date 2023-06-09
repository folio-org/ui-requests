import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
  ClipCopy: jest.fn(() => null),
  makeQueryFunction: jest.fn((value) => value),
  CheckboxFilter: jest.fn(() => null),
  NoteEditPage: (props) => {
    return (
      <div>
        <div>NoteEditPage</div>
        {props.renderReferredRecord()}
      </div>
    );
  },
  NoteViewPage: (props) => {
    return (
      <div>
        <div>NoteViewPage</div>
        {props.renderReferredRecord()}
        <button type="button" onClick={props.onEdit}>onEdit</button>
      </div>
    );
  },
  NoteCreatePage: (props) => {
    return (
      <div>
        <div>NoteCreatePage</div>
        {props.renderReferredRecord()}
      </div>
    );
  },
  NotesSmartAccordion: jest.fn(() => null),
  SearchAndSort: jest.fn(() => null),
  ViewMetaData: jest.fn(() => null),
  withTags: jest.fn((WrappedComponent) => (props) => <WrappedComponent {...props} />),
}));
