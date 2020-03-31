import {
  clickable,
  interactor,
  isVisible,
  property,
  text,
} from '@bigtest/interactor';

@interactor class HeaderDropdownMenu {
  clickCancel = clickable('#clickable-cancel-request');
  clickDelete = clickable('[data-test-delete-request]');
  clickDuplicate = clickable('#duplicate-request');
  clickEdit = clickable('#clickable-edit-request');
  clickNew = clickable('#clickable-newrequest');
  clickExportToCSV = clickable('#exportToCsvPaneHeaderBtn');
  clickExportExpiredHoldsToCSV = clickable('#exportExpiredHoldsToCsvPaneHeaderBtn');
  isExportExpiredHoldsToCSVDisabled = property('#exportExpiredHoldsToCsvPaneHeaderBtn', 'disabled');
  clickMove = clickable('#move-request');
  clickPrintPickSlipsBtn = clickable('#printPickSlipsBtn');

  exportBtnIsVisible = isVisible('#exportToCsvPaneHeaderBtn');
  exportExpiredHoldsBtnIsVisible = isVisible('#exportExpiredHoldsToCsvPaneHeaderBtn');
  printPickSlipsIsVisible = isVisible('#printPickSlipsBtn');
  printPickSlipsIsDisabled = property('#printPickSlipsBtn', 'disabled');
  printPickSlipsBtnText = text('#printPickSlipsBtn');
}

export default HeaderDropdownMenu;
