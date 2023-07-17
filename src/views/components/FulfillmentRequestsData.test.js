import React from 'react';
import {
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import {
  MultiColumnList,
} from '@folio/stripes/components';

import FulfillmentRequestsData, {
  COLUMN_NAMES,
} from './FulfillmentRequestsData';

import {
  COLUMN_MAP,
  COLUMN_WIDTHS,
  formatter,
} from '../constants';

describe('FulfillmentRequestsData', () => {
  const mockedContentData = [
    {
      id: 'testRequestId',
    },
  ];
  const labelIds = {
    noDataForFulfillment: 'ui-requests.requestQueue.noDataForFulfillment',
  };

  beforeEach(() => {
    render(
      <FulfillmentRequestsData contentData={mockedContentData} />
    );
  });

  afterEach(() => {
    MultiColumnList.mockClear();
  });

  it('should execute `MultiColumnList` with passed props', () => {
    const expectedResult = {
      contentData: mockedContentData,
      visibleColumns: COLUMN_NAMES,
      columnMapping: COLUMN_MAP,
      columnWidths: COLUMN_WIDTHS,
      formatter,
      maxHeight: 400,
      isEmptyMessage: labelIds.noDataForFulfillment,
    };

    expect(MultiColumnList).toHaveBeenCalledWith(expectedResult, {});
  });
});
