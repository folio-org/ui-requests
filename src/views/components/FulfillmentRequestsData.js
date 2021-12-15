import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  MultiColumnList,
} from '@folio/stripes/components';
import {
  COLUMN_MAP,
  COLUMN_WIDTHS,
  formatter,
} from '../constants';

export const COLUMN_NAMES = [
  'fulfillmentStatus',
  'itemBarcode',
  'requestDate',
  'status',
  'pickupDelivery',
  'requester',
  'requesterBarcode',
  'patronGroup',
  'requestType',
  'enumeration',
  'chronology',
  'volume',
  'patronComments',
];

const FulfillmentRequestsData = ({ contentData }) => {
  const { formatMessage } = useIntl();

  return (
    <MultiColumnList
      contentData={contentData}
      visibleColumns={COLUMN_NAMES}
      columnMapping={COLUMN_MAP}
      columnWidths={COLUMN_WIDTHS}
      formatter={formatter}
      maxHeight={400}
      isEmptyMessage={
        formatMessage({ id: 'ui-requests.requestQueue.noDataForFulfillment' })
      }
    />
  );
};

FulfillmentRequestsData.propTypes = {
  contentData: PropTypes.arrayOf(
    PropTypes.object
  ).isRequired,
};

export default FulfillmentRequestsData;
