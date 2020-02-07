import {
  interactor,
  scoped,
  collection,
  clickable,
  isVisible,
  count,
  property,
  text,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  defaultScope = '[data-test-error-modal]';

  content = scoped('[data-test-error-modal-content]');
  closeButton = scoped('[data-test-error-modal-close-button]');
}

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#exportToCsvPaneHeaderBtn');
  clickExportExpiredHoldsToCSV = clickable('#exportExpiredHoldsToCsvPaneHeaderBtn');
  exportBtnIsVisible = isVisible('#exportToCsvPaneHeaderBtn');
  exportExpiredHoldsBtnIsVisible = isVisible('#exportExpiredHoldsToCsvPaneHeaderBtn');
  clickPrintPickSlipsBtn = clickable('#printPickSlipsBtn');
  printPickSlipsIsVisible = isVisible('#printPickSlipsBtn');
  printPickSlipsIsDisabled = property('#printPickSlipsBtn', 'disabled');
  printPickSlipsBtnText = text('#printPickSlipsBtn');
}

@interactor class InstanceList {
  static defaultScope = '#list-requests';
  size = count('[role=row] a');
  items = collection('[role=row] a');
}

@interactor class RequestsInteractor {
  static defaultScope = '[data-test-request-instances]';

  headerDropdownMenu = new HeaderDropdownMenu();
  headerDropdown = scoped('[class*=paneHeaderCenterInner---] [class*=dropdown---] button');
  instanceList = new InstanceList();
  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
  clickHoldsCheckbox = clickable('#clickable-filter-requestType-hold');
  clickPagesCheckbox = clickable('#clickable-filter-requestType-page');
  clickRecallsCheckbox = clickable('#clickable-filter-requestType-recall');
  clickOpenNotFilled = clickable('#clickable-filter-requestStatus-open-not-yet-filled');
  errorModal = new ErrorModal();

  whenInstancesArePresent(size) {
    return this.when(() => {
      return this.instanceList.isPresent && this.instanceList.size === size;
    });
  }
}

export default RequestsInteractor;
