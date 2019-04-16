import {
  interactor,
  scoped,
  collection,
  clickable
} from '@bigtest/interactor';

@interactor class HeaderDropdown {
  click = clickable('button');
}

@interactor class HeaderDropdownMenu {
  clickExportToCSV = clickable('#exportToCsvPaneHeaderBtn');
}

@interactor class RequestsInteractor {
  headerDropdownMenu = new HeaderDropdownMenu();
  headerDropdown = new HeaderDropdown('[class*=paneHeaderCenterInner---] [class*=dropdown---]');
  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
  clickHoldsCheckbox = clickable('#clickable-filter-request-type-holds');
  clickPagesCheckbox = clickable('#clickable-filter-request-type-pages');
  clickRecallsCheckbox = clickable('#clickable-filter-request-type-recalls');
}

export default RequestsInteractor;
