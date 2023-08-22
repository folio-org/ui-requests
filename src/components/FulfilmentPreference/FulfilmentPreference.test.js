import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { FormattedMessage } from 'react-intl';

import FulfilmentPreference, {
  validate,
} from './FulfilmentPreference';

jest.mock('../../utils', () => ({
  getSelectedAddressTypeId: jest.fn(),
  isDeliverySelected: jest.fn(),
}));

const basicProps = {
  isEditForm: false,
  deliverySelected: false,
  deliveryAddress: 'deliveryAddress',
  onChangeAddress: jest.fn(),
  deliveryLocations: [],
  fulfillmentTypeOptions: [
    {
      labelTranslationPath: 'labelTranslationPath',
      value: 'value',
    }
  ],
  defaultDeliveryAddressTypeId: 'defaultId',
  changeDeliveryAddress: jest.fn(),
  requestTypes: {
    Hold: [
      {
        id: 'spId',
        name: 'spName',
      }
    ],
  },
  request: {},
  values: {
    requestType: 'Hold',
  },
  form: {
    change: jest.fn(),
  },
};
const labelIds = {
  fulfilmentPreference: 'ui-requests.requester.fulfillmentPref',
  deliveryAddress: 'ui-requests.deliveryAddress',
  pickupServicePoint: 'ui-requests.pickupServicePoint.name',
  selectItemError: 'ui-requests.errors.selectItem',
};
const testIds = {
  fulfilmentPreference: 'fulfilmentPreference',
  pickupServicePoint: 'pickupServicePoint',
};

describe('FulfilmentPreference', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    cleanup();
  });

  describe('when "deliverySelected" is false', () => {
    beforeEach(() => {
      render(
        <FulfilmentPreference
          {...basicProps}
        />
      );
    });

    it('should render fulfilment preference label', () => {
      const fulfilmentPreferenceLabel = screen.getByText(labelIds.fulfilmentPreference);

      expect(fulfilmentPreferenceLabel).toBeInTheDocument();
    });

    it('should render pickup service point label', () => {
      const pickupServicePointLabel = screen.getByText(labelIds.pickupServicePoint);

      expect(pickupServicePointLabel).toBeInTheDocument();
    });

    it('should not render delivery address label', () => {
      const deliveryAddressLabel = screen.queryByText(labelIds.deliveryAddress);

      expect(deliveryAddressLabel).not.toBeInTheDocument();
    });

    it('should not render delivery address', () => {
      const deliveryAddress = screen.queryByText(basicProps.deliveryAddress);

      expect(deliveryAddress).not.toBeInTheDocument();
    });

    describe('fulfilment preference changing', () => {
      beforeEach(() => {
        const event = {
          target: {
            value: 'test',
          },
        };
        const fulfilmentPreferenceSelect = screen.getByTestId(testIds.fulfilmentPreference);

        fireEvent.change(fulfilmentPreferenceSelect, event);
      });

      it('should trigger "form.change"', () => {
        expect(basicProps.form.change).toHaveBeenCalled();
      });

      it('should trigger "changeDeliveryAddress"', () => {
        expect(basicProps.changeDeliveryAddress).toHaveBeenCalled();
      });
    });
  });

  describe('when "deliverySelected" is true', () => {
    const props = {
      ...basicProps,
      deliverySelected: true,
      deliveryLocations: [
        {
          value: 'Home',
          label: 'Home',
        }
      ],
    };

    beforeEach(() => {
      render(
        <FulfilmentPreference
          {...props}
        />
      );
    });

    it('should render delivery address', () => {
      const deliveryAddress = screen.getByText(props.deliveryAddress);

      expect(deliveryAddress).toBeVisible();
    });

    it('should render delivery address label', () => {
      const deliveryAddressLabel = screen.getByText(labelIds.deliveryAddress);

      expect(deliveryAddressLabel).toBeInTheDocument();
    });

    it('should not render pickup service point label', () => {
      const pickupServicePointLabel = screen.queryByText(labelIds.pickupServicePoint);

      expect(pickupServicePointLabel).not.toBeInTheDocument();
    });
  });

  describe('when "isEditForm" is false', () => {
    it('should render request types for edit form', () => {
      render(
        <FulfilmentPreference
          {...basicProps}
        />
      );

      const servicePointName = screen.getByText(basicProps.requestTypes.Hold[0].name);

      expect(servicePointName).toBeInTheDocument();
    });
  });

  describe('when "isEditForm" is true', () => {
    it('should render request types for edit form', () => {
      const props = {
        ...basicProps,
        isEditForm: true,
        values: {},
        request: {
          requestType: 'Recall',
        },
        requestTypes: {
          Recall: [
            {
              id: 'testId',
              name: 'testName',
            }
          ],
        },
      };

      render(
        <FulfilmentPreference
          {...props}
        />
      );

      const servicePointName = screen.getByText(props.requestTypes.Recall[0].name);

      expect(servicePointName).toBeInTheDocument();
    });
  });

  describe('validate', () => {
    it('should return undefined', () => {
      expect(validate('test')).toBeUndefined();
    });

    it('should trigger "FormattedMessage" with correct props', () => {
      const expectedProps = {
        id: labelIds.selectItemError,
      };

      render(validate(''));

      expect(FormattedMessage).toHaveBeenCalledWith(expectedProps, {});
    });
  });
});
