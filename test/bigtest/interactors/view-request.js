import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

@interactor class ViewRequestInteractor {
  requestSectionPresent = isPresent('#request-info');
  requesterSectionPresent = isPresent('#requester-info');
}

export default new ViewRequestInteractor('[data-test-instance-details]');
