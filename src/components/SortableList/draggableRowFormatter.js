import React from 'react';
import {
  Draggable
} from 'react-beautiful-dnd';

import DraggableRow from './DraggableRow';

export default function draggableRowFormatter(props) {
  const { rowIndex } = props;

  return (
    <Draggable
      key={`row-${rowIndex}`}
      draggableId={`draggable-${rowIndex}`}
      index={rowIndex}
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
