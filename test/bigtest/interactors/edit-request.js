import {
  interactor,
  clickable,
  fillable,
  selectable,
  isPresent,
  is,
} from '@bigtest/interactor';

import CancelRequestDialog from './cancel-request-dialog';

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
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  isLayerPresent = isPresent('[class*=LayerRoot][role=dialog]');
  fulfillmentPreferenceFieldDisabled = is('[data-test-fulfillment-preference-filed]', ':disabled');
}

export default new EditRequestsInteractor();
