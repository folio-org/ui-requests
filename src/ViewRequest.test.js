import React from 'react';

import {
  render,
  screen,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  CommandList,
  defaultKeyboardShortcuts,
  Icon,
  PaneHeaderIconButton,
  dayjs,
} from '@folio/stripes/components';
import { checkIfUserInCentralTenant } from '@folio/stripes/core';

import ViewRequest, {
  isAnyActionButtonVisible,
  shouldHideMoveAndDuplicate,
} from './ViewRequest';
import RequestForm from './RequestForm';
import MoveRequestManager from './MoveRequestManager';
import CancelRequestDialog from './CancelRequestDialog';
import UserDetail from './UserDetail';
import ItemDetail from './ItemDetail';
import {
  INVALID_REQUEST_HARDCODED_ID,
  requestStatuses,
  REQUEST_LEVEL_TYPES,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
  REQUEST_LAYERS,
  fulfillmentTypeMap,
} from './constants';
import {
  isProxyFunctionalityAvailable,
  toUserAddress,
} from './utils';
import {
  duplicateRecordShortcut,
  editRecordShortcut,
} from '../test/jest/helpers/shortcuts';

const testIds = {
  requestForm: 'requestForm',
  moveRequestManager: 'moveRequestManager',
  cancelRequestButton: 'cancelRequestButton',
  saveRequestButton: 'saveRequestButton',
  moveRequestButton: 'moveRequestButton',
  cancelMoveButton: 'cancelMoveButton',
};
const updatedRecordRequester = {
  requester: {
    personal: {
      firstName: 'firstName',
    },
  },
};
const requestQueueUrl = 'requestQueueUrl/';

jest.mock('./RequestForm', () => jest.fn(() => null));
jest.mock('./MoveRequestManager', () => jest.fn(({
  onMove,
  onCancelMove,
}) => {
  return (
    <div data-testid={testIds.moveRequestManager}>
      <button
        type="button"
        data-testid={testIds.moveRequestButton}
        onClick={onMove}
      >
        Move
      </button>
      <button
        type="button"
        data-testid={testIds.cancelMoveButton}
        onClick={onCancelMove}
      >
        Cancel
      </button>
    </div>
  );
}));
jest.mock('./ItemDetail', () => jest.fn(() => null));
jest.mock('./UserDetail', () => jest.fn(() => null));
jest.mock('./CancelRequestDialog', () => jest.fn(() => null));
jest.mock('./PositionLink', () => jest.fn(() => null));
jest.mock('./components/TitleInformation', () => jest.fn(() => null));
jest.mock('./RequestFormContainer', () => jest.fn(({
  onSubmit,
  onCancelRequest,
}) => {
  const handleSubmit = () => {
    onSubmit(updatedRecordRequester);
  };
  const cancelRequest = () => {
    onCancelRequest({});
  };

  return (
    <>
      <form
        data-testid={testIds.requestForm}
        onSubmit={handleSubmit}
      >
        <button
          type="button"
          data-testid={testIds.cancelRequestButton}
          onClick={cancelRequest}
        >
          Cancel
        </button>
        <button
          type="submit"
          data-testid={testIds.saveRequestButton}
          onClick={handleSubmit}
        >
          Save
        </button>
      </form>
    </>
  );
}));
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  toUserAddress: jest.fn(),
  isProxyFunctionalityAvailable: jest.fn(() => true),
}));
jest.mock('./routes/urls', () => ({
  requestQueueView: jest.fn(() => requestQueueUrl),
}));

describe('ViewRequest', () => {
  const labelIds = {
    duplicateRequest: 'ui-requests.actions.duplicateRequest',
    cancelRequest: 'ui-requests.cancel.cancelRequest',
    edit: 'ui-requests.actions.edit',
    moveRequest: 'ui-requests.actions.moveRequest',
    reorderQueue: 'ui-requests.actions.reorderQueue',
    requestDetailTitle: 'ui-requests.request.detail.title',
    showTags: 'ui-requests.showTags',
    noItemInformation: 'ui-requests.item.noInformation',
    cancellationReason: 'ui-requests.cancellationReason',
    cancellationAdditionalInformation: 'ui-requests.cancellationAdditionalInformation',
  };
  const mockedRequest = {
    instance: {
      title: 'Title',
    },
    item: {
      barcode: 'barcode',
    },
    id: 'testId',
    holdShelfExpirationDate: 'Wed Nov 24 2021 14:38:30',
    requestLevel: REQUEST_LEVEL_TYPES.TITLE,
    status: requestStatuses.CANCELLED,
    pickupServicePointId: 'servicePoint',
    metadata: {
      createdDate: 'createdDate',
    },
    requester: {
      id: 'requesterId',
    },
    proxy: {
      id: 'proxyUserId',
    },
    proxyUserId: 'proxyUserId',
  };
  const mockedRequestWithDCBUser = {
    ...mockedRequest,
    requester: {
      personal: {
        lastName: 'DcbSystem',
      }
    }
  };
  const mockedRequestWithVirtualItem = {
    ...mockedRequest,
    instanceId: DCB_INSTANCE_ID,
    holdingsRecordId: DCB_HOLDINGS_RECORD_ID,
  };
  const mockedLocation = {
    pathname: 'pathname',
    search: null,
  };
  const mockedConfig = {
    records: [
      {
        value: {
          titleLevelRequestsFeatureEnabled: true,
        },
      }
    ],
  };
  const defaultProps = {
    location: mockedLocation,
    history: {
      push: jest.fn(),
    },
    joinRequest: jest.fn(() => new Promise((resolve) => {
      resolve({ id: 'id' });
    })),
    findResource: jest.fn(),
    mutator: {},
    onClose: jest.fn(),
    onCloseEdit: jest.fn(),
    buildRecordsForHoldsShelfReport: jest.fn(),
    patronGroups: [
      {
        id: 'groupId',
        name: 'groupName',
      }
    ],
    optionLists: {
      cancellationReasons: [
        {
          id: 'id_1',
          name: 'name_1',
        },
        {
          id: 'id_2',
          name: 'name_2',
        },
      ],
      servicePoints: [
        { id: 'servicePoint' },
      ],
    },
    parentResources: {
      configs: mockedConfig,
    },
    resources: {
      selectedRequest: {
        hasLoaded: true,
        records: [
          mockedRequest,
        ],
      },
    },
    stripes: {
      hasPerm: jest.fn(() => true),
      hasInterface: jest.fn(() => true),
      connect: jest.fn((component) => component),
      logger: {
        log: jest.fn(),
      },
    },
    match: {
      params: {
        id: 'testId',
      },
    },
    isEcsTlrSettingEnabled: false,
    isEcsTlrSettingReceived: true,
    onDuplicate: jest.fn(),
    onEdit: jest.fn(),
  };
  const openRequest = {
    ...mockedRequest,
    fulfillmentPreference: fulfillmentTypeMap.HOLD_SHELF,
    status: requestStatuses.NOT_YET_FILLED,
  };
  const defaultDCBLendingProps = {
    ...defaultProps,
    resources: {
      selectedRequest: {
        hasLoaded: true,
        records: [
          mockedRequestWithDCBUser,
        ],
      },
    }
  };
  const defaultDCBBorrowingProps = {
    ...defaultProps,
    resources: {
      selectedRequest: {
        hasLoaded: true,
        records: [
          mockedRequestWithVirtualItem,
        ],
      },
    }
  };

  dayjs.tz = () => ({
    format: jest.fn(),
  });

  const renderViewRequest = (props) => render(
    <CommandList commands={defaultKeyboardShortcuts}>
      <ViewRequest {...props} />
    </CommandList>
  );
  checkIfUserInCentralTenant.mockReturnValue(true);

  describe('Non DCB Transactions', () => {
    beforeEach(() => {
      renderViewRequest(defaultProps);
    });

    afterEach(() => {
      RequestForm.mockClear();
    });

    it('should render request detail title', () => {
      expect(screen.getByText(labelIds.requestDetailTitle)).toBeInTheDocument();
    });

    describe('when not working with request editing', () => {
      beforeAll(() => {
        mockedLocation.search = null;
      });

      describe('when current request is closed', () => {
        describe('request is valid', () => {
          describe('TLR is enabled', () => {
            beforeAll(() => {
              mockedConfig.records[0].value = {
                titleLevelRequestsFeatureEnabled: true,
              };
            });

            it('should render "Duplicate" button', () => {
              expect(screen.getByText(labelIds.duplicateRequest)).toBeInTheDocument();
            });

            it('should trigger "onDuplicate"', async () => {
              const duplicateButton = screen.getByText(labelIds.duplicateRequest);

              await userEvent.click(duplicateButton);

              expect(defaultProps.onDuplicate).toHaveBeenCalledWith(defaultProps.resources.selectedRequest.records[0]);
            });
          });

          describe('TLR is disabled', () => {
            beforeAll(() => {
              mockedConfig.records[0].value = {
                titleLevelRequestsFeatureEnabled: false,
              };
            });

            it('should not render "Duplicate" button', () => {
              expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
            });
          });
        });

        describe('request is not valid', () => {
          const closedInvalidRequest = {
            ...mockedRequest,
            instanceId: INVALID_REQUEST_HARDCODED_ID,
            holdingsRecordId: INVALID_REQUEST_HARDCODED_ID,
          };
          const props = {
            ...defaultProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [closedInvalidRequest],
              },
            },
          };

          beforeEach(() => {
            renderViewRequest(props);
          });

          it('should not render "Duplicate" button', () => {
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
          });
        });
      });

      describe('when current request is open', () => {
        const openValidRequest = {
          ...mockedRequest,
          status: requestStatuses.NOT_YET_FILLED,
        };

        describe('when request is valid', () => {
          const props = {
            ...defaultProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [openValidRequest],
              },
            },
          };

          beforeEach(() => {
            renderViewRequest(props);
          });

          it('actions menu should show all possible actions', () => {
            expect(screen.getByText(labelIds.cancelRequest)).toBeInTheDocument();
            expect(screen.getByText(labelIds.edit)).toBeInTheDocument();
            expect(screen.getByText(labelIds.duplicateRequest)).toBeInTheDocument();
            expect(screen.getByText(labelIds.moveRequest)).toBeInTheDocument();
            expect(screen.getByText(labelIds.reorderQueue)).toBeInTheDocument();
          });
        });

        describe('when request is invalid', () => {
          const props = {
            ...defaultProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...openValidRequest,
                    instanceId: INVALID_REQUEST_HARDCODED_ID,
                    holdingsRecordId: INVALID_REQUEST_HARDCODED_ID,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            renderViewRequest(props);
          });

          it('should render action menu with only "Cancel request" button', () => {
            expect(screen.getByText(labelIds.cancelRequest)).toBeInTheDocument();
            expect(screen.queryByText(labelIds.edit)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.moveRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.reorderQueue)).not.toBeInTheDocument();
          });
        });
      });
    });

    describe('Keyboard shortcuts', () => {
      it('should check permission when duplicating', () => {
        duplicateRecordShortcut(document.body);
        expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
      });

      it('should check permission on edit', () => {
        editRecordShortcut(document.body);
        expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
      });
    });
  });

  describe('DCB Transactions', () => {
    afterEach(() => {
      RequestForm.mockClear();
    });

    describe('when virtual patron-DCB Lending flow', () => {
      describe('when in request detail', () => {
        beforeAll(() => {
          mockedLocation.search = null;
        });

        describe("when current lending request status starts with 'Closed'", () => {
          const closedStatuses = [requestStatuses.FILLED, requestStatuses.CANCELLED, requestStatuses.PICKUP_EXPIRED, requestStatuses.UNFILLED];
          const closedRequests = closedStatuses.map(cStatus => ({
            ...mockedRequestWithDCBUser,
            status: cStatus,
          }));
          const closedRequestsProps = closedRequests.map(cReq => ({
            ...defaultDCBLendingProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...defaultDCBLendingProps.resources.selectedRequest.records,
                    ...cReq,
                  },
                ],
              },
            }
          }));

          closedRequestsProps.forEach(props => {
            it(`should not render action menu when request status is ${props?.resources?.selectedRequest?.records[0]?.status}`, () => {
              renderViewRequest(props);
              expect(screen.queryByRole('button', { name: 'Actions' })).toBeNull();
            });
          });
        });

        describe('when current lending request is open', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.NOT_YET_FILLED,
          };
          const props = {
            ...defaultDCBLendingProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...defaultDCBLendingProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            renderViewRequest(props);
          });

          it('should render action menu with only "Cancel request" button', () => {
            expect(screen.getByText(labelIds.cancelRequest)).toBeInTheDocument();
            expect(screen.queryByText(labelIds.edit)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.moveRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.reorderQueue)).not.toBeInTheDocument();
          });
        });
      });

      describe('Keyboard shortcuts', () => {
        beforeEach(() => {
          renderViewRequest(defaultDCBLendingProps);
        });
        it('should check permission when duplicating', () => {
          duplicateRecordShortcut(document.body);
          expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
        });

        it('should check permission on edit', () => {
          editRecordShortcut(document.body);
          expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
        });
      });
    });

    describe('when virtual item-DCB Borrowing flow', () => {
      describe('when in request detail', () => {
        beforeAll(() => {
          mockedLocation.search = null;
        });

        describe('when current borrowing request status starts with "Closed"', () => {
          const closedStatuses = [requestStatuses.FILLED, requestStatuses.CANCELLED, requestStatuses.PICKUP_EXPIRED, requestStatuses.UNFILLED];
          const closedRequests = closedStatuses.map(cStatus => ({
            ...mockedRequestWithDCBUser,
            status: cStatus,
          }));
          const closedRequestsProps = closedRequests.map(cReq => ({
            ...defaultDCBBorrowingProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...defaultDCBBorrowingProps.resources.selectedRequest.records,
                    ...cReq,
                  },
                ],
              },
            }
          }));

          closedRequestsProps.forEach(props => {
            it(`should not render action menu when request status is ${props?.resources?.selectedRequest?.records[0]?.status}`, () => {
              renderViewRequest(props);
              expect(screen.queryByRole('button', { name: 'Actions' })).toBeNull();
            });
          });
        });

        describe('when current borrowing request is open', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.NOT_YET_FILLED,
          };
          const props = {
            ...defaultDCBBorrowingProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...defaultDCBBorrowingProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            renderViewRequest(props);
          });

          it('should render action menu with only "Cancel request" button', () => {
            expect(screen.getByText(labelIds.cancelRequest)).toBeInTheDocument();
            expect(screen.queryByText(labelIds.edit)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.moveRequest)).not.toBeInTheDocument();
            expect(screen.queryByText(labelIds.reorderQueue)).not.toBeInTheDocument();
          });
        });
      });

      describe('Keyboard shortcuts', () => {
        beforeEach(() => {
          renderViewRequest(defaultDCBBorrowingProps);
        });
        it('should check permission when duplicating', () => {
          duplicateRecordShortcut(document.body);
          expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
        });

        it('should check permission on edit', () => {
          editRecordShortcut(document.body);
          expect(defaultProps.stripes.hasPerm).toHaveBeenCalled();
        });
      });
    });
  });

  describe('Component updating', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('When new request is loaded', () => {
      const newProps = {
        ...defaultProps,
        resources: {
          selectedRequest: {
            hasLoaded: true,
            records: [
              {
                ...mockedRequest,
                instance: {
                  title: 'instanceTitle',
                },
                item: {
                  barcode: 'itemBarcode',
                },
                id: 'id',
              },
            ],
          },
        },
        parentResources: {
          configs: {
            records: [
              {
                value: {
                  test: 1,
                  titleLevelRequestsFeatureEnabled: false,
                },
              }
            ],
          },
        },
      };

      beforeEach(() => {
        const { rerender } = render(<ViewRequest {...defaultProps} />);

        rerender(<ViewRequest {...newProps} />);
      });

      it('should trigger "joinRequest"', () => {
        expect(defaultProps.joinRequest).toHaveBeenCalled();
      });
    });

    describe('When new request is loading', () => {
      const newProps = {
        ...defaultProps,
        resources: {
          selectedRequest: {
            hasLoaded: false,
            records: [mockedRequest],
          },
        },
      };

      beforeEach(() => {
        const { rerender } = render(<ViewRequest {...defaultProps} />);

        rerender(<ViewRequest {...newProps} />);
      });

      it('should not trigger "joinRequest"', () => {
        expect(defaultProps.joinRequest).toHaveBeenCalled();
      });
    });
  });

  describe('Request updating', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('When proxy functionality available', () => {
      const props = {
        ...defaultProps,
        mutator: {
          selectedRequest: {
            PUT: jest.fn(() => Promise.resolve({})),
          },
        },
        location: {
          search: '?layer=edit',
          layer: REQUEST_LAYERS.EDIT,
        },
      };
      const sendCalloutMock = jest.fn();

      beforeEach(() => {
        jest.spyOn(React, 'createRef').mockReturnValue({
          current: {
            sendCallout: sendCalloutMock,
          },
        });
        render(<ViewRequest {...props} />);
      });

      it('should send correct data for record updating', async () => {
        const saveButton = screen.getByTestId(testIds.saveRequestButton);
        const dataToSubmit = {
          proxy: mockedRequest.proxy,
          proxyUserId: mockedRequest.proxyUserId,
          id: mockedRequest.id,
          instance: mockedRequest.instance,
          item: mockedRequest.item,
          metadata: mockedRequest.metadata,
          pickupServicePointId: mockedRequest.pickupServicePointId,
          requestLevel: mockedRequest.requestLevel,
          status: mockedRequest.status,
          holdShelfExpirationDate: mockedRequest.holdShelfExpirationDate,
          requester: updatedRecordRequester.requester,
        };

        await userEvent.click(saveButton);

        expect(props.mutator.selectedRequest.PUT).toHaveBeenCalledWith(dataToSubmit);
      });
    });

    describe('When proxy functionality is not available', () => {
      const props = {
        ...defaultProps,
        mutator: {
          selectedRequest: {
            PUT: jest.fn(() => Promise.resolve({})),
          },
        },
        location: {
          search: '?layer=edit',
          layer: REQUEST_LAYERS.EDIT,
        },
      };
      const sendCalloutMock = jest.fn();

      beforeEach(() => {
        isProxyFunctionalityAvailable.mockReturnValueOnce(false);
        jest.spyOn(React, 'createRef').mockReturnValue({
          current: {
            sendCallout: sendCalloutMock,
          },
        });
        render(<ViewRequest {...props} />);
      });

      it('should send correct data for record updating', async () => {
        const saveButton = screen.getByTestId(testIds.saveRequestButton);
        const dataToSubmit = {
          id: mockedRequest.id,
          instance: mockedRequest.instance,
          status: mockedRequest.status,
          item: mockedRequest.item,
          metadata: mockedRequest.metadata,
          pickupServicePointId: mockedRequest.pickupServicePointId,
          requestLevel: mockedRequest.requestLevel,
          holdShelfExpirationDate: mockedRequest.holdShelfExpirationDate,
          requester: updatedRecordRequester.requester,
        };

        await userEvent.click(saveButton);

        expect(props.mutator.selectedRequest.PUT).toHaveBeenCalledWith(dataToSubmit);
      });
    });

    describe('When error happens', () => {
      const props = {
        ...defaultProps,
        mutator: {
          selectedRequest: {
            PUT: jest.fn(() => Promise.resolve({})),
          },
        },
        location: {
          layer: REQUEST_LAYERS.EDIT,
          search: '?layer=edit',
        },
        onCloseEdit: jest.fn(() => throw new Error('error message')),
      };
      const sendCalloutMock = jest.fn();

      beforeEach(() => {
        jest.spyOn(React, 'createRef').mockReturnValue({
          current: {
            sendCallout: sendCalloutMock,
          },
        });
        render(<ViewRequest {...props} />);
      });

      it('should show error callout', async () => {
        const saveButton = screen.getByTestId(testIds.saveRequestButton);

        userEvent.click(saveButton);

        await waitFor(() => {
          expect(sendCalloutMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
        });
      });
    });
  });

  describe('Request canceling via RequestFormContainer', () => {
    const props = {
      ...defaultProps,
      mutator: {
        selectedRequest: {
          PUT: jest.fn(() => Promise.resolve({})),
        },
      },
      location: {
        search: '?layer=edit',
        layer: REQUEST_LAYERS.EDIT,
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(async () => {
      render(<ViewRequest {...props} />);

      const cancelButton = screen.getByTestId(testIds.cancelRequestButton);

      await userEvent.click(cancelButton);
    });

    it('should send correct data for record canceling', () => {
      expect(props.mutator.selectedRequest.PUT).toHaveBeenCalledWith(mockedRequest);
    });

    it('should trigger "onCloseEdit"', () => {
      expect(props.onCloseEdit).toHaveBeenCalled();
    });

    it('should trigger "buildRecordsForHoldsShelfReport"', () => {
      expect(props.buildRecordsForHoldsShelfReport).toHaveBeenCalled();
    });
  });

  describe('Request canceling via action menu', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [
            {
              ...defaultProps.resources.selectedRequest.records[0],
              status: requestStatuses.NOT_YET_FILLED,
            },
          ],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger CancelRequestDialog with correct "open" prop', async () => {
      const cancelButton = screen.getByText(labelIds.cancelRequest);
      const expectedProps = {
        open: true,
      };

      CancelRequestDialog.mockClear();
      await userEvent.click(cancelButton);

      expect(CancelRequestDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Request moving', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [openRequest],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(async () => {
      render(<ViewRequest {...props} />);

      const moveRequestButton = screen.getByText(labelIds.moveRequest);

      await userEvent.click(moveRequestButton);
    });

    it('should trigger "MoveRequestManager" with correct props', () => {
      const expectedProps = {
        onMove: expect.any(Function),
        onCancelMove: expect.any(Function),
        request: props.resources.selectedRequest.records[0],
      };

      expect(MoveRequestManager).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should not trigger "MoveRequestManager"', async () => {
      const cancelMoveButton = screen.getByTestId(testIds.cancelMoveButton);

      await userEvent.click(cancelMoveButton);

      const moveRequestManager = screen.queryByTestId(testIds.moveRequestManager);

      expect(moveRequestManager).not.toBeInTheDocument();
    });

    it('should trigger "history.push" after request moving', async () => {
      const moveRequestButton = screen.getByTestId(testIds.moveRequestButton);
      const expectedArgs = [`${requestQueueUrl}${props.location.search}`, { afterMove: true }];

      await userEvent.click(moveRequestButton);

      expect(props.history.push).toHaveBeenCalledWith(...expectedArgs);
    });
  });

  describe('Request reordering', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [openRequest],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger "history.push" after clicking on reorder request button', async () => {
      const reorderQueueButton = screen.getByText(labelIds.reorderQueue);
      const expectedArgs = [
        `${requestQueueUrl}${props.location.search}`,
        { request: props.resources.selectedRequest.records[0] }
      ];

      await userEvent.click(reorderQueueButton);

      expect(props.history.push).toHaveBeenCalledWith(...expectedArgs);
    });
  });

  describe('Request editing', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [openRequest],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger "onEdit" after clicking on edit button', async () => {
      const editButton = screen.getByText(labelIds.edit);

      await userEvent.click(editButton);

      expect(props.onEdit).toHaveBeenCalled();
    });
  });

  describe('Request duplicating', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [openRequest],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger "onDuplicate" after clicking on duplicate button', async () => {
      const duplicateButton = screen.getByText(labelIds.duplicateRequest);

      await userEvent.click(duplicateButton);

      expect(props.onDuplicate).toHaveBeenCalled();
    });
  });

  describe('Detail menu', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [],
        },
      },
      tagsEnabled: true,
      tagsToggle: jest.fn(),
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger "PaneHeaderIconButton" with correct props', () => {
      const expectedProps = {
        icon: 'tag',
        id: 'clickable-show-tags',
        onClick: props.tagsToggle,
        badgeCount: 0,
        ariaLabel: [labelIds.showTags],
        disabled: false,
      };

      expect(PaneHeaderIconButton).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('Item details', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    describe('When item information is provided', () => {
      const props = {
        ...defaultProps,
        resources: {
          selectedRequest: {
            hasLoaded: true,
            records: [{
              ...openRequest,
              requestCount: 1,
              loan: {
                id: 'loanId',
              },
            }],
          },
        },
      };

      beforeEach(() => {
        render(<ViewRequest {...props} />);
      });

      it('should trigger "ItemDetail" with correct props', async () => {
        const request = props.resources.selectedRequest.records[0];
        const expectedProps = {
          request,
          item: request.item,
          loan: request.loan,
          requestCount: request.requestCount,
        };

        expect(ItemDetail).toHaveBeenCalledWith(expectedProps, {});
      });
    });

    describe('When item information is not provided', () => {
      const props = {
        ...defaultProps,
        resources: {
          selectedRequest: {
            hasLoaded: true,
            records: [{
              ...openRequest,
              item: undefined,
            }],
          },
        },
      };

      beforeEach(() => {
        render(<ViewRequest {...props} />);
      });

      it('should render no item information message', () => {
        const noItemInformationMessage = screen.getByText(labelIds.noItemInformation, { exact: false });

        expect(noItemInformationMessage).toBeInTheDocument();
      });
    });
  });

  describe('When cancellation reason is provided', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [{
            ...openRequest,
            cancellationReasonId: defaultProps.optionLists.cancellationReasons[0].id,
          }],
        },
      },
    };

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should render cancellation reason label', () => {
      const cancellationReasonLabel = screen.getByText(labelIds.cancellationReason);

      expect(cancellationReasonLabel).toBeInTheDocument();
    });

    it('should render cancellation reason value', () => {
      const cancellationReasonValue = screen.getByText(defaultProps.optionLists.cancellationReasons[0].name);

      expect(cancellationReasonValue).toBeInTheDocument();
    });
  });

  describe('When cancellation additional information is provided', () => {
    const cancellationAdditionalInformation = 'cancellationAdditionalInformation';
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [{
            ...openRequest,
            cancellationReasonId: defaultProps.optionLists.cancellationReasons[0].id,
            cancellationAdditionalInformation,
          }],
        },
      },
    };

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should render cancellation additional information label', () => {
      const cancellationInformationLabel = screen.getByText(labelIds.cancellationAdditionalInformation);

      expect(cancellationInformationLabel).toBeInTheDocument();
    });

    it('should render cancellation additional information value', () => {
      const cancellationInformationValue = screen.getByText(cancellationAdditionalInformation);

      expect(cancellationInformationValue).toBeInTheDocument();
    });
  });

  describe('When fulfilment preference is delivery', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [{
            ...openRequest,
            fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
            deliveryAddressTypeId: 'deliveryAddressTypeId',
          }],
        },
      },
    };
    const deliveryAddressDetail = 'deliveryAddressDetail';

    beforeEach(() => {
      toUserAddress.mockReturnValueOnce(deliveryAddressDetail);
      render(<ViewRequest {...props} />);
    });

    it('should render "UserDetail" with delivery information', () => {
      const request = props.resources.selectedRequest.records[0];
      const expectedProps = {
        deliveryAddress: deliveryAddressDetail,
        user:request.requester,
        proxy: request.proxy,
        selectedDelivery: true,
        patronGroups: props.patronGroups,
        stripes: props.stripes,
        request,
      };

      expect(UserDetail).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('When fulfilment preference is hold shelf', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [openRequest],
        },
      },
    };

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should render "UserDetail" without delivery information', () => {
      const request = props.resources.selectedRequest.records[0];
      const expectedProps = {
        deliveryAddress: undefined,
        user:request.requester,
        proxy: request.proxy,
        selectedDelivery: false,
        patronGroups: props.patronGroups,
        stripes: props.stripes,
        request,
      };

      expect(UserDetail).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Spinner', () => {
    const props = {
      ...defaultProps,
      resources: {
        selectedRequest: {
          hasLoaded: true,
          records: [],
        },
      },
    };

    afterEach(() => {
      jest.clearAllMocks();
    });

    beforeEach(() => {
      render(<ViewRequest {...props} />);
    });

    it('should trigger spinner "Icon" with correct props', () => {
      const expectedProps = {
        icon: 'spinner-ellipsis',
        width: '100px',
      };

      expect(Icon).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('isAnyActionButtonVisible', () => {
    describe('When visibility conditions are provided', () => {
      it('should return true', () => {
        expect(isAnyActionButtonVisible([true, false])).toBe(true);
      });
    });

    describe('When visibility conditions are not provided', () => {
      it('should return false', () => {
        expect(isAnyActionButtonVisible()).toBe(false);
      });
    });
  });

  describe('shouldHideMoveAndDuplicate', () => {
    const stripes = {
      hasInterface: () => true,
    };

    it('should return true for primary request', () => {
      expect(shouldHideMoveAndDuplicate(stripes, true)).toBe(true);
    });

    it('should return true if ecs tlr enabled', () => {
      expect(shouldHideMoveAndDuplicate(stripes, false, true, true)).toBe(true);
    });

    it('should return true if settings are not received', () => {
      expect(shouldHideMoveAndDuplicate(stripes, false, false, true)).toBe(true);
    });

    it('should return false', () => {
      expect(shouldHideMoveAndDuplicate(stripes, false, true, false)).toBe(false);
    });

    it('should return true for intermediate request in central tenant', () => {
      expect(shouldHideMoveAndDuplicate(stripes, false, false, false, true)).toBe(true);
    });
  });
});
