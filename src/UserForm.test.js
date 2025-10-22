import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { ProxyManager } from '@folio/stripes/smart-components';

import UserForm from './UserForm';
import * as UserHighlightBox from './components/UserHighlightBox/UserHighlightBox';

const basicProps = {
  onCloseProxy: jest.fn(),
  onSelectProxy: jest.fn(),
  stripes: {
    connect: jest.fn((component) => component),
  },
  user: {
    lastName: 'userLastName',
    barcode: 'userBarcode',
    id: 'userId',
  },
  isEcsTlrSettingEnabled: false,
};
const labelIds = {
  proxyTitle: 'ui-requests.requester.proxy',
  requesterTitle: 'ui-requests.requester.requester',
  patronGroup: 'ui-requests.requester.patronGroup.group',
};

jest.mock('@folio/stripes/smart-components', () => ({
  ProxyManager: jest.fn(() => <div />),
}));
jest.mock('./utils', () => ({
  getFullName: jest.fn((user) => user.lastName),
  isProxyFunctionalityAvailable: jest.fn(() => true),
}));

describe('UserForm', () => {
  let userHighlightBoxSpy;
  beforeEach(() => {
    userHighlightBoxSpy = jest.spyOn(UserHighlightBox, 'default');
  });
  afterEach(() => {
    userHighlightBoxSpy.mockClear();
  });

  describe('When proxy is provided', () => {
    const props = {
      ...basicProps,
      proxy: {
        lastName: 'proxyLastName',
        barcode: 'proxyBarcode',
        id: 'proxyId',
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserForm
            {...props}
          />
        </MemoryRouter>
      );
    });

    it('should render requester label', () => {
      const requesterLabel = screen.getByText(labelIds.requesterTitle);

      expect(requesterLabel).toBeVisible();
    });

    it('should render proxy name', () => {
      const proxyName = screen.getByText(props.proxy.lastName);

      expect(proxyName).toBeVisible();
    });

    it('should render proxy barcode', () => {
      const proxyBarcode = screen.getByText(props.proxy.barcode);

      expect(proxyBarcode).toBeVisible();
    });

    it('should render patron group label', () => {
      const patronGroupLabel = screen.getByText(labelIds.patronGroup);

      expect(patronGroupLabel).toBeVisible();
    });

    it('should render proxy label', () => {
      const proxyLabel = screen.getByText(labelIds.proxyTitle);

      expect(proxyLabel).toBeVisible();
    });
  });

  describe('When proxy is not provided', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserForm
            {...basicProps}
          />
        </MemoryRouter>
      );
    });

    it('should render requester label', () => {
      const requesterLabel = screen.getByText(labelIds.requesterTitle);

      expect(requesterLabel).toBeVisible();
    });

    it('should render user name', () => {
      const userName = screen.getByText(basicProps.user.lastName);

      expect(userName).toBeVisible();
    });

    it('should render user barcode', () => {
      const userBarcode = screen.getByText(basicProps.user.barcode);

      expect(userBarcode).toBeVisible();
    });

    it('should not render proxy label', () => {
      const proxyLabel = screen.queryByText(labelIds.proxyTitle);

      expect(proxyLabel).not.toBeInTheDocument();
    });
  });

  describe('When creating a request', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserForm
            {...basicProps}
          />
        </MemoryRouter>
      );
    });

    it('should trigger "ProxyManager" with correct props', () => {
      const expectedProps = {
        patron: basicProps.user,
        proxy: {},
        onSelectPatron: basicProps.onSelectProxy,
        onClose: basicProps.onCloseProxy,
      };

      expect(ProxyManager).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('When editing a request', () => {
    const props = {
      ...basicProps,
      request: {},
    };

    beforeEach(() => {
      ProxyManager.mockClear();

      render(
        <MemoryRouter>
          <UserForm
            {...props}
          />
        </MemoryRouter>
      );
    });

    it('should not trigger "ProxyManager"', () => {
      expect(ProxyManager).not.toHaveBeenCalled();
    });
  });

  describe('When user id is provided', () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserForm
            {...basicProps}
          />
        </MemoryRouter>
      );
    });

    it('should trigger "UserHighlightBox" with user id', () => {
      expect(userHighlightBoxSpy).toHaveBeenCalledWith({
        title: expect.anything(),
        userId: null,
        user: basicProps.user
      }, {});
    });
  });

  describe('When user id is not provided', () => {
    const props = {
      ...basicProps,
      user: {
        ...basicProps.user,
        id: undefined,
      },
      request: {
        requesterId: 'requesterId',
      },
    };

    beforeEach(() => {
      render(
        <MemoryRouter>
          <UserForm
            {...props}
          />
        </MemoryRouter>
      );
    });

    it('should trigger "UserHighlightBox" with requester id', () => {
      expect(userHighlightBoxSpy).toHaveBeenCalledWith({
        title: expect.anything(),
        userId: props.request.requesterId,
        user: props.user,
      }, {});
    });
  });
});
