import {
  interactor,
  clickable,
  isPresent,
  text,
  fillable,
  triggerable,
  computed,
} from '@bigtest/interactor';

function getSelectValues(selector) {
  return computed(function () {
    return Array.from(document.querySelectorAll(selector))
      .map(option => option.value);
  });
}

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
  requestTypes = isPresent('[name="requestType"]');
  requestTypeOptions = getSelectValues('[name="requestType"] option');
  requestTypeText = text('[data-test-request-type-text]');
  requestTypeIsPresent = isPresent('[data-test-request-type-text]');

  whenRequestTypeIsPresent() {
    return this.when(() => this.requestTypeIsPresent);
  }

  whenRequestTypesArePresent() {
    return this.when(() => this.requestTypes);
  }
}

export default new NewRequestsInteractor('[data-test-requests-form]');
