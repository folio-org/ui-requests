import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { NoValue } from '@folio/stripes/components';

import { getFullName } from '../../utils';

const BarcodeLink = ({
  request: {
    requesterId,
    requester,
  },
}) => {
  const id = requester?.id ?? requesterId;
  const barcode = requester?.barcode;
  return (barcode ? <Link to={`/users/view/${id}`}>{barcode}</Link> : <NoValue />);
};

const FullNameLink = ({
  request: {
    requesterId,
    requester,
  },
}) => {
  const id = requester?.id ?? requesterId;
  return (id ? <Link to={`/users/view/${id}`}>{getFullName(requester)}</Link> : '');
};

const userShape = {
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  preferredFirstName: PropTypes.string,
};

const propTypes = {
  request: PropTypes.shape({
    requesterId: PropTypes.string,
    requester: PropTypes.shape(
      {
        id: PropTypes.string,
        barcode: PropTypes.string,
        personal: PropTypes.shape(userShape),
        ...userShape
      }
    ),
  }).isRequired,
};
BarcodeLink.propTypes = propTypes;
FullNameLink.propTypes = propTypes;

export { BarcodeLink, FullNameLink };
