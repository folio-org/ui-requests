import React from 'react';

jest.mock('@folio/stripes-components', () => ({
  ...jest.requireActual('@folio/stripes-components'),
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
    buttonStyle,
    ...rest
  }) => (
    <button
      type="button"
      data-button-type={buttonStyle}
      {...rest}
    >
      <span>
        {children}
      </span>
    </button>
  )),
  Callout: jest.fn(() => <div>Callout</div>),
  Checkbox: jest.fn((props) => (
    <input
      type="checkbox"
      {...props}
    />
  )),
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
    label,
    'data-testid': testId,
  }) => (
    <div data-testid={testId}>
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
      <div>MultiColumnList</div>
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
  Select: jest.fn((props) => (
    <div>
      <div>{props.label}</div>
      <select {...props}>
        {props.children}
      </select>
    </div>)),
  TextArea: jest.fn(({
    'data-testid': testId,
  }) => <div data-testid={testId}>TextArea</div>),
  TextField: jest.fn(({
    label,
    onChange,
    validate = jest.fn(),
    ...rest
  }) => {
    const handleChange = (e) => {
      validate(e.target.value);
      onChange(e);
    };

    return (
      <div>
        <label htmlFor="textField">{label}</label>
        <input
          id="textField"
          onChange={handleChange}
          {...rest}
        />
      </div>
    );
  }),
  Timepicker: jest.fn(() => <div>Timepicker</div>),
}));
