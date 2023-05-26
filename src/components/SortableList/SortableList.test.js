import { render, screen } from '@testing-library/react';
import '../../../test/jest/__mock__';
import SortableList from './SortableList';

jest.mock('react-beautiful-dnd', () => ({
  ...jest.requireActual('react-beautiful-dnd'),
  Droppable: jest.fn(({ children }) => children({ droppableProps: { droppableid: 'droppableId1', className: 'droppable-area', role: 'list', onDragEnd: jest.fn() }, placeholder: <div data-testid="placeholder">Placeholder</div>, innerRef: jest.fn() }, {}))
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
  const Component = () => SortableList(prop);
  return (
    render(<Component />)
  );
};

describe('SortableList', () => {
  it('Should render the SortableList component with provided droppableId', () => {
    renderSortableList(propsData);
    expect(document.querySelector('[droppableid="droppableId1"]')).toBeInTheDocument();
  });
  it('Should render the MultiColumnList', () => {
    renderSortableList(propsData);
    expect(screen.getByText('MultiColumnList')).toBeInTheDocument();
  });
  it('Should render the Provided Placeholder', () => {
    renderSortableList(propsData);
    expect(screen.getByText('Placeholder')).toBeInTheDocument();
  });
});
