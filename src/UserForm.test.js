import React from 'react';
import { render, screen } from '@testing-library/react';
import UserForm from './UserForm';

jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  Field: () => <div>Field</div>,
}));

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getFullName: jest.fn(() => ({ user: '12', proxy:'11' })),
  userHighlightBox: jest.fn(() => 'userHighlightBox'),
}));

jest.mock('./constants', () => ({
  requestStatuses: jest.fn(() => ({ AWAITING_DELIVERY: 'AWAITING_DELIVERY', AWAITING_PICKUP:'AWAITING_PICKUP' })),
}));

jest.mock('@folio/stripes/smart-components', () => ({
  ProxyManager: () => <div>ProxyManager</div>,
}));

jest.mock('@folio/stripes/components', () => ({
  Col: jest.fn(({ children }) => (
    <div data-test-col>{ children }</div>)),
  KeyValue: jest.fn(({ label, children, value, 'data-testid': testId }) => (
    <div data-testid={testId}>
      <div>{ label }</div>
      <div>{ children || value }</div>
    </div>)),
  Row: jest.fn(({ children }) => (
    <div data-test-row>{ children }</div>)),
  Select: jest.fn(() => <div>Select</div>),
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
const deliveryLocations = [
  { value: '1', label: 'Location 1' },
  { value: '2', label: 'Location 2' },
];
const fulfilmentTypeOptions = [
  { labelTranslationPath: 'ui-requests.requester.fulfilmentPref.none', value: 'none' },
  { labelTranslationPath: 'ui-requests.requester.fulfilmentPref.delivery', value: 'delivery' },
  { labelTranslationPath: 'ui-requests.requester.fulfilmentPref.pickup', value: 'pickup' },
];
const servicePoints = [{ id:'1', name: 'test1' }, { id:'2', name: 'test2' }];
const mockOnChangeAddress = jest.fn(() => null);
const mockOnChangeFulfilment = jest.fn(() => null);
const mockOnCloseProxy = jest.fn(() => null);
const mockOnSelectProxy = jest.fn(() => null);
describe('UserForm', () => {
  it('should render ProxyManager', () => {
    const props = {
      deliveryLocations,
      fulfilmentTypeOptions,
      servicePoints,
      onChangeAddress: mockOnChangeAddress,
      onChangeFulfilment: mockOnChangeFulfilment,
      onCloseProxy: mockOnCloseProxy,
      onSelectProxy: mockOnSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: 'Staff',
      proxy: { id: '123', firstName: 'John', lastName: 'Doe', barcode: '123456789' },
      user: { id: '456', firstName: 'Jane', lastName: 'Doe', barcode: '987654321' },
      optionLabel : 'testoptionLabel'
    };

    render(<UserForm {...props} />);
    const ProxyManager = screen.getByText('ProxyManager');
    expect(ProxyManager).toBeInTheDocument();
  });
  it('should not renders ProxyManager', () => {
    const propsData = {
      deliverySelected: true,
      fulfilmentTypeOptions,
      onChangeAddress: mockOnChangeAddress,
      onChangeFulfilment: mockOnChangeFulfilment,
      onCloseProxy: mockOnCloseProxy,
      onSelectProxy: mockOnSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      proxy: {},
      user: { firstName: 'Jane', lastName: 'Doe', barcode: '987654321' },
      request: { AWAITING_PICKUP:'AWAITING_PICKUP' }
    };

    render(<UserForm {...propsData} />);
    const ProxyManager = screen.queryByText('ProxyManager');
    expect(ProxyManager).not.toBeInTheDocument();
  });
  it('should render the field', () => {
    const propsData = {
      deliverySelected: true,
      deliveryLocations,
      fulfilmentTypeOptions,
      onChangeAddress: mockOnChangeAddress,
      onChangeFulfilment: mockOnChangeFulfilment,
      onCloseProxy: mockOnCloseProxy,
      onSelectProxy: mockOnSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      patronGroup: '',
      proxy: {},
      user: { id: '456', firstName: 'Jane', lastName: 'Doe', barcode: '987654321' },
      request: { status : 'AWAITING_DELIVERY' },
    };

    render(<UserForm {...propsData} />);
    expect(screen.getAllByText('Field')).toBeDefined();
  });
});
