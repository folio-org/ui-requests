import '__mock__/';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { historyData } from '../../test/jest/fixtures/historyData';
import NoteViewRoute from './NoteViewRoute';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>Request</div>
}));

const locationData = historyData.location;
const match = {
  params: {
    noteId: 'viewNoteRouteID'
  },
  path: 'viewPath',
  url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules'
};

const renderNoteViewRoute = (locationProps, historyProps) => render(
  <NoteViewRoute location={locationProps} history={historyProps} match={match} />
);
describe('NoteViewRoute', () => {
  it('NoteViewPage should render when location.state is not empty', () => {
    renderNoteViewRoute(locationData, historyData);
    expect(screen.getByText('NoteViewPage')).toBeInTheDocument();
  });
  it('history.replace function to be called when onEdit clicked', () => {
    renderNoteViewRoute(locationData, historyData);
    userEvent.click(screen.getByRole('button', { name: 'onEdit' }));
    expect(historyData.replace).toBeCalled();
  });
  it('Request page should render when location.state is empty', () => {
    const historyProp = {
      ...historyData,
      location : {
        hash: '',
        key: '9pb09t',
        pathname: '/users/notes/new',
        search: '',
        state: ''
      },
    };
    const locationProp = historyProp.location;
    renderNoteViewRoute(locationProp, historyProp);
    expect(screen.getByText('Request')).toBeInTheDocument();
  });
});
