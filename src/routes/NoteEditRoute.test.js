import React from 'react';
import '../../test/jest/__mock__/currencyData.mock';
import '../../test/jest/__mock__/stripesConfig.mock';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import NoteEditRoute from './NoteEditRoute';

jest.mock('@folio/stripes/smart-components', () => ({
  ...jest.requireActual('@folio/stripes/smart-components'),
  NoteEditPage: (props) => <div><span>NoteEditRoute</span><button type="button" onClick={() => props.renderReferredRecord()}>renderReferredRecord</button></div>,
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
const match = { params: { noteId: 'editNoteRouteID' },
  path: 'editPath',
  url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules' };
const locationData = historyData.location;

const renderNoteEditRoute = (data1, data2) => render(
  <Router history={history}>
    <NoteEditRoute location={data1} history={data2} match={match} />
  </Router>
);
describe('NoteEditRoute', () => {
  it('NoteEditRoute should render when location.state is not empty', () => {
    renderNoteEditRoute(locationData, historyData);
    screen.debug();
    userEvent.click(screen.getByRole('button', { name: 'renderReferredRecord' }));

    expect(screen.getByText('NoteEditRoute'));
  });
  it('Request page should render when location.state is empty', async () => {
    const historyProps = {
      ...historyData,
      'location': {
        'state': '',
        'hash': '',
        'key': '9pb09t',
        'pathname': '/users/notes/new',
        'search': ''
      },
    };
    const locationProp = historyProps.location;
    const { container } = renderNoteEditRoute(locationProp, historyProps);
    expect(container).toBeEmptyDOMElement();
  });
});
