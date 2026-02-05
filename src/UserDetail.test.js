import {
  render,
  screen,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import { NoValue } from '@folio/stripes/components';

import UserDetail from './UserDetail';
import {
  userHighlightBox,
  getPatronGroup,
} from './utils';

const basicProps = {
  deliveryAddress: 'deliveryAddress',
  patronGroups: [],
  pickupServicePoint: 'SP',
  request: {
    requesterId: 'requesterId',
    requester: {
      id: 'requesterId',
      lastName: 'userLastName',
      barcode: 'userBarcode',
    },
    proxyUserId: 'proxyUserId',
    proxy: {
      id: 'proxyId',
      barcode: 'proxyBarcode',
      lastName: 'proxyLastName',
    },
    fulfillmentPreference: 'fulfillmentPreference',
  },
  user: { id: 'userId' },
  selectedDelivery: true,
  isEcsTlrSettingEnabled: false,
};
const labelIds = {
  proxy: 'ui-requests.requester.proxy',
  requester: 'ui-requests.requester.requester',
  patronGroup: 'ui-requests.requester.patronGroup.group',
  fulfillmentPref: 'ui-requests.requester.fulfillmentPref',
  deliveryAddress: 'ui-requests.deliveryAddress',
  pickupServicePoint: 'ui-requests.pickupServicePoint.name',
};

jest.mock('./utils', () => ({
  computeUserDisplayForRequest: jest.fn((request) => ({
    requesterNameLink: request.requester.lastName,
    requesterBarcodeLink: request.requester.barcode,
    ...(request.proxy ?
      {
        proxy: {
          proxyNameLink: request.proxy.lastName,
          proxyBarcodeLink: request.proxy.barcode
        }
      }
      : {}),
  })),
  userHighlightBox: jest.fn((label, name, barcode) => (
    <>
      <div>{label}</div>
      <div>{barcode}</div>
    </>
  )),
  getPatronGroup: jest.fn(() => ({
    group: 'testPatronGroup',
  })),
  isProxyFunctionalityAvailable: jest.fn(() => true),
}));

describe('UserDetail', () => {
  afterEach(() => {
    NoValue.mockClear();
    cleanup();
  });

  describe('when all data provided', () => {
    beforeEach(() => {
      render(
        <UserDetail {...basicProps} />
      );
    });

    it('should trigger "getPatronGroup" with correct arguments', () => {
      expect(getPatronGroup).toHaveBeenCalledWith(basicProps.user, basicProps.patronGroups);
    });

    it('should trigger "userHighlightBox" with correct arguments', () => {
      const expectedArgs = [
        [expect.anything(), basicProps.request.proxy.lastName, basicProps.request.proxy.barcode],
        [expect.anything(), basicProps.request.requester.lastName, basicProps.request.requester.barcode],
      ];

      expectedArgs.forEach((user, index) => {
        expect(userHighlightBox).toHaveBeenNthCalledWith(index + 1, ...user);
      });
    });

    it('should render proxy label', () => {
      const proxyLabel = screen.getByText(labelIds.proxy);

      expect(proxyLabel).toBeVisible();
    });

    it('should render requester label', () => {
      const requesterLabel = screen.getByText(labelIds.requester);

      expect(requesterLabel).toBeVisible();
    });

    it('should render patron group label', () => {
      const patronGroupLabel = screen.getByText(labelIds.patronGroup);

      expect(patronGroupLabel).toBeVisible();
    });

    it('should render fulfillment preferences label', () => {
      const fulfillmentPrefLabel = screen.getByText(labelIds.fulfillmentPref);

      expect(fulfillmentPrefLabel).toBeVisible();
    });

    it('should render delivery address label', () => {
      const deliveryAddressLabel = screen.getByText(labelIds.deliveryAddress);

      expect(deliveryAddressLabel).toBeVisible();
    });

    it('should not render pickup service point label', () => {
      const pickupServicePointLabel = screen.queryByText(labelIds.pickupServicePoint);

      expect(pickupServicePointLabel).toBeNull();
    });
  });

  describe('when "deliveryAddress" is not provided', () => {
    const props = {
      ...basicProps,
      deliveryAddress: undefined,
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });

  describe('when "selectedDelivery" is false', () => {
    const props = {
      ...basicProps,
      selectedDelivery: false,
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render pickup service point label', () => {
      const pickupServicePointLabel = screen.getByText(labelIds.pickupServicePoint);

      expect(pickupServicePointLabel).toBeVisible();
    });

    it('should not render delivery address label', () => {
      const deliveryAddressLabel = screen.queryByText(labelIds.deliveryAddress);

      expect(deliveryAddressLabel).toBeNull();
    });
  });

  describe('when "pickupServicePoint" is not provided', () => {
    const props = {
      ...basicProps,
      selectedDelivery: false,
      pickupServicePoint: undefined,
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });

  describe('when "fulfillmentPreference" is not provided', () => {
    const props = {
      ...basicProps,
      request: {
        ...basicProps.request,
        fulfillmentPreference: undefined,
      },
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });

  describe('when patron group is not provided', () => {
    beforeEach(() => {
      getPatronGroup.mockReturnValueOnce(undefined);
      render(
        <UserDetail {...basicProps} />
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });

  describe('when proxy is not provided', () => {
    const props = {
      ...basicProps,
      request: {
        ...basicProps.request,
        proxyUserId: null,
        proxy: null,
      },
    };

    beforeEach(() => {
      render(
        <UserDetail {...props} />
      );
    });

    it('should not render proxy label', () => {
      const proxyLabel = screen.queryByText(labelIds.proxy);

      expect(proxyLabel).toBeNull();
    });
  });
});
