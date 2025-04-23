import React from 'react';
import PropTypes from 'prop-types';
import {
  Draggable
} from 'react-beautiful-dnd';

import DraggableRow from './DraggableRow';

export default function draggableRowFormatter(props) {
  const {
    rowIndex,
    rowData,
    rowProps: {
      isRowDraggable,
    },
  } = props;

  return (
    <Draggable
      key={`row-${rowIndex}`}
      draggableId={`draggable-${rowIndex}`}
      index={rowIndex}
      isDragDisabled={!isRowDraggable(rowData, rowIndex)}
    >
      {(provided, snapshot) => (
        <DraggableRow
          provided={provided}
          snapshot={snapshot}
          {...props}
        />
      )}
    </Draggable>
  );
}

draggableRowFormatter.propTypes = {
  rowIndex: PropTypes.number,
  rowData: PropTypes.shape({
    id: PropTypes.string,
    requestLevel: PropTypes.string,
    fulfillmentPreference: PropTypes.string,
  }),
  rowProps: PropTypes.shape({
    isRowDraggable: PropTypes.bool
  }),
};
