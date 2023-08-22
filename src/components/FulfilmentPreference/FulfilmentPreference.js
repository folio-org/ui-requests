import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Row,
  Select,
} from '@folio/stripes/components';

import {
  REQUEST_FORM_FIELD_NAMES,
  requestStatuses,
} from '../../constants';
import {
  getSelectedAddressTypeId,
  isDeliverySelected,
} from '../../utils';

export const validate = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectItem" />);

const {
  AWAITING_DELIVERY,
  AWAITING_PICKUP,
} = requestStatuses;

const FulfilmentPreference = ({
  isEditForm,
  deliverySelected,
  deliveryAddress,
  onChangeAddress,
  deliveryLocations,
  fulfillmentTypeOptions,
  defaultDeliveryAddressTypeId,
  changeDeliveryAddress,
  requestTypes,
  request,
  form,
  values,
}) => {
  const { fulfillmentPreference } = request || {};
  const renderDeliveryAddress = () => {
    return (
      <Field
        name="deliveryAddressTypeId"
        label={<FormattedMessage id="ui-requests.deliveryAddress" />}
        component={Select}
        fullWidth
        onChange={onChangeAddress}
        required
        validate={validate}
      >
        {deliveryLocations.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </Field>
    );
  };
  const renderPickupServicePoint = () => {
    const selectedRequestType = isEditForm ? request.requestType : values.requestType;
    const allowedServicePoints = requestTypes[selectedRequestType] || [];

    return (
      <Field
        data-testid="pickupServicePoint"
        name="pickupServicePointId"
        validateFields={[]}
        validate={validate}
      >
        {
          ({
            input,
            meta
          }) => {
            const error = meta.touched && meta.error;

            return (
              <Select
                {...input}
                label={<FormattedMessage id="ui-requests.pickupServicePoint.name" />}
                error={error}
                fullWidth
                required
              >
                <FormattedMessage id="ui-requests.actions.selectPickupSp">
                  {optionLabel => <option value="">{optionLabel}</option>}
                </FormattedMessage>
                {allowedServicePoints.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
              </Select>
            );
          }
        }
      </Field>
    );
  };
  const onChangeFulfillment = (e) => {
    const selectedFulfillmentPreference = e.target.value;
    const isDelivery = isDeliverySelected(selectedFulfillmentPreference);
    const selectedAddressTypeId = getSelectedAddressTypeId(isDelivery, defaultDeliveryAddressTypeId);

    form.change(REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE, selectedFulfillmentPreference);
    changeDeliveryAddress(isDelivery, selectedAddressTypeId);
  };
  const isDisabledFulfillmentPreference = !!request && (request.status === AWAITING_PICKUP || request.status === AWAITING_DELIVERY);


  return (
    <>
      <Row>
        <Col
          xsOffset={4}
          xs={4}
        >
          <Field
            data-testid="fulfilmentPreference"
            name={REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE}
            label={<FormattedMessage id="ui-requests.requester.fulfillmentPref" />}
            component={Select}
            value={fulfillmentPreference}
            onChange={onChangeFulfillment}
            disabled={isDisabledFulfillmentPreference}
            data-test-fulfillment-preference-filed
            fullWidth
          >
            {fulfillmentTypeOptions.map(({ labelTranslationPath, value }) => (
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
            (!deliverySelected && renderPickupServicePoint()) ||
            (deliveryLocations && renderDeliveryAddress())
          }
        </Col>
      </Row>
      {deliverySelected &&
        <Row>
          <Col
            xs={4}
            xsOffset={8}
          >
            {deliveryAddress}
          </Col>
        </Row>
      }
    </>
  );
};

FulfilmentPreference.propTypes = {
  isEditForm: PropTypes.bool.isRequired,
  defaultDeliveryAddressTypeId: PropTypes.string.isRequired,
  changeDeliveryAddress: PropTypes.func.isRequired,
  requestTypes: PropTypes.object.isRequired,
  request: PropTypes.object.isRequired,
  form: PropTypes.object.isRequired,
  values: PropTypes.object.isRequired,
  onChangeAddress: PropTypes.func.isRequired,
  deliveryAddress: PropTypes.node,
  deliveryLocations: PropTypes.arrayOf(PropTypes.object),
  fulfillmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
  deliverySelected: PropTypes.bool,
};

FulfilmentPreference.defaultProps = {
  deliveryAddress: '',
  deliveryLocations: [],
  fulfillmentTypeOptions: [],
  deliverySelected: false,
};

export default FulfilmentPreference;
