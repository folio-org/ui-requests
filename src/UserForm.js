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
import { requestStatuses } from './constants';

const {
  AWAITING_DELIVERY,
  AWAITING_PICKUP,
} = requestStatuses;

class UserForm extends React.Component {
  static propTypes = {
    deliveryAddress: PropTypes.node,
    deliveryLocations: PropTypes.arrayOf(PropTypes.object),
    fulfilmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
    fulfilmentPreference: PropTypes.string,
    onChangeAddress: PropTypes.func,
    onChangeFulfilment: PropTypes.func,
    onCloseProxy: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    patronGroup: PropTypes.string,
    proxy: PropTypes.object,
    stripes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    deliverySelected: PropTypes.bool,
    servicePoints: PropTypes.arrayOf(PropTypes.object),
    request: PropTypes.object,
  };

  static defaultProps = {
    deliveryAddress: '',
    deliveryLocations: [],
    fulfilmentTypeOptions: [],
    onChangeAddress: () => {},
    onChangeFulfilment: () => {},
    patronGroup: '',
    proxy: {},
    deliverySelected: false,
  };

  constructor(props) {
    super(props);
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  requireServicePoint = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectItem" />);
  requireDeliveryAddress = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectItem" />);

  renderDeliveryAddressSelect() {
    const {
      onChangeAddress,
      deliveryLocations,
    } = this.props;

    return (
      <Field
        name="deliveryAddressTypeId"
        label={<FormattedMessage id="ui-requests.deliveryAddress" />}
        component={Select}
        fullWidth
        onChange={onChangeAddress}
        required
        validate={this.requireDeliveryAddress}
      >
        {deliveryLocations.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
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
        label={<FormattedMessage id="ui-requests.pickupServicePoint.name" />}
        component={Select}
        fullWidth
        required
        validate={this.requireServicePoint}
      >
        <FormattedMessage id="ui-requests.actions.selectPickupSp">
          {optionLabel => <option value="">{optionLabel}</option>}
        </FormattedMessage>
        {servicePoints.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
      </Field>
    );
  }

  render() {
    const {
      user,
      proxy,
      patronGroup,
      deliveryAddress,
      deliveryLocations,
      deliverySelected,
      fulfilmentPreference,
      fulfilmentTypeOptions,
      onChangeFulfilment,
      request,
    } = this.props;

    const id = user?.id ?? request.requesterId;
    const name = getFullName(user);
    const barcode = user.barcode;
    const isEditable = !!request;
    const shouldDisableFulfillmentPreferenceField = isEditable && (request.status === AWAITING_PICKUP || request.status === AWAITING_DELIVERY);

    let proxyName;
    let proxyBarcode;
    let proxyId;
    if (proxy) {
      proxyName = getFullName(proxy);
      proxyBarcode = get(proxy, ['barcode'], '-');
      proxyId = proxy.id;
    }

    const proxySection = proxyId && proxyId !== id
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.proxy" />, name, id, barcode)
      : null;

    const userSection = proxyId
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, proxyName, proxyId, proxyBarcode)
      : userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, name, id, barcode);

    return (
      <div>
        {userSection}
        <Row>
          <Col xs={4}>
            <KeyValue label={<FormattedMessage id="ui-requests.requester.patronGroup.group" />} value={patronGroup || '-'} />
          </Col>
          <Col xs={4}>
            <Field
              name="fulfilmentPreference"
              label={<FormattedMessage id="ui-requests.requester.fulfilmentPref" />}
              component={Select}
              fullWidth
              value={fulfilmentPreference}
              onChange={onChangeFulfilment}
              disabled={shouldDisableFulfillmentPreferenceField}
              data-test-fulfillment-preference-filed
            >
              {fulfilmentTypeOptions.map(({ labelTranslationPath, value }) => (
                <FormattedMessage key={value} id={labelTranslationPath}>
                  {translatedLabel => (
                    <option value={value}>
                      {translatedLabel}
                    </option>
                  )}
                </FormattedMessage>
              ))}
            </Field>
          </Col>
          <Col xs={4}>
            {
              (!deliverySelected && this.renderPickupServicePointSelect()) ||
              (deliveryLocations && this.renderDeliveryAddressSelect())
            }
          </Col>
        </Row>

        { deliverySelected &&
          <Row>
            <Col xs={4} xsOffset={8}>
              {deliveryAddress}
            </Col>
          </Row> }

        {proxySection}

        { !isEditable &&
          <this.connectedProxyManager
            patron={user}
            proxy={proxy}
            onSelectPatron={this.props.onSelectProxy}
            onClose={this.props.onCloseProxy}
          /> }
      </div>
    );
  }
}

export default UserForm;
