import React from 'react';
import { render } from '@testing-library/react';

import '../../../test/jest/__mock__';

import { SortableList } from '../../components';
import NotYetFilledRequestsData, {
  COLUMN_NAMES,
} from './NotYetFilledRequestsData';

import {
  COLUMN_MAP,
  COLUMN_WIDTHS,
  formatter,
} from '../constants';

jest.mock('../../components', () => ({
  SortableList: jest.fn(() => null),
}));

describe('NotYetFilledRequestsData', () => {
  const testContentData = [
    {
      id: 'testRequestId',
    },
  ];
  const testOnDragEnd = () => {};
  const testIsRowDraggable = () => {};
  const labelIds = {
    notYetFilledRequestsNoData: 'ui-requests.requestQueue.notYetFilledRequests.noData',
  };

  beforeEach(() => {
    render(
      <NotYetFilledRequestsData
        contentData={testContentData}
        onDragEnd={testOnDragEnd}
        isRowDraggable={testIsRowDraggable}
      />
    );
  });

  afterEach(() => {
    SortableList.mockClear();
  });

  it('should execute `SortableList` with passed props', () => {
    const expectedResult = {
      id: 'requests-list',
      contentData: testContentData,
      visibleColumns: COLUMN_NAMES,
      columnMapping: COLUMN_MAP,
      columnWidths: COLUMN_WIDTHS,
      formatter,
      maxHeight: 400,
      isEmptyMessage: labelIds.notYetFilledRequestsNoData,
      onDragEnd: testOnDragEnd,
      isRowDraggable: testIsRowDraggable,
    };

    expect(SortableList).toHaveBeenCalledWith(expectedResult, {});
  });
});
