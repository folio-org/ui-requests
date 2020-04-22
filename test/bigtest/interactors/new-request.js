import {
  interactor,
  clickable,
  isPresent,
  text,
  value,
  fillable,
  triggerable,
  selectable,
} from '@bigtest/interactor';

import { getSelectValues } from './helpers';
import HeaderDropdown from './header-dropdown';
import InputField from './input-field';


@interactor class NewRequest {
  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  clickItemEnterBtn = clickable('#clickable-select-item');
  clickUserEnterBtn = clickable('#clickable-select-requester');

  title = text('[class*=paneTitleLabel---]');
  headerDropdown = new HeaderDropdown();
  requestTypeMessageIsPresent = isPresent('[data-test-request-type-message]');
  itemBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillItemBarcode = fillable('[name="item.barcode"]');

  itemField = new InputField('[name="item.barcode"]');

  userBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillUserBarcode = fillable('[name="requester.barcode"]');
  userField = new InputField('[name="requester.barcode"]');

  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  servicePointPresent = isPresent('[name="pickupServicePointId"]');
  requestTypes = isPresent('[name="requestType"]');
  requestTypeOptions = getSelectValues('[name="requestType"] option');
  requestTypeText = text('[data-test-request-type-text]');
  requestTypeIsPresent = isPresent('[data-test-request-type-text]');
  clickNewRequest = clickable('#clickable-save-request');
  clickCancel = clickable('#clickable-cancel-request-changes');
  containsUserBarcode = value('[name="requester.barcode"]');
  containsItemBarcode = value('[name="item.barcode"]');

  clickAddUser = clickable('[data-test-plugin-find-user-button]');

  chooseFulfillmentPreference = selectable('[name="fulfilmentPreference"]');
  chooseDeliveryAddress = selectable('[name="deliveryAddressTypeId"]');
  fulfillmentPreferenceValue = value('[name="fulfilmentPreference"]');
  deliveryAddressTypeIdValue = value('[name="deliveryAddressTypeId"]');
  pickupServicePointIdValue = value('[name="pickupServicePointId"]');

  itemErrorIsPresent = isPresent('#section-item-info [class*=feedbackError---]');
  requesterErrorIsPresent = isPresent('#section-requester-info [class*=feedbackError---]');

  whenReady() {
    return this.when(() => this.itemBarcodeIsPresent);
  }

  whenRequestTypeIsPresent() {
    return this.when(() => this.requestTypeIsPresent);
  }

  whenRequestTypesArePresent() {
    return this.when(() => this.requestTypes);
  }

  whenServicePointIsPresent() {
    return this.when(() => this.servicePointPresent, 5000);
  }
}

export default NewRequest;
