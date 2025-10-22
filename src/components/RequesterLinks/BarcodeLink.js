import React from 'react';
import { Link } from 'react-router-dom';

import { NoValue } from '@folio/stripes/components';

import propTypes from './propTypes';

const BarcodeLink = ({
  request: {
    requesterId,
    requester,
  } = {},
}) => {
  const id = requester?.id ?? requesterId;
  const barcode = requester?.barcode;
  return (barcode ? <Link to={`/users/view/${id}`}>{barcode}</Link> : <NoValue />);
};
BarcodeLink.propTypes = propTypes;

export default BarcodeLink;
