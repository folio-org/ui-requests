import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import moment from 'moment-timezone';

import '../test/jest/__mock__';

import { Pane } from '@folio/stripes/components';

import { CommandList, defaultKeyboardShortcuts } from '@folio/stripes-components';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';
import { requestStatuses, REQUEST_LEVEL_TYPES } from './constants';
import { duplicateRecordShortcut, openEditShortcut } from '../test/jest/helpers/shortcuts';

jest.mock('@folio/stripes/smart-components', () => ({ ...jest.requireActual('@folio/stripes/smart-components') }), { virtual: true });

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
    editRequest: 'ui-requests.actions.edit',
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
  const mockedLocation = {
    pathname: 'pathname',
    search: null,
  };
  const mockedConfig = {
    records: [
      { value: '{"titleLevelRequestsFeatureEnabled":true}' },
    ],
  };
  const mockedHistory = {
    push: jest.fn(),
  };
  const mockDuplicateRequest = jest.fn();
  const mockOpenEdit = jest.fn();
  const defaultProps = {
    location: mockedLocation,
    history: mockedHistory,
    joinRequest: jest.fn(() => new Promise((resolve) => {
      resolve({ id: 'id' });
    })),
    findResource: jest.fn(),
    mutator: {},
    onClose: jest.fn(),
    onEdit: mockOpenEdit,
    onCloseEdit: jest.fn(),
    onDuplicate: mockDuplicateRequest,
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

    it('should set `createTitleLevelRequest` to false when try to edit existed request', () => {
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

    describe('when current request is closed and TLR in enabled', () => {
      beforeAll(() => {
        mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":true}';
      });

      it('should render `Duplicate` button', () => {
        expect(screen.getByText(labelIds.duplicateRequest)).toBeInTheDocument();
      });
    });

    describe('when current request is closed and TLR in disabled', () => {
      beforeAll(() => {
        mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":false}';
      });

      it('should not render `Duplicate` button', () => {
        expect(screen.queryByText(labelIds.duplicateRequest)).not.toBeInTheDocument();
      });
    });
  });

  describe('When keyboard shortcut keys for', () => {
    beforeAll(() => {
      mockedLocation.search = null;
      mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":true}';
    });
    describe('duplicate pressed', () => {
      beforeAll(() => {
      });
      it('should call onDuplicate function', () => {
        const duplicateButton = screen.queryByText(labelIds.duplicateRequest);
        duplicateRecordShortcut(duplicateButton);
        expect(mockDuplicateRequest).toHaveBeenCalled();
      });
    });

    describe('edit pressed and request status is closed', () => {
      beforeAll(() => {
        mockedConfig.records[0].value = '{"titleLevelRequestsFeatureEnabled":true}';
      });
      it('should not call Edit', () => {
        openEditShortcut(document.body);
        expect(mockOpenEdit).not.toHaveBeenCalled();
      });
    });
  });
});
