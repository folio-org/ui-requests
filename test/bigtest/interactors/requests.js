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
  clickHoldsCheckbox = clickable('#clickable-filter-request-type-holds');
  clickPagesCheckbox = clickable('#clickable-filter-request-type-pages');
  clickRecallsCheckbox = clickable('#clickable-filter-request-type-recalls');
}
