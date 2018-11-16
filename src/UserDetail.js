import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';
import { getFullName, userHighlightBox } from './utils';

class UserDetail extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.string,
    patronGroup: PropTypes.string,
    pickupServicePoint: PropTypes.string,
    proxy: PropTypes.object,
    request: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedDelivery: PropTypes.bool,
  };

  static defaultProps = {
    deliveryAddress: '',
    patronGroup: '',
    pickupServicePoint: '',
    proxy: {},
    selectedDelivery: false,
  };

  render() {
    const {
      user,
      proxy,
      request,
      patronGroup,
      deliveryAddress,
      pickupServicePoint,
      selectedDelivery,
    } = this.props;

    const id = user.id;
    const name = getFullName(user);
    const barcode = user.barcode;

    let proxyName;
    let proxyBarcode;
    let proxyId;
    if (proxy) {
      proxyName = getFullName(proxy);
      proxyBarcode = _.get(proxy, ['barcode'], '-');
      proxyId = proxy.id || request.proxyUserId;
    }

    const proxySection = proxyId
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.proxy" />, proxyName, proxyId, proxyBarcode)
      : null;

    return (
      <div>
        {userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, name, id, barcode)}
        <Row>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-requests.requester.patronGroup" />}
              value={patronGroup || '-'}
            />
          </Col>
          <Col xs={4}>
            <KeyValue
              label={<FormattedMessage id="ui-requests.requester.fulfilmentPref" />}
              value={_.get(request, ['fulfilmentPreference'], '-')}
            />
          </Col>
          <Col xs={4}>
            { selectedDelivery ?
              <KeyValue
                label={<FormattedMessage id="ui-requests.requester.deliveryAddress" />}
                value={deliveryAddress || '-'}
              /> :
              <KeyValue
                label={<FormattedMessage id="ui-requests.requester.pickupServicePoint" />}
                value={pickupServicePoint || '-'}
              />
            }
          </Col>
        </Row>
        {proxySection}
      </div>
    );
  }
}

export default UserDetail;
