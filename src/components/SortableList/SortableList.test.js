import { render } from '@testing-library/react';
import '../../../test/jest/__mock__';
import SortableList from './SortableList';

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

describe('renderSortableList', () => {
  it('should render the SortableList component with provided droppableId', () => {
    renderSortableList(propsData);
    expect(document.querySelector('[data-rbd-droppable-id="droppableId1"]')).toBeInTheDocument();
  });
});
