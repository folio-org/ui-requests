import {
  interactor,
  clickable,
  fillable,
  selectable,
  isPresent,
  is,
  scoped,
} from '@bigtest/interactor';

import CancelRequestDialog from './cancel-request-dialog';
import KeyValue from './KeyValue';

@interactor class EditRequests {
  fillRequestExpirationDateField = fillable('#requestExpirationDate');
  chooseServicePoint = selectable('[name="pickupServicePointId"]');
  clickUpdate = clickable('#clickable-save-request');
  clickCancel = clickable('#clickable-cancel-request-changes');
  cancelRequestDialog = new CancelRequestDialog('[data-test-cancel-request-modal]');
  isLayerPresent = isPresent('[class*=LayerRoot][role=dialog]');
  fulfillmentPreferenceFieldDisabled = is('[data-test-fulfillment-preference-filed]', ':disabled');
  patronComments = scoped('[data-test-request-patron-comments] div', KeyValue);
  isPatronCommentsEditable = isPresent('[data-test-request-patron-comments] textarea');
  requestsOnItem = scoped('[data-test-requests-on-item] div', KeyValue);
  fillUserBarcode = fillable('[name="requester.barcode"]');
  clickUserEnterBtn = clickable('#clickable-select-requester');
  isPatronBlockModalPresent = isPresent('[data-test-patron-block-modal]');
}

export default EditRequests;
