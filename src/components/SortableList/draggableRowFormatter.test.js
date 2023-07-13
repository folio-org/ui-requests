import {
  render,
  screen,
} from '@testing-library/react';

import draggableRowFormatter from './draggableRowFormatter';

jest.mock('react-beautiful-dnd', () => ({
  ...jest.mock('react-beautiful-dnd'),
  Draggable: (prop) => {
    return (
      <div>
        <div>{prop.children()}</div>
      </div>
    );
  },
}));

const cells = [
  <div key="cell-1">Cell 1</div>,
  <div key="cell-2">Cell 2</div>,
  <div key="cell-3">Cell 3</div>,
];

const propsData = {
  rowIndex: 0,
  rowData: 'rowData',
  rowProps: {
    isRowDraggable: jest.fn(),
    additionalClasses: ['my-additional-class'],
  },
  snapshot: {
    isDragging: false,
  },
  provided: {
    draggableProps: {
      style: {
        backgroundColor: 'white',
      },
    },
    dragHandleProps: '',
    innerRef: () => {},
  },
  cells,
};

const renderDraggableRowFormatter = (prop) => {
  const Component = () => draggableRowFormatter(prop);

  return (
    render(<Component />)
  );
};

describe('draggableRowFormatter', () => {
  it('should render correctly draggableRowFormatter component', () => {
    renderDraggableRowFormatter(propsData);

    expect(screen.getByRole('row', { name: /Cell 1 Cell 2 Cell 3/i })).toBeInTheDocument();
  });
});
