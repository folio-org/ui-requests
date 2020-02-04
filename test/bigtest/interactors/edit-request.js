import {
  interactor,
  clickable,
  selectable,
  isPresent,
  is,
} from '@bigtest/interactor';

import HeaderDropdown from './header-dropdown';
import HeaderDropdownMenu from './header-dropdown-menu';

@interactor class EditRequestsInteractor {
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  clickUpdate = clickable('#clickable-save-request');
  isLayerPresent = isPresent('[class*=LayerRoot][role=dialog]');
  fulfillmentPreferenceFieldDisabled = is('[data-test-fulfillment-preference-filed]', ':disabled');
}

export default new EditRequestsInteractor();
