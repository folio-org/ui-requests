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

const renderReferredRecord = (prop) => render(<ReferredRecord values={prop} />);

describe('ReferredRecord', () => {
  it('entityType.request should render', () => {
    renderReferredRecord(propsData);
    expect(screen.getByText('ui-requests.notes.entityType.request')).toBeInTheDocument();
  });
  it('assigned.for should render', () => {
    renderReferredRecord(propsData);
    expect(screen.getByText('ui-requests.notes.assigned.for')).toBeInTheDocument();
  });
  it('assigned.requester should render', () => {
    renderReferredRecord(propsData);
    expect(screen.getByText('ui-requests.notes.assigned.requester')).toBeInTheDocument();
  });
  it('assigned.requestDate should render', () => {
    renderReferredRecord(propsData);
    expect(screen.getByText('ui-requests.notes.assigned.requestDate')).toBeInTheDocument();
  });
});
