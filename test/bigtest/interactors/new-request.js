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
import InputFieldInteractor from './input-field';

@interactor class NewRequestsInteractor {
  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13,
    key: 'Enter',
  });

  clickItemEnterBtn = clickable('#clickable-select-item');
  clickUserEnterBtn = clickable('#clickable-select-requester');

  title = text('[class*=paneTitleLabel---]');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  requestTypeMessageIsPresent = isPresent('[data-test-request-type-message]');
  fillItemBarcode = fillable('[name="item.barcode"]');

  itemField = new InputFieldInteractor('[name="item.barcode"]');

  fillUserBarcode = fillable('[name="requester.barcode"]');
  userField = new InputFieldInteractor('[name="requester.barcode"]');

  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  requestTypes = isPresent('[name="requestType"]');
  requestTypeOptions = getSelectValues('[name="requestType"] option');
  requestTypeText = text('[data-test-request-type-text]');
  requestTypeIsPresent = isPresent('[data-test-request-type-text]');
  clickNewRequest = clickable('#clickable-save-request');
  clickCancel = clickable('#clickable-cancel-request');
  containsUserBarcode = value('[name="requester.barcode"]');
  containsItemBarcode = value('[name="item.barcode"]');

  chooseFulfillmentPreference = selectable('[name="fulfilmentPreference"]');
  chooseDeliveryAddress = selectable('[name="deliveryAddressTypeId"]');
  fulfillmentPreferenceValue = value('[name="fulfilmentPreference"]');
  deliveryAddressTypeIdValue = value('[name="deliveryAddressTypeId"]');

  itemErrorIsPresent = isPresent('#section-item-info [class*=feedbackError---]');
  requesterErrorIsPresent = isPresent('#section-requester-info [class*=feedbackError---]');

  whenRequestTypeIsPresent() {
    return this.when(() => this.requestTypeIsPresent);
  }

  whenRequestTypesArePresent() {
    return this.when(() => this.requestTypes);
  }
}

export default new NewRequestsInteractor('[data-test-requests-form]');
