import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import moment from 'moment-timezone';

import '../test/jest/__mock__';

import {
  Pane,
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';

import ViewRequest from './ViewRequest';
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
Pane.mockImplementation(({ children, actionMenu }) => (
  <div>
    {children}
    {actionMenu({ onToggle: jest.fn() })}
  </div>
));

describe('ViewRequest', () => {
  const labelIds = {
    duplicateRequest: 'ui-requests.actions.duplicateRequest',
    cancelRequest: 'ui-requests.cancel.cancelRequest',
    edit: 'ui-requests.actions.edit',
    moveRequest: 'ui-requests.actions.moveRequest',
    reorderQueue: 'ui-requests.actions.reorderQueue',
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
      { value: '{"titleLevelRequestsFeatureEnabled":true}' },
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

  describe('Non DCB Transactions', () => {
    beforeEach(() => {
      render(
        <CommandList commands={defaultKeyboardShortcuts}>
          <ViewRequest {...defaultProps} />
        </CommandList>
      );
    });

    afterEach(() => {
      RequestForm.mockClear();
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
              mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":true}';
            });

            it('should render "Duplicate" button', () => {
              expect(screen.getByText(labelIds.duplicateRequest)).toBeInTheDocument();
            });
          });

          describe('TLR in disabled', () => {
            beforeAll(() => {
              mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":false}';
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
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
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
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
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
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
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
      const alteredProps = {
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

      describe('when in request detail', () => {
        beforeAll(() => {
          mockedLocation.search = null;
        });

        describe('when current lending request is closed', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.FILLED,
          };

          const props = {
            ...alteredProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...alteredProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
          });

          it('should not render "Duplicate" button', () => {
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
          });
        });

        describe('when current lending request is open', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.NOT_YET_FILLED,
          };

          const props = {
            ...alteredProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...alteredProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
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
          render(
            <CommandList commands={defaultKeyboardShortcuts}>
              <ViewRequest {...alteredProps} />
            </CommandList>
          );
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
      const alteredProps = {
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

      describe('when in request detail', () => {
        beforeAll(() => {
          mockedLocation.search = null;
        });

        describe('when current lending request is closed', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.FILLED,
          };

          const props = {
            ...alteredProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...alteredProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
          });

          it('should not render "Duplicate" button', () => {
            expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
          });
        });

        describe('when current lending request is open', () => {
          const openValidRequest = {
            ...mockedRequestWithDCBUser,
            status: requestStatuses.NOT_YET_FILLED,
          };

          const props = {
            ...alteredProps,
            resources: {
              selectedRequest: {
                hasLoaded: true,
                records: [
                  {
                    ...alteredProps.resources.selectedRequest.records,
                    ...openValidRequest,
                  },
                ],
              },
            },
          };

          beforeEach(() => {
            render(
              <CommandList commands={defaultKeyboardShortcuts}>
                <ViewRequest {...props} />
              </CommandList>
            );
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
          render(
            <CommandList commands={defaultKeyboardShortcuts}>
              <ViewRequest {...alteredProps} />
            </CommandList>
          );
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
});
