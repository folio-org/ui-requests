import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash';
import {
  MultiColumnList,
  Icon,
} from '@folio/stripes/components';
import {
  DragDropContext,
  Droppable,
} from 'react-beautiful-dnd';

import draggableRowFormatter from './draggableRowFormatter';

export default function SortableList(props) {
  const {
    droppableId,
    onDragEnd,
    rowFormatter,
    isRowDraggable,
    rowProps,
    visibleColumns: originalVisibleColumns,
    columnWidths: originalColumnWidths,
    columnMapping: originalColumnMapping,
    formatter: originalFormatter,
  } = props;

  const visibleColumns = useMemo(() => ([
    'draggable',
    ...originalVisibleColumns,
  ]), [originalVisibleColumns]);

  const columnWidths = useMemo(() => ({
    draggable: { max: 40 },
    ...originalColumnWidths,
  }), [originalColumnWidths]);

  const columnMapping = useMemo(() => ({
    draggable: '',
    ...originalColumnMapping,
  }), [originalColumnMapping]);

  const formatter = useMemo(() => ({
    draggable: () => <Icon icon="drag-drop" />,
    ...originalFormatter,
  }), [originalFormatter]);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId={droppableId}>
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <MultiColumnList
              {...props}
              columnWidths={columnWidths}
              visibleColumns={visibleColumns}
              columnMapping={columnMapping}
              formatter={formatter}
              rowFormatter={rowFormatter}
              rowProps={{
                ...rowProps,
                isRowDraggable,
              }}
            />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

SortableList.defaultProps = {
  droppableId: uniqueId('droppable'),
  rowFormatter: draggableRowFormatter,
  isRowDraggable: () => true,
};

SortableList.propTypes = {
  droppableId: PropTypes.string,
  onDragEnd: PropTypes.func,
  rowFormatter: PropTypes.func,
  isRowDraggable: PropTypes.func,
  rowProps: PropTypes.object,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  columnWidths: PropTypes.object.isRequired,
  columnMapping: PropTypes.object.isRequired,
  formatter: PropTypes.object.isRequired,
};
