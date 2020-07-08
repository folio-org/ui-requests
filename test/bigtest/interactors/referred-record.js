import {
  interactor,
  clickable,
  text,
} from '@bigtest/interactor';

@interactor class ReferredRecordInteractor {
  static defaultScope = '[data-test-referred-record]';

  instanceTitle = text('[data-test-instance-link]');
  itemBarcode = text('[data-test-item-link]');
  clickInstanceLink = clickable('[data-test-instance-link]');
  clickItemLink = clickable('[data-test-item-link]');
}

export default ReferredRecordInteractor;
