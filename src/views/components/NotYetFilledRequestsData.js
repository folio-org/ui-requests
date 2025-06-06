import React from 'react';
import { useIntl } from 'react-intl';
import PropTypes from 'prop-types';

import {
  COLUMN_MAP,
  COLUMN_WIDTHS,
  formatter,
} from '../constants';
import { SortableList } from '../../components';

import css from './NotYetFilledRequestsData.css';

export const COLUMN_NAMES = [
  'position',
  'itemBarcode',
  'requestDate',
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

const NotYetFilledRequestsData = ({
  contentData,
  onDragEnd,
  isRowDraggable,
}) => {
  const { formatMessage } = useIntl();

  return (
    <SortableList
      onDragEnd={onDragEnd}
      isRowDraggable={isRowDraggable}
      contentData={contentData}
      visibleColumns={COLUMN_NAMES}
      columnMapping={COLUMN_MAP}
      columnWidths={COLUMN_WIDTHS}
      formatter={formatter}
      maxHeight={400}
      isEmptyMessage={
        formatMessage({ id: 'ui-requests.requestQueue.notYetFilledRequests.noData' })
      }
      rowProps={{
        additionalClasses: [css.rowOfDraggableList],
      }}
    />
  );
};

NotYetFilledRequestsData.propTypes = {
  contentData: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      status: PropTypes.string,
      position: PropTypes.number,
    }),
  ).isRequired,
  onDragEnd: PropTypes.func.isRequired,
  isRowDraggable: PropTypes.func.isRequired,
};

export default NotYetFilledRequestsData;
