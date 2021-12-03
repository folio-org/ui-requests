import React from 'react';
import {
  render,
} from '@testing-library/react';
import moment from 'moment-timezone';

import '../test/jest/__mock__';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';

jest.mock('./RequestForm', () => jest.fn(() => null));
jest.mock('./MoveRequestManager', () => jest.fn(() => null));

describe('ViewRequest', () => {
  const mockedRequest = {
    id: 'testId',
    holdShelfExpirationDate: 'Wed Nov 24 2021 14:38:30',
  };

  const defaultProps = {
    location: {
      pathname: 'pathname',
      search: '?layer=edit',
    },
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
    resources: {
      selectedRequest: {
        hasLoaded: true,
        records: [
          mockedRequest,
        ],
      },
    },
    stripes: {
      hasPerm: jest.fn(),
      connect: jest.fn(),
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
