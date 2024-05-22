import moment from 'moment-timezone';

import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';

import ViewRequest, {
  isActionMenuVisible,
} from './ViewRequest';
import RequestForm from './RequestForm';
import {
  INVALID_REQUEST_HARDCODED_ID,
  requestStatuses,
  REQUEST_LEVEL_TYPES,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
} from './constants';
import {
  duplicateRecordShortcut,
  editRecordShortcut,
} from '../test/jest/helpers/shortcuts';

jest.mock('./RequestForm', () => jest.fn(() => null));
jest.mock('./MoveRequestManager', () => jest.fn(() => null));
jest.mock('./ItemDetail', () => jest.fn(() => null));
jest.mock('./UserDetail', () => jest.fn(() => null));
jest.mock('./CancelRequestDialog', () => jest.fn(() => null));
jest.mock('./PositionLink', () => jest.fn(() => null));
jest.mock('./components/TitleInformation', () => jest.fn(() => null));

describe('ViewRequest', () => {
  const labelIds = {
    duplicateRequest: 'ui-requests.actions.duplicateRequest',
    cancelRequest: 'ui-requests.cancel.cancelRequest',
    edit: 'ui-requests.actions.edit',
    moveRequest: 'ui-requests.actions.moveRequest',
    reorderQueue: 'ui-requests.actions.reorderQueue',
    requestDetailTitle: 'ui-requests.request.detail.title',
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
    optionLists: {
      cancellationReasons: [
        { id: '1' },
        { id: '2' },
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
  const renderViewRequest = (props) => render(
    <CommandList commands={defaultKeyboardShortcuts}>
      <ViewRequest {...props} />
    </CommandList>
  );

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

    describe('when work with request editing', () => {
      beforeAll(() => {
        mockedLocation.search = '?layer=edit';
      });

      it('should set "createTitleLevelRequest" to false when try to edit existed request', () => {
        const expectedResult = {
          initialValues : {
            requestExpirationDate: null,
            holdShelfExpirationDate: mockedRequest.holdShelfExpirationDate,
            holdShelfExpirationTime: moment(mockedRequest.holdShelfExpirationDate).format('HH:mm'),
            createTitleLevelRequest: false,
            ...mockedRequest,
          },
        };

        expect(RequestForm).toHaveBeenCalledWith(expect.objectContaining(expectedResult), {});
      });
    });

    describe('when not working with request editing', () => {
      beforeAll(() => {
        mockedLocation.search = null;
      });

      describe('when current request is closed', () => {
        describe('request is valid', () => {
          describe('TLR in enabled', () => {
            beforeAll(() => {
              mockedConfig.records[0].value = {
                titleLevelRequestsFeatureEnabled: true,
              };
            });

            it('should render "Duplicate" button', () => {
              expect(screen.getByText(labelIds.duplicateRequest)).toBeInTheDocument();
            });
          });

          describe('TLR in disabled', () => {
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

  describe('isActionMenuVisible', () => {
    let stripes = {
      hasPerm: () => true,
    };

    it('should return false when isEcsTlrSecondaryRequest true', () => {
      expect(isActionMenuVisible(stripes, true, true)).toBeFalsy();
    });

    it('should return true when isDCBTransaction false and all permission true', () => {
      expect(isActionMenuVisible(stripes, false, false)).toBeTruthy();
    });

    it('should return true when isDCBTransaction true and all permission true', () => {
      expect(isActionMenuVisible(stripes, false, true)).toBeTruthy();
    });

    it('should return true when isDCBTransaction false and all permission false', () => {
      stripes = {
        hasPerm: () => false,
      };

      expect(isActionMenuVisible(stripes, false, false)).toBeTruthy();
    });

    it('should return true when isDCBTransaction true and all permission false', () => {
      stripes = {
        hasPerm: () => false,
      };

      expect(isActionMenuVisible(stripes, false, true)).toBeFalsy();
    });
  });
});
