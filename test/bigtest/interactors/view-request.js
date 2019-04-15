import {
  interactor,
  isPresent,
  clickable,
  selectable,
} from '@bigtest/interactor';

import { contains } from './helpers';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('#clickable-cancel-request');
}

@interactor class CancelRequestDialog {
  clickConfirm = clickable('[data-test-confirm-cancel-request]');
  chooseReason = selectable('[data-test-select-cancelation-reason]');
}

@interactor class ViewRequestInteractor {
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  headerDropdownMenu = new HeaderDropdownMenu();
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  requestSectionPresent = isPresent('#request-info');
  requesterSectionPresent = isPresent('#requester-info');
  containsServicePoint = contains('#requester-info');
  containsClosedRequest = contains('#request-info');
}

export default new ViewRequestInteractor();
