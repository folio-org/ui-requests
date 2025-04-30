import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

import css from './DraggableRow.css';

export const getItemStyle = (draggableStyle) => {
  return {
    userSelect: 'none',
    ...draggableStyle,
  };
};

export default function DraggableRow(props) {
  const {
    snapshot,
    provided,
    rowIndex,
    rowProps: {
      additionalClasses,
    },
    rowClass,
    cells,
  } = props;

  const usePortal = snapshot.isDragging;
  let classNames = [...additionalClasses, rowClass];

  if (usePortal) {
    classNames.push(css.DraggableRow);
  }

  classNames = classNames.join(' ');

  const Row = (
    <div
      id={`row-${rowIndex}`}
      data-test-draggable-row
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      key={`row-${rowIndex}`}
      className={classNames}
      role="row"
      tabIndex="0"
      style={getItemStyle(
        provided.draggableProps.style
      )}
    >
      {cells}
    </div>
  );

  if (!usePortal) {
    return Row;
  }

  const container = document.getElementById('ModuleContainer');
  return ReactDOM.createPortal(Row, container);
}

DraggableRow.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.element),
  provided: PropTypes.shape({
    dragHandleProps: PropTypes.shape({
      role: PropTypes.string,
    }),
    draggableProps: PropTypes.shape({
      style: PropTypes.shape({
        transform: PropTypes.string,
        transition: PropTypes.string,
      }),
    }),
  }),
  snapshot: PropTypes.shape({
    mode: PropTypes.string,
    isDragging: PropTypes.bool,
  }),
  rowClass: PropTypes.string,
  rowIndex: PropTypes.number,
  rowProps: PropTypes.shape({
    style: PropTypes.shape({
      minWidth: PropTypes.string,
    }),
    additionalClasses: PropTypes.arrayOf(PropTypes.string),
  }),
};
