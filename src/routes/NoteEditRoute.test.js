import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  historyData,
} from '../../test/jest/fixtures/historyData';
import NoteEditRoute from './NoteEditRoute';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>Request</div>,
}));

const locationData = historyData.location;
const match = {
  params: {
    noteId: 'editNoteRouteID',
  },
  path: 'editPath',
  url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules',
};
const renderNoteEditRoute = (locationProps, historyProps) => render(
  <NoteEditRoute location={locationProps} history={historyProps} match={match} />
);

describe('NoteEditRoute', () => {
  it('should render NoteEditPage when location.state is not empty', () => {
    renderNoteEditRoute(locationData, historyData);

    expect(screen.getByText('NoteEditPage')).toBeInTheDocument();
  });

  it('should render request page when location.state is empty', () => {
    const historyProp = {
      ...historyData,
      location : {
        hash: '',
        pathname: '/users/notes/new',
        search: '',
        state: ''
      },
    };
    const locationProp = historyProp.location;

    renderNoteEditRoute(locationProp, historyProp);

    expect(screen.getByText('Request')).toBeInTheDocument();
  });
});
