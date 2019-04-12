import {
  interactor,
  isPresent,
} from '@bigtest/interactor';

import { contains } from './helpers';

@interactor class ViewRequestInteractor {
  requestSectionPresent = isPresent('#request-info');
  requesterSectionPresent = isPresent('#requester-info');
  containsServicePoint = contains('#requester-info', 'Circ Desk 2');
}

export default new ViewRequestInteractor('[data-test-instance-details]');
