import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';
import moment from 'moment-timezone';

import '../test/jest/__mock__';

import {
  Pane,
} from '@folio/stripes/components';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';
import { requestStatuses, REQUEST_LEVEL_TYPES } from './constants';

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

  beforeEach(() => {
    render(
      <ViewRequest {...defaultProps} />
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
      screen.debug();
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
});
