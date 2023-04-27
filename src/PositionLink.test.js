import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import {
  requestStatuses,
} from './constants';

import '../test/jest/__mock__';

import PositionLink from './PositionLink';

jest.mock('react-router-dom', () => ({
  Link: jest.fn(({ to, children }) => <a href={to}>{children}</a>),
}));

const testIds = {
  positionLink: 'positionLink',
};
const labelIds = {
  requests: 'ui-requests.requests',
  viewRequestsInQueue: 'ui-requests.actions.viewRequestsInQueue',
};

describe('PositionLink', () => {
  const baseConfig = {
    request: {},
    isTlrEnabled: true,
  };
  const normalConfig = {
    request: {
      status: requestStatuses.AWAITING_DELIVERY,
      position: 1,
      instanceId: 'instanceId',
      itemId: 'itemId',
    },
    isTlrEnabled: true,
  };
  const renderComponent = ({
    request,
    isTlrEnabled,
  }) => {
    render(
      <PositionLink
        request={request}
        isTlrEnabled={isTlrEnabled}
      />
    );
  };
  const positionLink = (isTlrEnabled) => {
    describe(`with normal config and TLR ${isTlrEnabled}`, () => {
      beforeEach(() => renderComponent({
        ...normalConfig,
        isTlrEnabled,
      }));

      it('should be rendered position link component', () => {
        expect(screen.getByTestId(testIds.positionLink)).toBeInTheDocument();
      });

      it('should render link position', () => {
        expect(screen.getByText(`${normalConfig.request.position} (${labelIds.requests})`)).toBeInTheDocument();
      });

      it('should render view requests in queue', () => {
        expect(screen.getByText(labelIds.viewRequestsInQueue)).toBeInTheDocument();
      });

      it('should create correct href', () => {
        const filters = 'requestStatus.Open - Not yet filled,requestStatus.Open - Awaiting pickup,requestStatus.Open - Awaiting delivery,requestStatus.Open - In transit';
        const href = `/requests?filters=${filters}&query=${isTlrEnabled ? 'instanceId' : 'itemId'}&sort=Request Date`;

        expect(document.querySelector('a')).toHaveAttribute('href', href);
      });
    });
  };

  describe('with base config', () => {
    beforeEach(() => renderComponent(baseConfig));

    it('should return "No value"', () => {
      expect(screen.getByText('No value')).toBeInTheDocument();
    });
  });

  positionLink(true);
  positionLink(false);
});
