import React from 'react';

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  Accordion: jest.fn(({ children, label, name, onClearFilter }) => (
    <div>
      {label}
      {children}
      <div>
        <button
          type="button"
          onClick={() => onClearFilter()}
          data-testid={`clear-${name}`}
        >Clear
        </button>
      </div>
      <div data-testid={`accordion-${name}`} />
    </div>
  )),
  AccordionSet: jest.fn(({ children, onToggle }) => (
    <div>
      <button type="button" onClick={() => onToggle({ id: 'fulfillment-in-progress' })}>
        Toggle in Progress
      </button>
      <button type="button" onClick={() => onToggle({ id: 'not-yet-filled' })}>
        Toggle Not Yet Filled
      </button>
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
  ConfirmationModal: jest.fn(({ heading, confirmLabel, cancelLabel, onConfirm, onCancel }) => (
    <div>
      <span>ConfirmationModal</span>
      <div>
        <div>{heading}</div>
        <button type="button" onClick={onConfirm}>{confirmLabel}</button>
        <button type="button" onClick={onCancel}>{cancelLabel}</button>
      </div>
    </div>)),
  Datepicker: jest.fn(() => <div>Datepicker</div>),
  ErrorModal: jest.fn(({ label, content, buttonLabel, onClose }) => (
    <div>
      <span>ErrorModal</span>
      <div>{label}</div>
      <div>{content}</div>
      <button type="button" onClick={onClose}>{buttonLabel}</button>
    </div>)),
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
  Select: ({ name, label, onChange, required, children, value }) => {
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <select
          id={name}
          name={name}
          onChange={onChange}
          required={required}
          data-testid="select"
          value={value}
        >
          {children}
          Select
        </select>
      </div>
    );
  },
  TextArea: jest.fn(() => <div>TextArea</div>),
  TextField: jest.fn(() => <div>TextField</div>),
  Timepicker: jest.fn(() => <div>Timepicker</div>),
}));
