import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import ReferredRecord from './ReferredRecord';

const propsData = {
  instanceId: 'testInstanceId',
  instanceTitle: 'testInstanceTitle',
  itemBarcode: '90909090',
  itemId: 'testItemId',
  holdingsRecordId: 'testHoldingsRecordId',
  requestCreateDate: '2023-04-05',
  request: {
    requesterId: 'testRequesterId',
    requester: {
      lastName: 'testRequesterName',
    }
  },
};
const labelIds = {
  entityTypeRequest: 'ui-requests.notes.entityType.request',
  assignedFor: 'ui-requests.notes.assigned.for',
  assignedRequester: 'ui-requests.notes.assigned.requester',
  assignedRequestDate: 'ui-requests.notes.assigned.requestDate',
};
const renderReferredRecord = (prop) => render(<ReferredRecord values={prop} />);

describe('ReferredRecord', () => {
  beforeEach(() => renderReferredRecord(propsData));

  it('should render entityType.request', () => {
    expect(screen.getByText(labelIds.entityTypeRequest)).toBeInTheDocument();
  });

  it('should render assigned.for', () => {
    expect(screen.getByText(labelIds.assignedFor)).toBeInTheDocument();
  });

  it('should render assigned.requester', () => {
    expect(screen.getByText(labelIds.assignedRequester)).toBeInTheDocument();
  });

  it('should render assigned.requestDate', () => {
    expect(screen.getByText(labelIds.assignedRequestDate)).toBeInTheDocument();
  });
});
