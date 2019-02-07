import {
  interactor,
  scoped,
  collection,
  clickable
} from '@bigtest/interactor';

export default @interactor class RequestsInteractor {
  static defaultScope = '[data-test-request-instances]';

  instances = collection('[role=row] a');
  instance = scoped('[data-test-instance-details]');
  clickHoldsCheckbox = clickable('#clickable-filter-requestType-Holds');
  clickPagesCheckbox = clickable('#clickable-filter-requestType-Pages');
  clickRecallsCheckbox = clickable('#clickable-filter-requestType-Recalls');
}
