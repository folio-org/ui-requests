import React from 'react';

jest.mock('@folio/stripes/smart-components', () => ({
  makeQueryFunction: jest.fn((value) => value),
  NotesSmartAccordion: jest.fn(() => null),
  SearchAndSort: jest.fn(() => null),
  ViewMetaData: jest.fn(() => null),
  withTags: jest.fn((WrappedComponent) => (props) => <WrappedComponent {...props} />),
}));
