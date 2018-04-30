import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import ProxyManager from '@folio/stripes-smart-components/lib/ProxyManager';
import Select from '@folio/stripes-components/lib/Select';

import { getFullName, userHighlightBox } from './utils';

class UserDetail extends React.Component {

  static propTypes = {
    deliveryAddress: PropTypes.string,
    deliveryLocations: PropTypes.arrayOf(PropTypes.object),
    fulfilmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
    newUser: PropTypes.bool,
    onChangeAddress: PropTypes.func,
    onChangeFulfilment: PropTypes.func,
    patronGroup: PropTypes.string,
    pickupLocation: PropTypes.string,
    requestMeta: PropTypes.object.isRequired,
    stripes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedDelivery: PropTypes.bool,
  };

  static  defaultProps = {
    deliveryAddress: '',
    deliveryLocations: [],
    fulfilmentTypeOptions: [],
    newUser: false,
    onChangeAddress: () => {},
    onChangeFulfilment: () => {},
    patronGroup: '',
    pickupLocation: '',
    selectedDelivery: false,
  };

  constructor(props) {
    super(props);

    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  render() {

    const {
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
      onChangeFulfilment
    } = this.props;

    const id = user.id;
    const name = getFullName(user);
    const barcode = user.barcode;
  //  const proxy = _.get(requestMeta, ['proxy']);
    let proxyName;
    let proxyBarcode;
    let proxyId;
    if (proxy) {
      proxyName = getFullName(proxy);
      proxyBarcode = _.get(proxy, ['barcode'], '-');
      proxyId = proxy.id || requestMeta.proxyUserId;
    }
    const proxySection = (proxy && proxy.id !== user.id) ? userHighlightBox('Requester\'s proxy', proxyName, proxyId, proxyBarcode) : '';

    return (
      <div>
        {userHighlightBox('Requester', name, id, barcode)}
        <Row>
          <Col xs={4}>
            <KeyValue label="Patron group" value={patronGroup || '-'} />
          </Col>
          <Col xs={4}>
            { newUser &&
              <Field
                name="fulfilmentPreference"
                label="Fulfilment preference"
                component={Select}
                fullWidth
                dataOptions={fulfilmentTypeOptions}
                onChange={onChangeFulfilment}
              />
            }
            { !newUser &&
              <KeyValue label="Fulfilment preference" value={_.get(requestMeta, ['fulfilmentPreference'], '-')} />
            }
          </Col>
          <Col xs={4}>
            { newUser && selectedDelivery && deliveryLocations &&
              <Field
                name="deliveryAddressTypeId"
                label="Delivery address"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select address type', value: '' }, ...deliveryLocations]}
                onChange={onChangeAddress}
              />
            }
            { newUser && !selectedDelivery &&
              <Field
                name="pickupLocationId"
                label="Pickup location"
                component={Select}
                fullWidth
                dataOptions={[{ label: 'Select pickup location', value: '' }]}
                onChange={onChangeAddress}
              />
            }
            { !newUser && selectedDelivery &&
              <KeyValue label="Delivery address" value={deliveryAddress || '-'} />
            }
            { !newUser && !selectedDelivery &&
              <KeyValue label="Pickup location" value={pickupLocation || '-'} />
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

export default UserDetail;
