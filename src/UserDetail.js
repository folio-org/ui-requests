import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Field } from 'redux-form';
import { Col, KeyValue, Row, Select } from '@folio/stripes/components';
import { ProxyManager } from '@folio/stripes/smart-components';
import { getFullName, userHighlightBox } from './utils';

class UserDetail extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.string,
    deliveryLocations: PropTypes.arrayOf(PropTypes.object),
    fulfilmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
    newUser: PropTypes.bool,
    onChangeAddress: PropTypes.func,
    onChangeFulfilment: PropTypes.func,
    onCloseProxy: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    patronGroup: PropTypes.string,
    pickupLocation: PropTypes.string,
    proxy: PropTypes.object,
    requestMeta: PropTypes.object.isRequired,
    stripes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedDelivery: PropTypes.bool,
    intl: intlShape
  };

  static defaultProps = {
    deliveryAddress: '',
    deliveryLocations: [],
    fulfilmentTypeOptions: [],
    newUser: false,
    onChangeAddress: () => {},
    onChangeFulfilment: () => {},
    patronGroup: '',
    pickupLocation: '',
    proxy: {},
    selectedDelivery: false,
  };

  constructor(props) {
    super(props);

    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  render() {
    const {
      intl: { formatMessage },
      user,
      proxy,
      requestMeta,
      newUser,
      patronGroup,
      deliveryAddress,
      deliveryLocations,
      pickupLocation,
      selectedDelivery,
      fulfilmentTypeOptions,
      onChangeAddress,
      onChangeFulfilment,
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
            { newUser &&
              <Field
                name="fulfilmentPreference"
                label={formatMessage({ id: 'ui-requests.requester.fulfilmentPref' })}
                component={Select}
                fullWidth
                dataOptions={fulfilmentTypeOptions}
                onChange={onChangeFulfilment}
              />
            }
            { !newUser &&
              <KeyValue label={formatMessage({ id: 'ui-requests.requester.fulfilmentPref' })} value={_.get(requestMeta, ['fulfilmentPreference'], '-')} />
            }
          </Col>
          <Col xs={4}>
            { newUser && selectedDelivery && deliveryLocations &&
              <Field
                name="deliveryAddressTypeId"
                label={formatMessage({ id: 'ui-requests.requester.deliveryAddress' })}
                component={Select}
                fullWidth
                dataOptions={[{ label: formatMessage({ id: 'ui-requests.actions.selectAddressType' }), value: '' }, ...deliveryLocations]}
                onChange={onChangeAddress}
              />
            }
            { newUser && !selectedDelivery &&
              <Field
                name="pickupLocationId"
                label={formatMessage({ id: 'ui-requests.requester.pickupLocation' })}
                component={Select}
                fullWidth
                dataOptions={[{ label: formatMessage({ id: 'ui-requests.actions.selectPickupLoc' }), value: '' }]}
                onChange={onChangeAddress}
              />
            }
            { !newUser && selectedDelivery &&
              <KeyValue label={formatMessage({ id: 'ui-requests.requester.deliveryAddress' })} value={deliveryAddress || '-'} />
            }
            { !newUser && !selectedDelivery &&
              <KeyValue label={formatMessage({ id: 'ui-requests.requester.pickupLocation' })} value={pickupLocation || '-'} />
            }
          </Col>
        </Row>
        { newUser && selectedDelivery &&
          <Row>
            <Col xs={4} xsOffset={8}>
              {deliveryAddress}
            </Col>
          </Row>
        }
        {proxySection}
        <this.connectedProxyManager
          patron={user}
          proxy={proxy}
          onSelectPatron={this.props.onSelectProxy}
          onClose={this.props.onCloseProxy}
        />
      </div>
    );
  }
}

export default injectIntl(UserDetail);
