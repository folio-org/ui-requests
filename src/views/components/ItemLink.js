import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { NoValue } from '@folio/stripes/components';

const ItemLink = ({
  request: {
    instanceId,
    holdingsRecordId,
    itemId,
    item,
  },
}) => (item?.barcode
  ? (<Link to={`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`}>{item.barcode}</Link>)
  : <NoValue />);

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
