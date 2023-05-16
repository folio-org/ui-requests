import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
  ClipCopy: jest.fn(() => null),
  makeQueryFunction: jest.fn((value) => value),
  CheckboxFilter: jest.fn(() => null),
  NoteCreatePage: (props) => {
    return (
      <div>
        <div>NoteCreatePage</div>
        <button type="button" onClick={() => props.renderReferredRecord()}>renderReferredRecord</button>
      </div>
    );
  },
  NoteEditPage: (props) => {
    return (
      <div>
        <div>NoteEditPage</div>
        <button type="button" onClick={() => props.renderReferredRecord()}>renderReferredRecord</button>
      </div>
    );
  },
  NotesSmartAccordion: jest.fn(() => null),
  SearchAndSort: jest.fn(() => null),
  ViewMetaData: jest.fn(() => null),
  withTags: jest.fn((WrappedComponent) => (props) => <WrappedComponent {...props} />),
}));
