import '__mock__/';
import { render, screen } from '@testing-library/react';

import { REQUEST_FORM_FIELD_NAMES, requestStatuses } from './constants';
import UserForm from './UserForm';

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getFullName: jest.fn((user) => user.lastName),
  userHighlightBox: jest.fn((name, id, barcode) => (
    <>
      <div>{name}</div>
      <div>{id}</div>
      <div>{barcode}</div>
    </>
  )),
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
];
const servicePoints = [
  { id: '1', name: REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID },
];

const proxy = { id: REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, firstName: 'Anna', lastName: 'Grey', barcode: '123456789' };
const onChangeAddress = jest.fn();
const onChangeFulfilment = jest.fn();
const onCloseProxy = jest.fn();
const onSelectProxy = jest.fn();
const fulfillmentPreference = REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE;

const formProps = {
  fulfillmentPreference,
  onChangeAddress,
  onChangeFulfilment,
  onCloseProxy,
  onSelectProxy,
  deliveryLocations,
  fulfilmentTypeOptions,
  servicePoints,
  stripes: { connect: jest.fn((component) => component) }
};

describe('UserForm', () => {
  it('should render UserForm', () => {
    const propsData = {
      deliverySelected: true,
      formProps,
      patronGroup: '',
      proxy: {},
      user,
    };

    const result = render(<UserForm {...propsData} {...formProps} />);
    expect(result).toBeTruthy();
  });
  describe('should render all props', () => {
    const defaultProps = {
      deliverySelected: true,
      user,
      patronGroup: 'Staff',
      proxy,
      optionLabel: 'testoptionLabel',
      request: { status : requestStatuses.AWAITING_DELIVERY },
      requireDeliveryAddress: jest.fn()
    };

    beforeEach(() => {
      render(<UserForm {...defaultProps} {...formProps} />);
    });
    it('should render fulfillmentPreference field', () => {
      const fulfillmentPreferenceField = screen.getByText(/fulfillmentPreference/i);
      expect(fulfillmentPreferenceField).toBeInTheDocument();
    });
    it('should render deliveryAddressSelect', () => {
      const deliveryAddressSelect = screen.getByText('ui-requests.deliveryAddress');
      expect(deliveryAddressSelect).toBeInTheDocument();
    });
    it('should render userSection', () => {
      const userSection = screen.getByText('proxyUserId');
      expect(userSection).toBeInTheDocument();
    });
    it('should not render PickupServicePointSelect', () => {
      const pickupServicePointSelect = screen.queryByText('ui-requests.pickupServicePoint.name');
      expect(pickupServicePointSelect).not.toBeInTheDocument();
    });
    it('should not render ProxyManager', () => {
      const proxyManager = screen.queryByTestId('proxy-manager');
      expect(proxyManager).not.toBeInTheDocument();
    });
  });
  it('should render PickupServicePointSelect when no deliverySelected', () => {
    const defaultProps = {
      user,
      patronGroup: 'Staff',
      proxy,
      optionLabel: 'testoptionLabel',
      request: { status : requestStatuses.AWAITING_DELIVERY }
    };
    const forProps = {
      onChangeAddress,
      onChangeFulfilment,
      onCloseProxy,
      onSelectProxy,
      fulfilmentTypeOptions,
      servicePoints,
      stripes: { connect: jest.fn((component) => component) }
    };
    render(<UserForm {...defaultProps} {...forProps} />);
    const pickupServicePointSelect = screen.getByText('ui-requests.pickupServicePoint.name');
    expect(pickupServicePointSelect).toBeInTheDocument();
  });
  it('should not render userSection', () => {
    const props = {
      patronGroup: 'Staff',
      proxy: null,
      user: { id: '456', firstName: 'Jenny', lastName: 'Smith' },
      optionLabel : 'testoptionLabel',
    };

    render(<UserForm {...props} {...formProps} />);
    const userSection = screen.getByText('ui-requests.requester.requester');
    expect(userSection).toBeInTheDocument();
  });
  describe('should render the expected values', () => {
    const props = {
      patronGroup: 'Staff',
      proxy,
      user: { id: REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, firstName: 'Jenny', lastName: 'Smith' },
      optionLabel : 'testoptionLabel',
    };
    beforeEach(() => {
      render(<UserForm {...props} {...formProps} />);
    });
    it('should not render deliveryAddressSelect', () => {
      const deliveryAddressSelect = screen.queryByText('ui-requests.deliveryAddress');
      expect(deliveryAddressSelect).not.toBeInTheDocument();
    });
    it('should not render proxySection', () => {
      const proxySection = screen.queryByText('ui-requests.requester.proxy');
      expect(proxySection).not.toBeInTheDocument();
    });
    it('should render ProxyManager', () => {
      const proxyManager = screen.getByTestId('proxy-manager');
      expect(proxyManager).toBeInTheDocument();
    });
  });
  it('Should render proxySection', () => {
    const props = {
      patronGroup: 'Staff',
      proxy,
      user: { id: '456', firstName: 'Jenny', lastName: 'Smith' },
      optionLabel : 'testoptionLabel'
    };

    render(<UserForm {...props} {...formProps} />);
    const proxySection = screen.getByText('ui-requests.requester.proxy');
    expect(proxySection).toBeInTheDocument();
  });
  it('should not render ProxyManager', () => {
    const propsData = {
      shouldDisableFulfillmentPreferenceField: true,
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
      request: { status : requestStatuses.AWAITING_PICKUP }
    };

    render(<UserForm {...propsData} />);
    const proxyManager = screen.queryByTestId('proxy-manager');
    expect(proxyManager).not.toBeInTheDocument();
  });
});
