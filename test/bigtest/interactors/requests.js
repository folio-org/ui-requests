import {
  interactor,
  scoped,
  collection,
  clickable,
  isVisible,
  count,
} from '@bigtest/interactor';

@interactor class ErrorModal {
  defaultScope = '[data-test-error-modal]';

  content = scoped('[data-test-error-modal-content]');
  closeButton = scoped('[data-test-error-modal-close-button]');
}

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#exportToCsvPaneHeaderBtn');
  clickExportExpiredHoldsToCSV = clickable('#exportExpiredHoldsToCsvPaneHeaderBtn');
  exportBtnIsVisible = isVisible('#exportToCsvPaneHeaderBtn');
  exportExpiredHoldsBtnIsVisible = isVisible('#exportExpiredHoldsToCsvPaneHeaderBtn');
}

@interactor class InstanceList {
  static defaultScope = '#list-requests';
  size = count('[role=row] a');
  items = collection('[role=row] a');
}

@interactor class RequestsInteractor {
  static defaultScope = '[data-test-request-instances]';

  headerDropdownMenu = new HeaderDropdownMenu();
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  instanceList = new InstanceList();
  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
  clickHoldsCheckbox = clickable('#clickable-filter-request-type-holds');
  clickPagesCheckbox = clickable('#clickable-filter-request-type-pages');
  clickRecallsCheckbox = clickable('#clickable-filter-request-type-recalls');
  errorModal = new ErrorModal();

  whenInstancesArePresent(size) {
    return this.when(() => {
      return this.instanceList.isPresent && this.instanceList.size === size;
    });
  }
}

export default RequestsInteractor;
