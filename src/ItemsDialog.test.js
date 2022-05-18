import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../test/jest/__mock__';

import {
  Modal,
  MultiColumnList,
  Pane,
  Paneset,
} from '@folio/stripes/components';

import { itemStatuses, itemStatusesTranslations } from './constants';
import { Loading } from './components';
import ItemsDialog, {
  COLUMN_NAMES,
  COLUMN_WIDTHS,
  COLUMN_MAP,
  formatter,
  MAX_HEIGHT,
} from './ItemsDialog';

jest.mock('./components', () => ({
  Loading: jest.fn((props) => (
    <div {...props} />
  )),
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
  const testTitle = 'testTitle';
  const testInstanceId = 'testInstanceId';
  const testMutator = {
    holdings: {
      GET: jest.fn(() => (new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            [{
              id: '1',
            }, {
              id: '2',
            }]
          );
        });
      }))),
      reset: jest.fn(),
    },
    items: {
      GET: jest.fn(() => (new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            [{
              id: '1',
              status: {
                name: itemStatuses.IN_PROCESS,
              },
            }, {
              id: '2',
              status: {
                name: itemStatuses.AVAILABLE,
              },
            }, {
              id: '3',
              status: {
                name: itemStatuses.IN_TRANSIT,
              },
            }]
          );
        });
      }))),
      reset: jest.fn(),
    },
    requests: {
      GET: jest.fn(() => (new Promise((resolve) => {
        setTimeout(() => {
          resolve(
            [{
              id: '1',
              itemId: '1',
            }, {
              id: '2',
              itemId: '2',
            }, {
              id: '4',
              itemId: '1',
            }]
          );
        });
      }))),
      reset: jest.fn(),
    },
  };
  const defaultTestProps = {
    open: false,
    onClose,
    onRowClick,
    instanceId: testInstanceId,
    title: testTitle,
    mutator: testMutator,
  };

  afterEach(() => {
    Modal.mockClear();
    MultiColumnList.mockClear();
    Pane.mockClear();
    Paneset.mockClear();
    Loading.mockClear();
    onClose.mockClear();
    testMutator.holdings.GET.mockClear();
    testMutator.holdings.reset.mockClear();
    testMutator.items.GET.mockClear();
    testMutator.items.reset.mockClear();
    testMutator.requests.GET.mockClear();
    testMutator.requests.reset.mockClear();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(<ItemsDialog {...defaultTestProps} />);
    });

    it('should render Modal', () => {
      expect(Modal).toHaveBeenLastCalledWith(
        expect.objectContaining({
          'data-test-move-request-modal': true,
          label: labelIds.selectItem,
          open: false,
          onClose,
          dismissible: true,
        }), {}
      );
    });

    it('should render Paneset', () => {
      expect(Paneset).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 'itemsDialog',
          isRoot: true,
          static: true,
        }), {}
      );
    });

    it('should render Pane', () => {
      expect(Pane).toHaveBeenLastCalledWith(
        expect.objectContaining({
          paneTitle: labelIds.instanceItems,
          paneSub: labelIds.resultCount,
          defaultWidth: 'fill',
        }), {}
      );
    });

    it('should not render Loading', () => {
      expect(Loading).not.toHaveBeenCalled();
    });

    it('should render MultiColumnList', () => {
      expect(MultiColumnList).toHaveBeenLastCalledWith(
        expect.objectContaining({
          id: 'instance-items-list',
          interactive: true,
          ariaLabel: labelIds.instanceItems,
          contentData: [],
          visibleColumns: COLUMN_NAMES,
          columnMapping: COLUMN_MAP,
          columnWidths: COLUMN_WIDTHS,
          formatter,
          maxHeight: MAX_HEIGHT,
          isEmptyMessage: labelIds.instanceItemsNotFound,
          onRowClick,
        }), {}
      );
    });
  });

  describe('when open prop is true', () => {
    beforeEach(() => {
      render(
        <ItemsDialog
          {...defaultTestProps}
          open
        />
      );
    });

    it('should render Modal', () => {
      expect(Modal).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          'data-test-move-request-modal': true,
          label: labelIds.selectItem,
          open: true,
          onClose,
          dismissible: true,
        }), {}
      );
    });

    it('should render Loading when data is being loaded', () => {
      const loading = screen.queryByTestId('loading');

      expect(loading).toBeInTheDocument();
    });

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      });

      it('should hide Loading when data is loaded', () => {
        const loading = screen.queryByTestId('loading');

        expect(loading).not.toBeInTheDocument();
      });

      it('should render MultiColumnList when data is loaded', () => {
        expect(MultiColumnList).toHaveBeenLastCalledWith(
          {
            id: 'instance-items-list',
            interactive: true,
            ariaLabel: labelIds.instanceItems,
            contentData: [{
              id: '2',
              status: {
                name: itemStatusesTranslations[itemStatuses.AVAILABLE],
              },
              requestQueue: 1,
            }, {
              id: '1',
              status: {
                name: itemStatusesTranslations[itemStatuses.IN_PROCESS],
              },
              requestQueue: 2,
            }, {
              id: '3',
              status: {
                name: itemStatusesTranslations[itemStatuses.IN_TRANSIT],
              },
              requestQueue: 0,
            }],
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
    });
  });

  [
    true,
    false,
  ].forEach((isLoading) => {
    describe(`when isLoading is ${isLoading}`, () => {
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
              contentData: [],
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
