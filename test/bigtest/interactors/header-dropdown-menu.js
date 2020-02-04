import {
  clickable,
  interactor,
  isVisible,
  property,
} from '@bigtest/interactor';

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('#clickable-cancel-request');
  clickEdit = clickable('#clickable-edit-request');
  clickDelete = clickable('[data-test-delete-request]');
  clickDuplicate = clickable('#duplicate-request');
  clickMove = clickable('#move-request');
  clickExportToCSV = clickable('#exportToCsvPaneHeaderBtn');
  clickExportExpiredHoldsToCSV = clickable('#exportExpiredHoldsToCsvPaneHeaderBtn');
  exportBtnIsVisible = isVisible('#exportToCsvPaneHeaderBtn');
  exportExpiredHoldsBtnIsVisible = isVisible('#exportExpiredHoldsToCsvPaneHeaderBtn');
  printPickSlipsIsVisible = isVisible('#printPickSlipsBtn');
  printPickSlipsIsDisabled = property('#printPickSlipsBtn', 'disabled');
}

export default HeaderDropdownMenu;
