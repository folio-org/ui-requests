import React from 'react';
import {
  render,
} from '@testing-library/react';

import '../test/jest/__mock__';

import {
  Modal,
  MultiColumnList,
  Pane,
} from '@folio/stripes/components';

import { Loading } from './components';
import ItemsDialog, {
  COLUMN_NAMES,
  COLUMN_WIDTHS,
  COLUMN_MAP,
  formatter,
  MAX_HEIGHT,
} from './ItemsDialog';

jest.mock('./components', () => ({
  Loading: jest.fn(() => null),
}));

describe('ItemsDialog', () => {
  const labelIds = {
    selectItem: 'ui-requests.items.selectItem',
    instanceItems: 'ui-requests.items.instanceItems',
    resultCount: 'ui-requests.resultCount',
    instanceItemsNotFound: 'ui-requests.items.instanceItems.notFound',
  };
  const onClose = jest.fn();
  const onRowClick = jest.fn();
  const testRequest = {
    instance: {
      title: 'testTitle',
    },
  };
  const testItems = [{
    requestQueue: 2,
  }, {
    requestQueue: 1,
  }];
  const expectedContentData = [{
    requestQueue: 1,
  }, {
    requestQueue: 2,
  }];
  const defaultTestProps = {
    open: false,
    onClose,
    onRowClick,
    request: testRequest,
    items: testItems,
    isLoading: false,
  };

  afterEach(() => {
    Modal.mockClear();
    MultiColumnList.mockClear();
    Pane.mockClear();
    Loading.mockClear();
    onClose.mockClear();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(<ItemsDialog {...defaultTestProps} />);
    });

    it('should render Pane', () => {
      expect(Pane).toHaveBeenLastCalledWith(
        expect.objectContaining({
          paneTitle: labelIds.instanceItems,
          paneSub: labelIds.resultCount,
          defaultWidth: 'fill',
          noOverflow: true,
        }), {}
      );
    });
  });

  [
    true,
    false,
  ].forEach((open) => {
    describe(`when open prop is ${open}`, () => {
      beforeEach(() => {
        render(
          <ItemsDialog
            {...defaultTestProps}
            open={open}
          />
        );
      });

      it('should render Modal', () => {
        expect(Modal).toHaveBeenLastCalledWith(
          expect.objectContaining({
            'data-test-move-request-modal': true,
            label: labelIds.selectItem,
            open,
            onClose,
            dismissible: true,
          }), {}
        );
      });
    });
  });

  [
    true,
    false,
  ].forEach((isLoading) => {
    describe(`when open isLoading is ${isLoading}`, () => {
      beforeEach(() => {
        render(
          <ItemsDialog
            {...defaultTestProps}
            isLoading={isLoading}
          />
        );
      });

      if (isLoading) {
        it('should render Loading', () => {
          expect(Loading).toHaveBeenCalledTimes(1);
        });

        it('should not render MultiColumnList', () => {
          expect(MultiColumnList).toHaveBeenCalledTimes(0);
        });
      } else {
        it('should not render Loading', () => {
          expect(Loading).toHaveBeenCalledTimes(0);
        });

        it('should render MultiColumnList', () => {
          expect(MultiColumnList).toHaveBeenLastCalledWith(
            {
              id: 'instance-items-list',
              interactive: true,
              ariaLabel: labelIds.instanceItems,
              contentData: expectedContentData,
              visibleColumns: COLUMN_NAMES,
              columnMapping: COLUMN_MAP,
              columnWidths: COLUMN_WIDTHS,
              formatter,
              maxHeight: MAX_HEIGHT,
              isEmptyMessage: labelIds.instanceItemsNotFound,
              onRowClick,
            }, {}
          );
        });
      }
    });
  });
});
