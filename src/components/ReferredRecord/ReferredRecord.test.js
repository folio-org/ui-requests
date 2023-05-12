import '../../../test/jest/__mock__';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';

import ReferredRecord from './ReferredRecord';

const history = createMemoryHistory();
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

const renderReferredRecord = (prop) => render(
  <Router history={history}>
    <ReferredRecord values={prop} />
  </Router>
);

describe('ReferredRecord', () => {
  it('component should render correctly', () => {
    renderReferredRecord(propsData);
    expect(screen.getByText('ui-requests.notes.entityType.request')).toBeInTheDocument();
    expect(screen.getByText('ui-requests.notes.assigned.for')).toBeInTheDocument();
    expect(screen.getByText('ui-requests.notes.assigned.requester')).toBeInTheDocument();
    expect(screen.getByText('ui-requests.notes.assigned.requestDate')).toBeInTheDocument();
  });
});
