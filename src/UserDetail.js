import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';
import { getFullName, userHighlightBox } from './utils';

class UserDetail extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.string,
    patronGroup: PropTypes.string,
    pickupServicePoint: PropTypes.string,
    proxy: PropTypes.object,
    requestMeta: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedDelivery: PropTypes.bool,
    intl: intlShape
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
      intl: { formatMessage },
      user,
      proxy,
      requestMeta,
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
      proxyId = proxy.id || requestMeta.proxyUserId;
    }

    const proxySection = proxyId ? userHighlightBox(formatMessage({ id: 'ui-requests.requester.proxy' }), proxyName, proxyId, proxyBarcode) : '';

    return (
      <div>
        {userHighlightBox(formatMessage({ id: 'ui-requests.requester.requester' }), name, id, barcode)}
        <Row>
          <Col xs={4}>
            <KeyValue label={formatMessage({ id: 'ui-requests.requester.patronGroup' })} value={patronGroup || '-'} />
          </Col>
          <Col xs={4}>
            <KeyValue label={formatMessage({ id: 'ui-requests.requester.fulfilmentPref' })} value={_.get(requestMeta, ['fulfilmentPreference'], '-')} />
          </Col>
          <Col xs={4}>
            { selectedDelivery
              ? <KeyValue label={formatMessage({ id: 'ui-requests.requester.deliveryAddress' })} value={deliveryAddress || '-'} />
              : <KeyValue label={formatMessage({ id: 'ui-requests.requester.pickupServicePoint' })} value={pickupServicePoint || '-'} />
            }
          </Col>
        </Row>
        {proxySection}
      </div>
    );
  }
}

export default injectIntl(UserDetail);
