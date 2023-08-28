import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import DraggableRow, {
  getItemStyle,
} from './DraggableRow';

describe('DraggableRow', () => {
  const cells = [<div key="cell-1">Cell 1</div>];
  const rowProps = {
    additionalClasses: ['extra-class'],
  };
  const provided = {
    innerRef: jest.fn(),
    draggableProps: {},
    dragHandleProps: {},
  };
  const props = {
    cells,
    provided,
    snapshot: {
      isDragging: false,
    },
    rowClass: 'row-class',
    rowIndex: 1,
    rowProps,
  };

  describe('getItemStyle', () => {
    it('should return style', () => {
      const style = {
        class: 'class',
      };

      expect(getItemStyle(style)).toEqual({
        ...style,
        userSelect: 'none',
      });
    });
  });

  it('should render DraggableRow', () => {
    render(
      <DraggableRow {...props} />
    );

    expect(screen.getByText('Cell 1')).toBeInTheDocument();
  });

  it('should have css "class extra-class row-class" if isDragging prop false', () => {
    render(
      <DraggableRow {...props} />
    );

    expect(document.querySelector('[class="extra-class row-class"]')).toBeInTheDocument();
  });

  it('should have css "class extra-class row-class DraggableRow" if isDragging prop true', () => {
    const draggableProps = {
      ...props,
      snapshot: {
        isDragging: true,
      },
    };

    document.body.innerHTML = '<div id="ModuleContainer"></div>';

    render(
      <DraggableRow {...draggableProps} />
    );

    expect(document.querySelector('[class="extra-class row-class DraggableRow"]')).toBeInTheDocument();
  });
});
