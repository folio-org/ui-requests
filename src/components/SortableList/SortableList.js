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
    droppableId = uniqueId('droppable'),
    onDragEnd,
    rowFormatter = draggableRowFormatter,
    isRowDraggable = () => true,
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

SortableList.propTypes = {
  droppableId: PropTypes.string,
  onDragEnd: PropTypes.func,
  rowFormatter: PropTypes.func,
  isRowDraggable: PropTypes.func,
  rowProps: PropTypes.shape({
    additionalClasses: PropTypes.arrayOf(PropTypes.string),
  }),
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  columnWidths: PropTypes.shape({
    chronology: PropTypes.shape({
      max: PropTypes.number,
    }),
    enumeration: PropTypes.shape({
      max: PropTypes.number,
    }),
    fulfillmentStatus: PropTypes.shape({
      max: PropTypes.number,
    }),
    itemBarcode: PropTypes.shape({
      max: PropTypes.number,
    }),
  }).isRequired,
  columnMapping: PropTypes.shape({
    chronology: PropTypes.shape({
      props: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
    enumeration: PropTypes.shape({
      props: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
    fulfillmentStatus: PropTypes.shape({
      props: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
    itemBarcode: PropTypes.shape({
      props: PropTypes.shape({
        id: PropTypes.string,
      }),
    }),
  }).isRequired,
  formatter: PropTypes.shape({
    chronology: PropTypes.func,
    enumeration: PropTypes.func,
    fulfillmentStatus: PropTypes.func,
    itemBarcode: PropTypes.func,
  }).isRequired,
};
