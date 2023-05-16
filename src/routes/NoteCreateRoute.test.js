import React from 'react';
import '__mock__/';
import { Router } from 'react-router';
import { createMemoryHistory } from 'history';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { historyData } from '../../test/jest/fixtures/historyData';
import NoteCreateRoute from './NoteCreateRoute';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>Request</div>
}));

const history = createMemoryHistory();
const historyDataProp = historyData;
const locationData = historyDataProp.location;
const renderNoteCreateRoute = (locationProps, historyProps) => render(
  <Router history={history}>
    <NoteCreateRoute location={locationProps} history={historyProps} />
  </Router>
);
describe('NoteCreateRoute', () => {
  it('NoteCreatePage should render when location.state is not empty', () => {
    renderNoteCreateRoute(locationData, historyData);
    userEvent.click(screen.getByRole('button', { name: 'renderReferredRecord' }));
    expect(screen.getByText('NoteCreatePage')).toBeInTheDocument();
  });
  it('Request page should render when location.state is empty', () => {
    const historyProps = {
      ...historyData,
      location : {
        hash: '',
        key: '9pb09t',
        pathname: '/users/notes/new',
        search: '',
        state: ''
      },
    };
    const locationProp = historyProps.location;
    renderNoteCreateRoute(locationProp, historyProps);
    expect(screen.getByText('Request')).toBeInTheDocument();
  });
});
