import {
  interactor,
  isPresent,
  clickable,
  attribute,
} from '@bigtest/interactor';

import CancelRequestDialog from './cancel-request-dialog';
import MoveRequestDialog from './move-request-dialog';
import ChooseRequestTypeDialog from './choose-request-type-dialog';

import { contains } from './helpers';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('#clickable-cancel-request');
  clickEdit = clickable('#clickable-edit-request');
  clickDuplicate = clickable('#duplicate-request');
  clickMove = clickable('#move-request');
}

@interactor class ItemAccordion {
  isExpanded = attribute('#accordion-toggle-button-item-info', 'aria-expanded') === 'true';
}

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
