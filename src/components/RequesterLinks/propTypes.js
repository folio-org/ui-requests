import React from 'react';
import PropTypes from 'prop-types';

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

export default propTypes;
