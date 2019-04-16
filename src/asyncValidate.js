import { get } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';

function getItemErrors(item) {
  let error = null;
  if (!item) {
    error = { item: { barcode: <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" /> } };
  }

  return error;
}

function asyncValidateItem(values, props) {
  return new Promise((resolve, reject) => {
    const uv = props.uniquenessValidator.itemUniquenessValidator;
    const query = `(barcode="${values.item.barcode}")`;
    uv.reset();
    uv.GET({ params: { query } }).then((items) => {
      const errors = getItemErrors(items[0]);
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

export default function asyncValidate(values, dispatch, props) {
  const previousErrors = props.asyncErrors;

  if (get(values, 'item.barcode') && !get(previousErrors, 'item.barcode')) {
    return asyncValidateItem(values, props);
  } else if (get(values, 'requester.barcode') && !get(previousErrors, 'requester.barcode')) {
    return asyncValidateUser(values, props);
  } else if (previousErrors) {
    return new Promise((_, reject) => reject(previousErrors));
  }

  return new Promise(resolve => resolve());
}
