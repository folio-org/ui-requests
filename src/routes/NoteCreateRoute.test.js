import '__mock__/';
import { render, screen } from '@folio/jest-config-stripes/testing-library/react';
import { historyData } from '../../test/jest/fixtures/historyData';
import NoteCreateRoute from './NoteCreateRoute';

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  Redirect: () => <div>Request</div>
}));

const locationData = historyData.location;
const renderNoteCreateRoute = (locationProps, historyProps) => render(
  <NoteCreateRoute location={locationProps} history={historyProps} />
);
describe('NoteCreateRoute', () => {
  it('NoteCreatePage should render when location.state is not empty', () => {
    renderNoteCreateRoute(locationData, historyData);
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
