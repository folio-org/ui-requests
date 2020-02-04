import {
  interactor,
  isPresent,
  clickable,
} from '@bigtest/interactor';

import { contains } from './helpers';
import CancelRequestDialog from './cancel-request-dialog';
import MoveRequestDialog from './move-request-dialog';
import ChooseRequestTypeDialog from './choose-request-type-dialog';
import HeaderDropdownMenu from './header-dropdown-menu';
import HeaderDropdown from './header-dropdown';
import ItemAccordion from './item-accordion';

@interactor class ViewRequestInteractor {
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  itemAccordion = new ItemAccordion('#item-info');
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  moveRequestDialog = new MoveRequestDialog('[data-test-move-request-modal]');
  chooseRequestTypeDialog = new ChooseRequestTypeDialog('[data-test-choose-request-type-modal]');
  requestSectionPresent = isPresent('#request-info');
  requesterSectionPresent = isPresent('#requester-info');
  requesterInfoContains = contains('#requester-info');
  requestInfoContains = contains('#request-info');

  itemAccordionClick = clickable('#accordion-toggle-button-item-info');
}

export default new ViewRequestInteractor();
