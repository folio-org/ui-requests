import React from 'react';
import { FormattedMessage } from 'react-intl';

import { requestStatuses } from './constants';

function getItemErrors(item, values) {
  let error = null;

  if (!item) {
    error = { item: { barcode: <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" /> } };
  } else if (item.status.name !== requestStatuses.CHECKED_OUT) {
    if (values.requestType === requestStatuses.RECALL) {
      error = { item: { barcode: <FormattedMessage id="ui-requests.errors.onlyCheckedOutForRecall" /> } };
    } else if (values.requestType === requestStatuses.HOLD) {
      error = { item: { barcode: <FormattedMessage id="ui-requests.errors.onlyCheckedOutForHold" /> } };
    }
  }

  return error;
}

function asyncValidateItem(values, props) {
  return new Promise((resolve, reject) => {
    const uv = props.uniquenessValidator.itemUniquenessValidator;
    const query = `(barcode="${values.item.barcode}")`;
    uv.reset();
    uv.GET({ params: { query } }).then((items) => {
      const errors = getItemErrors(items[0], values);
      if (errors) {
        reject(errors);
      } else {
        resolve();
      }
    });
  });
}

function asyncValidateUser(values, props) {
  return new Promise((resolve, reject) => {
    const uv = props.uniquenessValidator.userUniquenessValidator;
    const query = `(barcode="${values.requester.barcode}")`;
    uv.reset();
    uv.GET({ params: { query } }).then((users) => {
      if (users.length < 1) {
        const error = { requester: { barcode: <FormattedMessage id="ui-requests.errors.userBarcodeDoesNotExist" /> } };
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export default function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'item.barcode' && values.item.barcode !== undefined) {
    return asyncValidateItem(values, props);
  } else if (blurredField === 'requester.barcode' && values.requester.barcode !== undefined) {
    return asyncValidateUser(values, props);
  }

  return new Promise(resolve => resolve());
}
