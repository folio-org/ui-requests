import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import NoteViewRoute from './NoteViewRoute';
import {
  historyData,
} from '../../test/jest/fixtures/historyData';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>Request</div>,
}));

const locationData = historyData.location;
const match = {
  params: {
    noteId: 'viewNoteRouteID',
  },
  path: 'viewPath',
  url: '{{ env.FOLIO_MD_REGISTRY }}/_/proxy/modules',
};

const renderNoteViewRoute = (locationProps, historyProps) => render(
  <NoteViewRoute
    location={locationProps}
    history={historyProps}
    match={match}
  />
);

describe('NoteViewRoute', () => {
  describe('When location.state is not empty', () => {
    beforeEach(() => {
      renderNoteViewRoute(locationData, historyData);
    });

    it('NoteViewPage should render when location.state is not empty', () => {
      expect(screen.getByText('NoteViewPage')).toBeInTheDocument();
    });

    it('history.replace function to be called when onEdit clicked', async () => {
      await userEvent.click(screen.getByRole('button', { name: 'onEdit' }));

      expect(historyData.replace).toBeCalled();
    });
  });

  it('should render request page when location.state is empty', () => {
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
