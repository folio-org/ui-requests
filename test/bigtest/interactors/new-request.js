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

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('[data-test-cancel-new-request-action]');
}

@interactor class NewRequestsInteractor {
  pressEnter = triggerable('keydown', {
    bubbles: true,
    cancelable: true,
    keyCode: 13
  });

  title = text('[class*=paneTitleLabel---]');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  requestTypeMessageIsPresent = isPresent('[data-test-request-type-message]');
  itemBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillItemBarcode = fillable('[name="item.barcode"]');

  userBarcodeIsPresent = isPresent('[name="item.barcode"]');
  fillUserBarcode = fillable('[name="requester.barcode"]');
  chooseServicePoint = selectable('[name="pickupServicePointId"]');

  requestTypes = isPresent('[name="requestType"]');
  requestTypeOptions = getSelectValues('[name="requestType"] option');
  requestTypeText = text('[data-test-request-type-text]');
  requestTypeIsPresent = isPresent('[data-test-request-type-text]');
  clickNewRequest = clickable('#clickable-create-request');
  containsUserBarcode = value('[name="requester.barcode"]');
  containsItemBarcode = value('[name="item.barcode"]');

  itemErrorIsPresent = isPresent('#section-item-info [class*=feedbackError---]');

  requesterErrorIsPresent = isPresent('#section-requester-info [class*=feedbackError---]');

  whenRequestTypeIsPresent() {
    return this.when(() => this.requestTypeIsPresent);
  }
  
  whenRequestTypesArePresent() {
    return this.when(() => this.requestTypes);
  }

  whenItemErrorIsPresent() {
    return this.when(() => this.itemErrorIsPresent);
  }

  whenRequesterErrorIsPresent() {
    return this.when(() => this.requesterErrorIsPresent);
  }
}

export default new NewRequestsInteractor('[data-test-requests-form]');
