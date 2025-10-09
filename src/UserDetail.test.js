import {
  render,
  screen,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { NoValue } from '@folio/stripes/components';

import UserDetail from './UserDetail';
import {
  getFullName,
  getPatronGroup,
} from './utils';
import * as UserHighlightBox from './components/UserHighlightBox/UserHighlightBox';

const basicProps = {
  deliveryAddress: 'deliveryAddress',
  patronGroups: [],
  pickupServicePoint: 'SP',
  proxy: {
    barcode: 'proxyBarcode',
    id: 'proxyId',
    lastName: 'proxyLastName',
  },
  request: {
    requesterId: 'requesterId',
    proxyUserId: 'proxyUserId',
    fulfillmentPreference: 'fulfillmentPreference',
  },
  user: {
    id: 'userId',
    barcode: 'userBarcode',
    lastName: 'userLastName',
  },
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
  getFullName: jest.fn((user) => user.lastName),
  getPatronGroup: jest.fn(() => ({
    group: 'testPatronGroup',
  })),
  isProxyFunctionalityAvailable: jest.fn(() => true),
}));

describe('UserDetail', () => {
  let userHighlightBoxSpy;
  beforeEach(() => {
    userHighlightBoxSpy = jest.spyOn(UserHighlightBox, 'default');
  });
  afterEach(() => {
    NoValue.mockClear();
    cleanup();
  });

  describe('when all data provided', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserDetail {...basicProps} />
        </MemoryRouter>
      );
    });

    it('should trigger "getFullName" with correct argument', () => {
      const expectedArgs = [basicProps.user, basicProps.proxy];

      expectedArgs.forEach((user, index) => {
        expect(getFullName).toHaveBeenNthCalledWith(index + 1, user);
      });
    });

    it('should trigger "getPatronGroup" with correct arguments', () => {
      expect(getPatronGroup).toHaveBeenCalledWith(basicProps.user, basicProps.patronGroups);
    });

    it('should trigger "UserHighlightBox" with correct arguments', () => {
      // I don't know why the Nth call method stopped working
      // but I think it has something to do with the bonus {} passed as part
      // of a component's constructor
      expect(userHighlightBoxSpy.mock.calls[0][0]).toEqual({ title: expect.anything(), user: basicProps.user });
      expect(userHighlightBoxSpy.mock.calls[1][0]).toEqual({ title: expect.anything(), user: basicProps.proxy });
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
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
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
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
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
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
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
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
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
        <MemoryRouter>
          <UserDetail {...basicProps} />
        </MemoryRouter>
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });

  describe('when proxy is not provided', () => {
    const props = {
      ...basicProps,
      proxy: null,
    };

    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
      );
    });

    it('should not render proxy label', () => {
      const proxyLabel = screen.queryByText(labelIds.proxy);

      expect(proxyLabel).toBeNull();
    });
  });

  describe('when proxy id and proxy user id are not provided', () => {
    const props = {
      ...basicProps,
      proxy: {
        ...basicProps.proxy,
        id: undefined,
      },
      request: {
        ...basicProps.request,
        proxyUserId: undefined,
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
      );
    });

    it('should not render proxy label', () => {
      const proxyLabel = screen.queryByText(labelIds.proxy);

      expect(proxyLabel).toBeNull();
    });
  });

  describe('when proxy barcode is not provided', () => {
    const props = {
      ...basicProps,
      proxy: {
        ...basicProps.proxy,
        barcode: undefined,
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserDetail {...props} />
        </MemoryRouter>
      );
    });

    it('should render "NoValue" component once', () => {
      expect(NoValue).toBeCalledTimes(1);
    });
  });
});
