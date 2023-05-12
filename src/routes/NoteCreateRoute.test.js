import React from 'react';
import '../../test/jest/__mock__/currencyData.mock';
import '../../test/jest/__mock__/stripesConfig.mock';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteCreateRoute from './NoteCreateRoute';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  NoteCreatePage: (props) => <div><span>NoteCreatePage</span><button type="button" onClick={() => props.renderReferredRecord()}>renderReferredRecord</button></div>,
}));

const history = createMemoryHistory();
const historyData = {
  'length': 42,
  'action': 'PUSH',
  'location': {
    'hash': '',
    'key': '9pb09t',
    'pathname': '/users/notes/new',
    'search': '',
    'state': {
      'entityId': '2205005b-ca51-4a04-87fd-938eefa8f6de',
      'entityName': 'rick, psych',
      'entityType': 'user',
      'referredRecordData': {
        'instanceId': 'testInstanceId',
        'instanceTitle': 'testInstanceTitle',
        'itemBarcode': '90909090',
        'itemId': 'testItemId',
        'holdingsRecordId': 'testHoldingsRecordId',
        'requestCreateDate': '2023-04-05',
        'requesterId': 'testRequesterId',
        'requesterName': 'testRequesterName',
      }
    }
  },
  'createHref': () => {},
  'push': () => {},
  'replace': () => {},
  'go': () => {},
  'goBack': () => {},
  'goForward': () => {},
  'block': () => {},
  'listen': () => {},
};

const locationData = historyData.location;
const renderNoteCreateRoute = (data1, data2) => render(
  <Router history={history}>
    <NoteCreateRoute location={data1} history={data2} />
  </Router>
);
describe('NoteCreateRoute', () => {
  it('NoteCreatePage should render when location.state is not empty', () => {
    renderNoteCreateRoute(locationData, historyData);
    userEvent.click(screen.getByRole('button', { name: 'renderReferredRecord' }));
    expect(screen.getByText('NoteCreatePage'));
  });
});
