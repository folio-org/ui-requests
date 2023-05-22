import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from './UserForm';

jest.mock('@folio/stripes/components', () => ({
  Col: ({ xs, children }) => (
    <div data-testid="col" xs={xs}>{children}</div>
  ),
  KeyValue: ({ label, value }) => (
    <div>
      <span>{label}:</span>
      <span data-testid="key-value">{value}</span>
    </div>
  ),
  Row: ({ children }) => (
    <div data-testid="row">{children}</div>
  ),
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
        </select>
      </div>
    );
  },
}));

jest.mock('react-final-form', () => ({
  Field: ({ name, label, component, onChange, required, validate, children }) => {
    const Component = component;
    return (
      <div>
        <label htmlFor={name}>{label}</label>
        <Component
          id={name}
          name={name}
          onChange={onChange}
          required={required}
          validate={validate}
        >
          {children}
        </Component>
      </div>
    );
  },
}));

jest.mock('@folio/stripes/smart-components', () => ({
  ProxyManager: () => (
    <div data-testid="proxy-manager" />
  ),
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getFullName: jest.fn(() => ({ user: '12', proxy:'11' })),
  userHighlightBox: jest.fn(() => 'userHighlightBox'),
}));

jest.mock('./constants', () => ({
  requestStatuses: jest.fn(() => ({ AWAITING_DELIVERY: 'AWAITING_DELIVERY', AWAITING_PICKUP:'AWAITING_PICKUP' })),
}));

jest.mock('react-intl', () => {
  return {
    ...jest.requireActual('react-intl'),
    FormattedMessage: jest.fn(({ id, children }) => {
      if (children) {
        return children([id]);
      }
      return id;
    }),
  };
});

const user = {
  id: '1234',
  firstName: 'test first name',
  lastName: 'test last name',
  barcode: '123456',
};
const deliveryLocations = [
  { value: 'location1', label: 'Location 1' },
  { value: 'location2', label: 'Location 2' },
];
const fulfilmentTypeOptions = [
  { labelTranslationPath: 'ui-requests.fulfilmentTypes.delivery', value: 'delivery' },
  { labelTranslationPath: 'ui-requests.fulfilmentTypes.pickup', value: 'pickup' },
];
const servicePoints = [
  { id: '1', name: 'Service Point 1' },
  { id: '2', name: 'Service Point 2' },
];
const onChangeAddress = jest.fn();
const onChangeFulfilment = jest.fn();
const onCloseProxy = jest.fn();
const onSelectProxy = jest.fn();

describe('UserForm', () => {
  it('renders delivery address select when deliverySelected is true', () => {
    const defaultProps = {
      deliveryLocations,
      deliverySelected: true,
      fulfilmentTypeOptions,
      servicePoints,
      user,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: 'Staff',
      proxy: { id: '123', firstName: 'proxyFirstName', lastName: 'proxyLastName', barcode: '123456789' },
      optionLabel : 'testoptionLabel'
    };
    render(<UserForm {...defaultProps} />);
    userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'ui-requests.deliveryAddress' }),
      screen.getByRole('option', { name: 'Location 2' }),
    );
    expect(screen.getByRole('option', { name: 'Location 2' }).selected).toBe(true);
  });
  it('renders servicePoints when deliverySelected is false', () => {
    const props = {
      deliveryLocations,
      deliverySelected: false,
      fulfilmentTypeOptions,
      servicePoints,
      user,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: 'Staff',
      proxy: { id: '123', firstName: 'proxyFirstName', lastName: 'proxyLastName', barcode: '123456789' },
      optionLabel : 'testoptionLabel'
    };
    render(<UserForm {...props} />);
    userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'ui-requests.pickupServicePoint.name' }),
      screen.getByRole('option', { name: 'Service Point 2' }),
    );
    expect(screen.getByRole('option', { name: 'Service Point 2' }).selected).toBe(true);
  });
  it('should renders UserForm', () => {
    const propsData = {
      deliverySelected: true,
      deliveryLocations,
      fulfilmentTypeOptions,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: '',
      proxy: {},
      user: { id: '456', firstName: 'userFirstName', lastName: 'userLastName', barcode: '987654321' },
      request: { status : 'AWAITING_DELIVERY' },
    };

    const result = render(<UserForm {...propsData} />);
    expect(result).toBeTruthy();
  });
  it('should renders ProxyManager', () => {
    const props = {
      deliveryLocations,
      fulfilmentTypeOptions,
      servicePoints,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: 'Staff',
      proxy: { id: '123', firstName: 'proxyFirstName', lastName: 'proxyLastName', barcode: '123456789' },
      user: { id: '456', firstName: 'userFirstName', lastName: 'userLastName', barcode: '987654321' },
      optionLabel : 'testoptionLabel'
    };

    render(<UserForm {...props} />);
    const ProxyManager = screen.getByTestId('proxy-manager');
    expect(ProxyManager).toBeInTheDocument();
  });
  it('should not renders ProxyManager', () => {
    const propsData = {
      deliverySelected: true,
      fulfilmentTypeOptions,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      proxy: {},
      user: { firstName: 'userFirstName', lastName: 'userLastName', barcode: '987654321' },
      request: { AWAITING_PICKUP:'AWAITING_PICKUP' }
    };

    render(<UserForm {...propsData} />);
    const ProxyManager = screen.queryByTestId('proxy-manager');
    expect(ProxyManager).not.toBeInTheDocument();
  });
});
