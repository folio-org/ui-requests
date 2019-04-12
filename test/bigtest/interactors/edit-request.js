import {
  interactor,
  clickable,
  fillable,
  selectable,
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('[data-test-cancel-editing]');
  clickDelete = clickable('[data-test-delete-request]');
}

@interactor class EditRequestsInteractor {
  fillRequestExpirationDateField = fillable('#requestExpirationDate');
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  clickUpdate = clickable('#clickable-update-request');
}

export default new EditRequestsInteractor('[data-test-requests-form]');
