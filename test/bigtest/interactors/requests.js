import {
  interactor,
  scoped,
  collection
} from '@bigtest/interactor';

export default @interactor class RequestsInteractor {
  static defaultScope = '[data-test-request-instances]';

  instances = collection('[role=listitem] a');
  instance = scoped('[data-test-instance-details]');
}
