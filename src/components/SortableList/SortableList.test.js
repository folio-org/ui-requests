import {
  render,
  screen,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import SortableList from './SortableList';

jest.mock('react-beautiful-dnd', () => ({
  ...jest.requireActual('react-beautiful-dnd'),
  Droppable: jest.fn(({ children }) => children({
    droppableProps: {
      droppableid: 'droppableId1',
      className: 'droppable-area',
      role: 'list',
      onDragEnd: jest.fn(),
    },
    placeholder: <div data-testid="placeholder">Placeholder</div>,
    innerRef: jest.fn(),
  }, {})),
}));

const mockonDragEnd = jest.fn();
const propsData = {
  droppableId: 'droppableId1',
  onDragEnd: mockonDragEnd,
  rowFormatter: jest.fn(),
  isRowDraggable: jest.fn(),
  rowProps: {},
  visibleColumns: ['draggable', ''],
  columnMapping: {},
  columnWidths: {},
  formatter: {},
};

const renderSortableList = (prop) => {
  render(<SortableList {...prop} />);
};

describe('SortableList', () => {
  beforeEach(() => {
    renderSortableList(propsData);
  });

  it('should render the SortableList component with provided droppableId', () => {
    expect(document.querySelector('[droppableid="droppableId1"]')).toBeInTheDocument();
  });

  it('should render the MultiColumnList', () => {
    expect(screen.getByText('MultiColumnList')).toBeInTheDocument();
  });

  it('should render the Provided Placeholder', () => {
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
  });
});
