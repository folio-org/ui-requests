import React from 'react';
import { render, screen } from '@testing-library/react';
import DraggableRow from './DraggableRow';

describe('DraggableRow', () => {
  const cells = [<div key="cell-1">Cell 1</div>, <div key="cell-2">Cell 2</div>];
  const rowProps = {
    additionalClasses: ['extra-class'],
  };
  const provided = {
    innerRef: jest.fn(),
    draggableProps: {
      style: { transform: 'translate(0, 0)' },
      'aria-describedby': 'row-1',
    },
    dragHandleProps: {},
  };
  test('renders DraggableRow correctly', () => {
    render(
      <DraggableRow
        cells={cells}
        provided={provided}
        snapshot={{ isDragging: false }}
        rowClass="row-class"
        rowIndex={1}
        rowProps={rowProps}
      />
    );
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  test('If isDragging prop false, class should be extra-class row-class', () => {
    render(
      <DraggableRow
        cells={cells}
        provided={provided}
        snapshot={{ isDragging: false }}
        rowClass="row-class"
        rowIndex={1}
        rowProps={rowProps}
      />
    );
    expect(document.querySelector('[class="extra-class row-class"]')).toBeInTheDocument();
  });

  test('renders DraggableRow using portal', () => {
    document.body.innerHTML = '<div id="ModuleContainer"></div>';
    render(
      <DraggableRow
        cells={cells}
        provided={provided}
        snapshot={{ isDragging: true }}
        rowClass="row-class"
        rowIndex={1}
        rowProps={rowProps}
      />
    );
    expect(document.getElementById('ModuleContainer')).toBeInTheDocument();
  });

  test('If isDragging prop True, class should be extra-class row-class DraggableRow', () => {
    render(
      <DraggableRow
        cells={cells}
        provided={provided}
        snapshot={{ isDragging: true }}
        rowClass="row-class"
        rowIndex={1}
        rowProps={rowProps}
      />
    );
    expect(document.querySelector('[class="extra-class row-class DraggableRow"]')).toBeInTheDocument();
  });
});
