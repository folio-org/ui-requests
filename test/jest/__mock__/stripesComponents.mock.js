import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  Button: jest.fn(({ children }) => (
    <button data-test-button type="button">
      <span>
        {children}
      </span>
    </button>
  )),
  Col: jest.fn(({ children }) => (
    <div data-test-col>
      {children}
    </div>
  )),
  Headline: jest.fn(({ children }) => (
    <div data-test-headline>
      {children}
    </div>
  )),
  Modal: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  MultiColumnList: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  NoValue: jest.fn(() => (
    <span>No value</span>
  )),
  Pane: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Row: jest.fn(({ children }) => (
    <div data-test-row>
      {children}
    </div>
  )),
  KeyValue: jest.fn(({
    label,
    children,
    value,
  }) => (
    <div>
      <div>
        {label}
      </div>
      <div>
        {children || value}
      </div>
    </div>
  )),
}));

