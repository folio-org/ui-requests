import {
  interactor,
  clickable,
  fillable,
  selectable,
  isPresent,
  is,
} from '@bigtest/interactor';

import CancelRequestDialog from './cancel-request-dialog';
import HeaderDropdownMenu from './header-dropdown-menu';
import HeaderDropdown from './header-dropdown';

@interactor class EditRequests {
  fillRequestExpirationDateField = fillable('#requestExpirationDate');
  headerDropdown = new HeaderDropdown();
  headerDropdownMenu = new HeaderDropdownMenu();
  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  clickUpdate = clickable('#clickable-save-request');
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  isLayerPresent = isPresent('[class*=LayerRoot][role=dialog]');
  fulfillmentPreferenceFieldDisabled = is('[data-test-fulfillment-preference-filed]', ':disabled');
}

export default EditRequests;
