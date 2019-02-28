import {
  interactor,
  clickable,
  fillable,
  isPresent
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
}

export default EditRequestsInteractor;
