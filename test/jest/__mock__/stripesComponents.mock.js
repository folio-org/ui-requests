import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Accordion: jest.fn(({ children, label }) => (
    <div>
      {label}
      {children}
    </div>
  )),
  AccordionSet: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Button: jest.fn(({
    children,
    ...rest
  }) => (
    <button
      type="button"
      {...rest}
    >
      <span>
        {children}
      </span>
    </button>
  )),
  Callout: jest.fn(() => <div>Callout</div>),
  Checkbox: jest.fn(() => <div>Checkbox</div>),
  Col: jest.fn(({ children }) => (
    <div data-test-col>
      {children}
    </div>
  )),
  ConfirmationModal: jest.fn(() => <div>ConfirmationModal</div>),
  Datepicker: jest.fn(() => <div>Datepicker</div>),
  ErrorModal: jest.fn(() => <div>ErrorModal</div>),
  FormattedDate: jest.fn(() => <div>Datepicker</div>),
  FilterAccordionHeader: jest.fn(({ children }) => <div>{children}</div>),
  Headline: jest.fn(({ children }) => (
    <div data-test-headline>
      {children}
    </div>
  )),
  Icon: jest.fn(({ children }) => <div>{children}</div>),
  Layout: jest.fn(({
    children,
    'data-testid': testId,
  }) => (
    <div data-testid={testId}>
      {children}
    </div>
  )),
  Modal: jest.fn(({
    children,
    footer,
    label
  }) => (
    <div>
      {label && label}
      {children}
      {footer}
    </div>
  )),
  ModalFooter: jest.fn(({ children }) => (
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
  PaneFooter: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  PaneHeaderIconButton: jest.fn(() => <div>PaneHeaderIconButton</div>),
  PaneMenu: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Paneset: jest.fn(({ children }) => (
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
    'data-testid': testId,
  }) => (
    <div data-testid={testId}>
      <div>
        {label}
      </div>
      <div>
        {children || value}
      </div>
    </div>
  )),
  Layer: jest.fn(({ children }) => (
    <div>
      {children}
    </div>
  )),
  Select: jest.fn(() => <div>Select</div>),
  TextArea: jest.fn(() => <div>TextArea</div>),
  TextField: jest.fn(() => <div>TextField</div>),
  Timepicker: jest.fn(() => <div>Timepicker</div>),
}));
