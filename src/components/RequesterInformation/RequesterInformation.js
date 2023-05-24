import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { isNull } from 'lodash';

import {
  Button,
  Col,
  Icon,
  Row,
  TextField,
} from '@folio/stripes-components';
import {
  Pluggable,
  stripesShape,
} from '@folio/stripes/core';

import UserForm from '../../UserForm';
import {
  getSelectedAddressTypeId,
  isDeliverySelected,
  isFormEditing,
  memoizeValidation,
} from '../../utils';
import {
  REQUEST_FORM_FIELD_NAMES,
  RESOURCE_KEYS,
  ENTER_EVENT_KEY,
  BASE_SPINNER_PROPS,
} from '../../constants';

import css from '../../requests.css';

const VISIBLE_COLUMNS = ['active', 'name', 'patronGroup', 'username', 'barcode'];
const COLUMN_MAPPING = {
  name: <FormattedMessage id="ui-requests.requester.name" />,
  patronGroup: <FormattedMessage id="ui-requests.requester.patronGroup.group" />,
  username: <FormattedMessage id="ui-requests.requester.username" />,
  barcode: <FormattedMessage id="ui-requests.barcode" />,
};

class RequesterInformation extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    selectedUser: PropTypes,
    onSetSelectedUser: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    onSetIsPatronBlocksOverridden: PropTypes.func.isRequired,
    onSetBlocked: PropTypes.func.isRequired,
    changeDeliveryAddress: PropTypes.func.isRequired,
    onChangeAddress: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    handleCloseProxy: PropTypes.func.isRequired,
    findUser: PropTypes.func.isRequired,
    triggerUserBarcodeValidation: PropTypes.func.isRequired,
    stripes: stripesShape.isRequired,
    isLoading: PropTypes.bool,
    request: PropTypes.object,
    optionLists: PropTypes.object,
    selectedProxy: PropTypes.object,
    patronGroup: PropTypes.object,
    defaultDeliveryAddressTypeId: PropTypes.string,
    deliverySelected: PropTypes.bool,
    addressDetail: PropTypes.element,
    deliveryLocations: PropTypes.arrayOf(PropTypes.object),
    fulfillmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldValidateBarcode: false,
      isUserClicked: false,
      isUserBlurred: false,
      validatedBarcode: null,
    };
  }

  onChangeFulfillment = (e) => {
    const {
      form,
      defaultDeliveryAddressTypeId,
      changeDeliveryAddress,
    } = this.props;
    const selectedFulfillmentPreference = e.target.value;
    const deliverySelected = isDeliverySelected(selectedFulfillmentPreference);
    const selectedAddressTypeId = getSelectedAddressTypeId(deliverySelected, defaultDeliveryAddressTypeId);

    form.change(REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE, selectedFulfillmentPreference);
    changeDeliveryAddress(deliverySelected, selectedAddressTypeId);
  }

  validate = memoizeValidation(async (barcode) => {
    const {
      selectedUser,
      findUser,
    } = this.props;
    const { shouldValidateBarcode } = this.state;

    if (selectedUser?.id && !barcode) {
      return undefined;
    }

    if (!barcode || (!barcode && !selectedUser?.id)) {
      return <FormattedMessage id="ui-requests.errors.selectUser" />;
    }

    if (barcode && shouldValidateBarcode) {
      this.setState({ shouldValidateBarcode: false });

      const user = await findUser(RESOURCE_KEYS.barcode, barcode, true);

      return !user
        ? <FormattedMessage id="ui-requests.errors.userBarcodeDoesNotExist" />
        : undefined;
    }

    return undefined;
  });

  resetPatronIsBlocked = () => {
    const {
      onSetIsPatronBlocksOverridden,
      onSetBlocked,
    } = this.props;

    onSetIsPatronBlocksOverridden(false);
    onSetBlocked(false);
  }

  handleClick = (eventKey) => {
    const {
      values,
      onSetSelectedUser,
      findUser,
      triggerUserBarcodeValidation,
    } = this.props;
    const barcode = values.requester?.barcode;

    this.resetPatronIsBlocked();

    if (barcode) {
      onSetSelectedUser(null);
      this.setState({
        isUserClicked: true,
      });
      findUser(RESOURCE_KEYS.barcode, barcode);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateBarcode: true,
        }, triggerUserBarcodeValidation);
      }
    }
  }

  onKeyDown = (e) => {
    if (e.key === ENTER_EVENT_KEY && !e.shiftKey) {
      e.preventDefault();
      this.handleClick(e.key);
    }
  }

  handleChange = (event) => {
    const { form } = this.props;
    const {
      isUserClicked,
      isUserBlurred,
      validatedBarcode,
    } = this.state;
    const barcode = event.target.value;

    if (isUserClicked || isUserBlurred) {
      this.setState({
        isUserClicked: false,
        isUserBlurred: false,
      });
    }
    if (!isNull(validatedBarcode)) {
      this.setState({ validatedBarcode: null });
    }

    form.change(REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE, barcode);
  };

  handleBlur = (input) => () => {
    const { triggerUserBarcodeValidation } = this.props;
    const { validatedBarcode } = this.state;

    if (input.value && input.value !== validatedBarcode) {
      this.setState({
        shouldValidateBarcode: true,
        isUserBlurred: true,
        validatedBarcode: input.value,
      }, () => {
        input.onBlur();
        triggerUserBarcodeValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
  }

  onSelectUser = (user) => {
    if (!user) return;

    const {
      onSetSelectedUser,
      findUser,
    } = this.props;

    onSetSelectedUser(null);

    if (user.barcode) {
      findUser(RESOURCE_KEYS.barcode, user.barcode);
    } else {
      findUser(RESOURCE_KEYS.id, user.id);
    }
  }

  render() {
    const {
      request,
      values,
      selectedUser,
      submitting,
      stripes,
      patronGroup,
      deliverySelected,
      addressDetail,
      deliveryLocations,
      fulfillmentTypeOptions,
      onChangeAddress,
      selectedProxy,
      onSelectProxy,
      handleCloseProxy,
      isLoading,
      optionLists,
    } = this.props;
    const {
      isUserClicked,
      isUserBlurred,
    } = this.state;
    const isEditForm = isFormEditing(request);
    const { fulfillmentPreference } = request || {};
    const isAddressSelected = values?.deliveryAddressTypeId !== undefined || values?.pickupServicePointId !== undefined;

    return (
      <Row>
        <Col xs={12}>
          {!isEditForm &&
          <Row>
            <Col xs={9}>
              <FormattedMessage id="ui-requests.requester.scanOrEnterBarcode">
                {placeholder => {
                  const key = values.keyOfUserBarcodeField ?? 0;

                  return (
                    <Field
                      key={key}
                      name={REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE}
                      validate={this.validate(REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE, key)}
                      validateFields={[]}
                    >
                      {({ input, meta }) => {
                        const selectUserError = meta.touched && !selectedUser?.id && meta.error;
                        const userDoesntExistError = (isUserClicked || isUserBlurred) && meta.error;
                        const error = selectUserError || userDoesntExistError || null;

                        return (
                          <TextField
                            {...input}
                            required
                            placeholder={placeholder}
                            label={<FormattedMessage id="ui-requests.requester.barcode" />}
                            error={error}
                            onChange={this.handleChange}
                            onBlur={this.handleBlur(input)}
                            onKeyDown={this.onKeyDown}
                          />
                        );
                      }}
                    </Field>
                  );
                }}
              </FormattedMessage>
              <Pluggable
                {...this.props}
                aria-haspopup="true"
                type="find-user"
                searchLabel={<FormattedMessage id="ui-requests.requester.findUserPluginLabel" />}
                searchButtonStyle="link"
                dataKey="users"
                selectUser={this.onSelectUser}
                visibleColumns={VISIBLE_COLUMNS}
                columnMapping={COLUMN_MAPPING}
                disableRecordCreation
                marginTop0
              />
            </Col>
            <Col xs={3}>
              <Button
                id="clickable-select-requester"
                buttonStyle="primary noRadius"
                buttonClass={css.enterButton}
                fullWidth
                onClick={this.handleClick}
                disabled={submitting}
              >
                <FormattedMessage id="ui-requests.enter" />
              </Button>
            </Col>
          </Row>}
          {(selectedUser?.id || request?.requester) && isAddressSelected &&
            <UserForm
              user={request ? request.requester : selectedUser}
              stripes={stripes}
              request={request}
              patronGroup={patronGroup?.group}
              deliverySelected={deliverySelected}
              fulfillmentPreference={fulfillmentPreference}
              deliveryAddress={addressDetail}
              deliveryLocations={deliveryLocations}
              fulfillmentTypeOptions={fulfillmentTypeOptions}
              onChangeAddress={onChangeAddress}
              onChangeFulfillment={this.onChangeFulfillment}
              proxy={selectedProxy}
              servicePoints={optionLists.servicePoints}
              onSelectProxy={onSelectProxy}
              onCloseProxy={handleCloseProxy}
            />
          }
          {
            isLoading && <Icon {...BASE_SPINNER_PROPS} />
          }
        </Col>
      </Row>
    );
  }
}

export default RequesterInformation;
