import '../../../test/jest/__mock__';
import { render, screen } from '@testing-library/react';
import ReferredRecord from './ReferredRecord';

const propsData = {
  instanceId: 'testInstanceId',
  instanceTitle: 'testInstanceTitle',
  itemBarcode: '90909090',
  itemId: 'testItemId',
  holdingsRecordId: 'testHoldingsRecordId',
  requestCreateDate: '2023-04-05',
  requesterId: 'testRequesterId',
  requesterName: 'testRequesterName',
};

const labelIds = {
  entityTypeRequest: 'ui-requests.notes.entityType.request',
  assignedFor: 'ui-requests.notes.assigned.for',
  assignedRequester: 'ui-requests.notes.assigned.requester',
  assignedRequestDate: 'ui-requests.notes.assigned.requestDate'
};

const renderReferredRecord = (prop) => render(<ReferredRecord values={prop} />);

describe('ReferredRecord', () => {
  beforeEach(() => renderReferredRecord(propsData));

  it('entityType.request should render', () => {
    expect(screen.getByText(labelIds.entityTypeRequest)).toBeInTheDocument();
  });

  it('assigned.for should render', () => {
    expect(screen.getByText(labelIds.assignedFor)).toBeInTheDocument();
  });

  it('assigned.requester should render', () => {
    expect(screen.getByText(labelIds.assignedRequester)).toBeInTheDocument();
  });

  it('assigned.requestDate should render', () => {
    expect(screen.getByText(labelIds.assignedRequestDate)).toBeInTheDocument();
  });
});
