import {
  interactor,
  clickable,
  isPresent,
  text,
  value,
  fillable,
  triggerable,
  selectable,
  scoped,
} from '@bigtest/interactor';

import TextAreaInteractor from '@folio/stripes-components/lib/TextArea/tests/interactor'; // eslint-disable-line

import { getSelectValues } from './helpers';
import HeaderDropdown from './header-dropdown';
import InputField from './input-field';
import KeyValue from './KeyValue';
import BlockModalInteractor from './patron-block-modal';

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
  itemBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillItemBarcode = fillable('[name="item.barcode"]');

  itemField = new InputField('[name="item.barcode"]');

  userBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillUserBarcode = fillable('[name="requester.barcode"]');
  userField = new InputField('[name="requester.barcode"]');

  chooseRequestType = selectable('[name="requestType"]');
  requestTypePresent = isPresent('[name="requestType"]');
  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  servicePointPresent = isPresent('[name="pickupServicePointId"]');
  requestTypes = isPresent('[name="requestType"]');
  requestTypeOptions = getSelectValues('[name="requestType"] option');
  clickNewRequest = clickable('#clickable-save-request');
  clickCancel = clickable('#clickable-cancel-request-changes');
  containsUserBarcode = value('[name="requester.barcode"]');
  containsItemBarcode = value('[name="item.barcode"]');
  requestSectionPresent = isPresent('#new-request-info');
  requesterSectionPresent = isPresent('#new-requester-info');

  clickAddUser = clickable('[data-test-plugin-find-user-button]');

  chooseFulfillmentPreference = selectable('[name="fulfillmentPreference"]');
  chooseDeliveryAddress = selectable('[name="deliveryAddressTypeId"]');
  fulfillmentPreferenceValue = value('[name="fulfillmentPreference"]');
  deliveryAddressTypeIdValue = value('[name="deliveryAddressTypeId"]');
  pickupServicePointIdValue = value('[name="pickupServicePointId"]');

  itemErrorIsPresent = isPresent('#section-item-info [class*=feedbackError---]');
  requesterErrorIsPresent = isPresent('#section-requester-info [class*=feedbackError---]');

  requestType = scoped('[data-test-request-type] div', KeyValue);
  patronComments = new TextAreaInteractor('[class*=textArea---]');
  patronBlockModal = new BlockModalInteractor('[data-test-patron-block-modal]');

  whenReady() {
    return this.when(() => this.itemBarcodeIsPresent);
  }

  whenRequestTypesArePresent() {
    return this.when(() => this.requestTypes);
  }

  whenServicePointIsPresent() {
    return this.when(() => this.servicePointPresent, 5000);
  }

  whenRequestTypeIsPresent() {
    return this.when(() => this.servicePointPresent, 5000);
  }
}

export default NewRequest;
