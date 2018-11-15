import { get } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';
import { Field } from 'redux-form';
import { Col, KeyValue, Row, Select } from '@folio/stripes/components';
import { ProxyManager } from '@folio/stripes/smart-components';
import { getFullName, userHighlightBox } from './utils';

class UserForm extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.string,
    deliveryLocations: PropTypes.arrayOf(PropTypes.object),
    fulfilmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
    onChangeAddress: PropTypes.func,
    onChangeFulfilment: PropTypes.func,
    onCloseProxy: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    patronGroup: PropTypes.string,
    proxy: PropTypes.object,
    requestMeta: PropTypes.object.isRequired,
    stripes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    selectedDelivery: PropTypes.bool,
    servicePoints: PropTypes.arrayOf(PropTypes.object)
  };

  static defaultProps = {
    deliveryAddress: '',
    deliveryLocations: [],
    fulfilmentTypeOptions: [],
    onChangeAddress: () => {},
    onChangeFulfilment: () => {},
    patronGroup: '',
    proxy: {},
    selectedDelivery: false,
  };

  constructor(props) {
    super(props);
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  renderDeliveryAddressSelect() {
    const {
      onChangeAddress,
      deliveryLocations,
    } = this.props;

    return (
      <Field
        name="deliveryAddressTypeId"
        label={<FormattedMessage id="ui-requests.requester.deliveryAddress" />}
        component={Select}
        fullWidth
        onChange={onChangeAddress}
      >
        <FormattedMessage id="ui-requests.actions.selectAddressType">
          {(optionLabel) => <option value="">{optionLabel}</option>}
        </FormattedMessage>
        {deliveryLocations.map(({ value, label }) => <option value={value}>{label}</option>)}
      </Field>
    );
  }

  renderPickupServicePointSelect() {
    const {
      servicePoints,
    } = this.props;

    return (
      <Field
        name="pickupServicePointId"
        label={<FormattedMessage id="ui-requests.requester.pickupServicePoint" />}
        component={Select}
        fullWidth
      >
        <FormattedMessage id="ui-requests.actions.selectPickupSp">
          {optionLabel => <option value="">{optionLabel}</option>}
        </FormattedMessage>
        {servicePoints.map(({ id, name }) => <option value={id}>{name}</option>)}
      </Field>
    );
  }

  render() {
    const {
      user,
      proxy,
      requestMeta,
      patronGroup,
      deliveryAddress,
      deliveryLocations,
      selectedDelivery,
      fulfilmentTypeOptions,
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
      proxyBarcode = get(proxy, ['barcode'], '-');
      proxyId = proxy.id || requestMeta.proxyUserId;
    }

    const proxySection = proxyId
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.proxy" />, proxyName, proxyId, proxyBarcode)
      : null;

    return (
      <div>
        {userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, name, id, barcode)}
        <Row>
          <Col xs={4}>
            <KeyValue label={<FormattedMessage id="ui-requests.requester.patronGroup" />} value={patronGroup || '-'} />
          </Col>
          <Col xs={4}>
            <Field
              name="fulfilmentPreference"
              label={<FormattedMessage id="ui-requests.requester.fulfilmentPref" />}
              component={Select}
              fullWidth
              dataOptions={fulfilmentTypeOptions}
              onChange={onChangeFulfilment}
            />
          </Col>
          <Col xs={4}>
            {
              (!selectedDelivery && this.renderPickupServicePointSelect()) ||
              (deliveryLocations && this.renderDeliveryAddressSelect())
            }
          </Col>
        </Row>

        { selectedDelivery &&
          <Row>
            <Col xs={4} xsOffset={8}>
              {deliveryAddress}
            </Col>
          </Row>
        }

        {proxySection}

        {
          <this.connectedProxyManager
            patron={user}
            proxy={proxy}
            onSelectPatron={this.props.onSelectProxy}
            onClose={this.props.onCloseProxy}
          />
        }
      </div>
    );
  }
}

export default UserForm;
