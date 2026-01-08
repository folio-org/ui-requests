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
  computeUserDisplayForRequest,
  userHighlightBox2,
  getPatronGroup,
} from './utils';

class UserDetail extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.node,
    patronGroups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      })
    ),
    pickupServicePoint: PropTypes.string,
    request: PropTypes.shape({
      requesterId: PropTypes.string,
      requester: PropTypes.shape({
        id: PropTypes.string,
        barcode: PropTypes.string,
      }),
      proxyUserId: PropTypes.string,
      proxy: PropTypes.shape({
        id: PropTypes.string,
        barcode: PropTypes.string,
      }),
      fulfillmentPreference: PropTypes.string,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
    }).isRequired,
    isEcsTlrSettingEnabled: PropTypes.bool,
    selectedDelivery: PropTypes.bool,
  };

  static defaultProps = {
    pickupServicePoint: '',
    selectedDelivery: false,
  };

  render() {
    const {
      user,
      request,
      patronGroups,
      deliveryAddress,
      pickupServicePoint,
      selectedDelivery,
      isEcsTlrSettingEnabled,
    } = this.props;
    const patronGroup = getPatronGroup(user, patronGroups) || {};

    const userDisplay = computeUserDisplayForRequest(request, isEcsTlrSettingEnabled);
    const proxySection = userDisplay.proxy
      ? userHighlightBox2(
        <FormattedMessage id="ui-requests.requester.proxy" />,
        userDisplay.proxy.proxyNameLink,
        userDisplay.proxy.proxyBarcodeLink
      )
      : null;

    return (
      <div>
        {userHighlightBox2(
          <FormattedMessage id="ui-requests.requester.requester" />,
          userDisplay.requesterNameLink,
          userDisplay.requesterBarcodeLink,
        )}
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
        {proxySection}
      </div>
    );
  }
}

export default UserDetail;
