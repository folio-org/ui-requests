import {
  clickable,
  collection,
  interactor,
  scoped,
} from '@bigtest/interactor';

import HeaderDropdown from './header-dropdown';
import HeaderDropdownMenu from './header-dropdown-menu';
import InstanceList from './instance-list';
import ErrorModal from './error-modal';

@interactor class RequestsInteractor {
  static defaultScope = '[data-test-request-instances]';

  headerDropdownMenu = new HeaderDropdownMenu();
  headerDropdown = new HeaderDropdown();
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
