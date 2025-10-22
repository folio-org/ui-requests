import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
  NoValue,
} from '@folio/stripes/components';

import {
  getPatronGroup,
  isProxyFunctionalityAvailable,
} from './utils';

import {
  UserHighlightBox
} from './components';

class UserDetail extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.node,
    patronGroups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      })
    ),
    pickupServicePoint: PropTypes.string,
    proxy: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }),
    request: PropTypes.shape({
      requesterId: PropTypes.string,
      proxyUserId: PropTypes.string,
      fulfillmentPreference: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }).isRequired,
    isEcsTlrSettingEnabled: PropTypes.bool,
    selectedDelivery: PropTypes.bool,
  };

  static defaultProps = {
    pickupServicePoint: '',
    proxy: {},
    selectedDelivery: false,
  };

  render() {
    const {
      user,
      proxy,
      request,
      patronGroups,
      deliveryAddress,
      pickupServicePoint,
      selectedDelivery,
      isEcsTlrSettingEnabled,
    } = this.props;

    const patronGroup = getPatronGroup(user, patronGroups) || {};
    return (
      <div>
        <UserHighlightBox
          title={<FormattedMessage id="ui-requests.requester.requester" />}
          user={user}
        />
        <Row>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-requests.requester.patronGroup.group" />}
              value={patronGroup.group || <NoValue />}
            />
          </Col>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-requests.requester.fulfillmentPref" />}
              value={request?.fulfillmentPreference || <NoValue />}
            />
          </Col>
          <Col xs={4}>
            { selectedDelivery ?
              <KeyValue
                label={<FormattedMessage id="ui-requests.deliveryAddress" />}
                value={deliveryAddress || <NoValue />}
              /> :
              <KeyValue
                label={<FormattedMessage id="ui-requests.pickupServicePoint.name" />}
                value={pickupServicePoint || <NoValue />}
              /> }
          </Col>
        </Row>
        {isProxyFunctionalityAvailable(isEcsTlrSettingEnabled) && proxy?.id &&
          <UserHighlightBox
            title={<FormattedMessage id="ui-requests.requester.proxy" />}
            user={proxy}
          />
        }
      </div>
    );
  }
}

export default UserDetail;
