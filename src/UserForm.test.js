import '__mock__/';
import '__mock__/reactFinalForm.mock';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { REQUEST_FORM_FIELD_NAMES, requestStatuses } from './constants';
import UserForm from './UserForm';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getFullName: jest.fn(() => ({ user: '12', proxy:'11' })),
  userHighlightBox: jest.fn(() => 'userHighlightBox'),
}));

const user = {
  id: REQUEST_FORM_FIELD_NAMES.REQUESTER_ID,
  firstName: 'Jenny',
  lastName: 'Smith',
  barcode: REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE,
};
const deliveryLocations = [
  { value: '1', label: REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID },
];
const fulfilmentTypeOptions = [
  { labelTranslationPath: 'ui-requests.fulfilmentTypes.delivery', value: 'delivery' },
  { labelTranslationPath: 'ui-requests.fulfilmentTypes.pickup', value: 'pickup' },
];
const servicePoints = [
  { id: '1', name: REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID },
];
const onChangeAddress = jest.fn();
const onChangeFulfilment = jest.fn();
const onCloseProxy = jest.fn();
const onSelectProxy = jest.fn();

const formProps = {
  onChangeAddress,
  onChangeFulfilment,
  onCloseProxy,
  onSelectProxy,
  deliveryLocations,
  fulfilmentTypeOptions,
  servicePoints,
  stripes: { connect: jest.fn((component) => component) },
};
describe('UserForm', () => {
  it('should render delivery address select when deliverySelected is true', () => {
    const defaultProps = {
      deliverySelected: true,
      user,
      patronGroup: 'Staff',
      proxy: { id: REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, firstName: 'Anna', lastName: 'Grey', barcode: '123456789' },
      optionLabel: 'testoptionLabel',
      request: { status : requestStatuses.AWAITING_DELIVERY }
    };
    render(<UserForm {...defaultProps} {...formProps} />);
    userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'ui-requests.deliveryAddress' }),
      screen.getByRole('option', { name: 'deliveryAddressTypeId' }),
    );
    expect(screen.getByRole('option', { name: 'deliveryAddressTypeId' }).selected).toBe(true);
  });
  it('should render servicePoints when deliverySelected is false', () => {
    const props = {
      formProps,
      deliverySelected: false,
      user,
      patronGroup: 'Staff',
      proxy: { id: REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, firstName: 'Anna', lastName: 'Grey', barcode: '123456789' },
      optionLabel : 'testoptionLabel',
      request: { status : requestStatuses.AWAITING_DELIVERY },
    };
    render(<UserForm {...props} {...formProps} />);
    userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'ui-requests.pickupServicePoint.name' }),
      screen.getByRole('option', { name: 'pickupServicePointId' }),
    );
    expect(screen.getByRole('option', { name: 'pickupServicePointId' }).selected).toBe(true);
  });
  it('should render UserForm', () => {
    const propsData = {
      deliverySelected: true,
      formProps,
      patronGroup: '',
      proxy: {},
      user: { id: '456', firstName: 'Anna', lastName: 'Grey', barcode: '987654321' },
    };

    const result = render(<UserForm {...propsData} {...formProps} />);
    expect(result).toBeTruthy();
  });
  it('should render ProxyManager', () => {
    const props = {
      patronGroup: 'Staff',
      proxy: { id: REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, firstName: 'Anna', lastName: 'Grey', barcode: '123456789' },
      user: { id: '456', firstName: 'Jenny', lastName: 'Smith', barcode: '987654321' },
      optionLabel : 'testoptionLabel',
    };

    render(<UserForm {...props} {...formProps} />);
    const ProxyManager = screen.getByTestId('proxy-manager');
    expect(ProxyManager).toBeInTheDocument();
  });
  it('should not render ProxyManager', () => {
    const propsData = {
      deliverySelected: true,
      fulfilmentTypeOptions,
      servicePoints,
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      stripes: { connect: jest.fn((component) => component) },
      proxy: {},
      user: { firstName: 'Jenny', lastName: 'Smith', barcode: '987654321' },
      request: { status : requestStatuses.AWAITING_PICKUP },
    };

    render(<UserForm {...propsData} />);
    const ProxyManager = screen.queryByTestId('proxy-manager');
    expect(ProxyManager).not.toBeInTheDocument();
  });
});
