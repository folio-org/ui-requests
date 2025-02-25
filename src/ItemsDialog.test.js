import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Modal,
  MultiColumnList,
  Pane,
  Paneset,
  NoValue,
} from '@folio/stripes/components';

import {
  itemStatuses,
  requestableItemStatuses,
} from './constants';
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

const testIds = {
  loading: 'loading',
};
const labelIds = {
  selectItem: 'ui-requests.items.selectItem',
  instanceItems: 'ui-requests.items.instanceItems',
  resultCount: 'ui-requests.resultCount',
  instanceItemsNotFound: 'ui-requests.items.instanceItems.notFound',
};

describe('ItemsDialog', () => {
  const onClose = jest.fn();
  const onRowClick = jest.fn();
  const testTitle = 'testTitle';
  const testInstanceId = 'testInstanceId';
  const testMutator = {
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
      expect(Modal).toHaveBeenCalledWith(
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
      const loading = screen.queryByTestId(testIds.loading);

      expect(loading).toBeInTheDocument();
    });

    describe('when data is loaded', () => {
      beforeEach(async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
      });

      it('should hide Loading when data is loaded', () => {
        const loading = screen.queryByTestId(testIds.loading);

        expect(loading).not.toBeInTheDocument();
      });

      it('should render MultiColumnList when data is loaded', () => {
        expect(MultiColumnList).toHaveBeenLastCalledWith(
          {
            id: 'instance-items-list',
            interactive: true,
            contentData: [{
              id: '2',
              status: {
                name: itemStatuses.AVAILABLE,
              },
              requestQueue: 1,
            }, {
              id: '1',
              status: {
                name: itemStatuses.IN_PROCESS,
              },
              requestQueue: 2,
            }, {
              id: '3',
              status: {
                name: itemStatuses.IN_TRANSIT,
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

      describe('when "items" response contains non-requestable items', () => {
        const getProcessedItem = (status) => ({
          id: status,
          requestQueue: 0,
          status: {
            name: status,
          },
        });
        const allItemStatuses = Object.values(itemStatuses);
        const newMutator = {
          items: {
            GET: jest.fn(() => (new Promise((resolve) => {
              setTimeout(() => {
                resolve(
                  allItemStatuses.map(status => ({
                    id: status,
                    status: {
                      name: status,
                    },
                  })),
                );
              });
            }))),
            reset: jest.fn(),
          },
          requests: {
            GET: jest.fn(() => (new Promise((resolve) => {
              setTimeout(() => {
                resolve([]);
              });
            }))),
            reset: jest.fn(),
          },
        };

        describe('within "move request" action', () => {
          beforeEach(async () => {
            render(
              <ItemsDialog
                {...defaultTestProps}
                mutator={newMutator}
                open
                skippedItemId="testSkippedItem"
              />
            );

            await new Promise((resolve) => setTimeout(resolve, 500));
          });

          it('should show only items with requestable statuses', () => {
            const requestableItems = requestableItemStatuses.map(getProcessedItem);

            expect(MultiColumnList).toHaveBeenLastCalledWith(expect.objectContaining({
              contentData: expect.arrayContaining(requestableItems),
            }), {});
          });

          it('should not show items with non-requestable statuses', () => {
            const nonRequestableItems = allItemStatuses.map(status => {
              if (requestableItemStatuses.includes(status)) {
                return null;
              }

              return getProcessedItem(status);
            });

            expect(MultiColumnList).toHaveBeenLastCalledWith(expect.objectContaining({
              contentData: expect.not.arrayContaining(nonRequestableItems),
            }), {});
          });
        });

        describe('within switching from instance-level to item-level request', () => {
          beforeEach(async () => {
            render(
              <ItemsDialog
                {...defaultTestProps}
                mutator={newMutator}
                open
              />
            );

            await new Promise((resolve) => setTimeout(resolve, 500));
          });

          it('should show items with all possible statuses', () => {
            const expectedResult = allItemStatuses.map(getProcessedItem);

            expect(MultiColumnList).toHaveBeenLastCalledWith(expect.objectContaining({
              contentData: expect.arrayContaining(expectedResult),
            }), {});
          });
        });
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

  describe('formatter', () => {
    const item = {
      barcode: 'barcode',
      status: {
        name: 'Aged to lost',
      },
      effectiveLocation: {
        name: 'effective location name',
      },
      materialType: {
        name: 'material type name',
      },
      temporaryLoanType: {
        name: 'temporary loan type name',
      },
      permanentLoanType: {
        name: 'permanent loan type name',
      },
    };

    afterEach(() => {
      NoValue.mockClear();
    });

    describe('barcode', () => {
      it('should return item barcode', () => {
        expect(formatter.barcode(item)).toBe(item.barcode);
      });

      it('should trigger NoValue component', () => {
        render(formatter.barcode({
          ...item,
          barcode: undefined,
        }));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('itemStatus', () => {
      it('should return formatted message', () => {
        expect(formatter.itemStatus(item).props.id).toEqual('ui-requests.item.status.agedToLost');
      });
    });

    describe('location', () => {
      it('should return effective location name', () => {
        expect(formatter.location(item)).toEqual('effective location name');
      });

      it('should trigger NoValue component', () => {
        render(formatter.location({
          ...item,
          effectiveLocation: {},
        }));

        expect(NoValue).toHaveBeenCalled();
      });
    });

    describe('materialType', () => {
      it('should return material type', () => {
        expect(formatter.materialType(item)).toEqual('material type name');
      });
    });

    describe('loanType', () => {
      describe('with temporaryLoanType', () => {
        it('should return temporary loan type name', () => {
          expect(formatter.loanType(item)).toEqual('temporary loan type name');
        });

        it('should trigger NoValue component', () => {
          render(formatter.loanType({
            ...item,
            temporaryLoanType: {
              other: '',
            },
          }));

          expect(NoValue).toHaveBeenCalled();
        });
      });

      describe('without temporaryLoanType', () => {
        it('should return permanent loan type name', () => {
          expect(formatter.loanType({
            ...item,
            temporaryLoanType: false,
          })).toEqual('permanent loan type name');
        });

        it('should trigger NoValue component', () => {
          render(formatter.loanType({
            ...item,
            temporaryLoanType: false,
            permanentLoanType: {
              other: '',
            },
          }));

          expect(NoValue).toHaveBeenCalled();
        });
      });
    });
  });
});
