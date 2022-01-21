import { isEmpty } from 'lodash';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getInstanceQueryString } from './utils';

function asyncValidateItem(values, props) {
  const uv = props.parentMutator.itemUniquenessValidator;
  const query = `(barcode=="${values.item.barcode}")`;

  uv.reset();
  return uv.GET({ params: { query } }).then((items) => {
    return (items.length < 1)
      ? { barcode: <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" /> }
      : null;
  });
}

function asyncValidateUser(values, props) {
  const uv = props.parentMutator.userUniquenessValidator;
  const query = `(barcode=="${values.requester.barcode}")`;

  uv.reset();
  return uv.GET({ params: { query } }).then((users) => {
    return (users.length < 1)
      ? { barcode: <FormattedMessage id="ui-requests.errors.userBarcodeDoesNotExist" /> }
      : null;
  });
}

export const asyncValidateInstance = (values, props) => {
  const uv = props.parentMutator.instanceUniquenessValidator;
  const { instance:{ hrid }, instanceId } = values;
  const query = getInstanceQueryString(hrid, instanceId);

  uv.reset();

  return uv.GET({ params: { query } }).then((instances) => {
    return instances.length
      ? null
      : { hrid: <FormattedMessage id="ui-requests.errors.instanceUuidOrHridDoesNotExist" /> };
  });
};

export default async function asyncValidate(values, dispatch, props) {
  const { asyncErrors } = props;
  const errors = {};

  if (values?.item?.barcode && !asyncErrors?.item?.barcode) {
    const error = await asyncValidateItem(values, props);
    if (error) errors.item = error;
  }

  if (values?.requester?.barcode && !asyncErrors?.requester?.barcode) {
    const error = await asyncValidateUser(values, props);
    if (error) errors.requester = error;
  }

  if ((values?.instance?.hrid || values?.instanceId) && !values?.item?.barcode && !asyncErrors?.instance?.hrid) {
    const error = await asyncValidateInstance(values, props);

    if (error) {
      errors.instance = error;
    }
  }

  if (asyncErrors) {
    Object.assign(errors, asyncErrors);
  }

  return new Promise((resolve, reject) => (isEmpty(errors) ? resolve() : reject(errors)));
}
