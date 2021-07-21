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
  NoValue: jest.fn(() => (
    <span>No value</span>
  )),
  Row: jest.fn(({ children }) => (
    <div data-test-row>
      {children}
    </div>
  )),
}));

