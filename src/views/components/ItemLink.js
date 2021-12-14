import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { REQUEST_LEVEL_TYPES } from '../../constants';
import { MISSING_VALUE_SYMBOL } from '../constants';

const ItemLink = ({
  request: {
    requestLevel,
    instanceId,
    holdingsRecordId,
    itemId,
    item: { barcode },
  },
}) => (
  requestLevel === REQUEST_LEVEL_TYPES.ITEM
    ? (<Link to={`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`}>{barcode}</Link>)
    : MISSING_VALUE_SYMBOL
);

ItemLink.propTypes = {
  request: PropTypes.shape({
    requestLevel: PropTypes.string.isRequired,
    instanceId: PropTypes.string.isRequired,
    holdingsRecordId: PropTypes.string,
    itemId: PropTypes.string,
    item: PropTypes.shape({
      barcode: PropTypes.string,
    }),
  }).isRequired,
};

export default ItemLink;
