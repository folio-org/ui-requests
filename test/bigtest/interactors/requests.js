import {
  interactor,
  scoped,
  collection,
  clickable,
} from '@bigtest/interactor';

import HeaderDropdownMenu from './header-dropdown-menu';
import ErrorModalInteractor from './error-modal';
import InstanceList from './instance-list';

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
  errorModal = new ErrorModalInteractor('#OverlayContainer');

  whenInstancesArePresent(size) {
    return this.when(() => {
      return this.instanceList.isPresent && this.instanceList.size === size;
    });
  }
}

export default RequestsInteractor;
