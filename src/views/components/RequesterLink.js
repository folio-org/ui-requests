import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const RequesterLink = ({
  request: {
    requesterId,
    requester: { barcode },
  },
}) => <Link to={`/users/view/${requesterId}`}>{barcode}</Link>;

RequesterLink.propTypes = {
  request: PropTypes.shape({
    requesterId: PropTypes.string.isRequired,
    requester: PropTypes.shape(
      {
        barcode: PropTypes.string.isRequired,
      }
    ).isRequired,
  }).isRequired,
};

export default RequesterLink;
