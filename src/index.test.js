import { MemoryRouter } from 'react-router-dom';

import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import Requests from './index';

jest.mock('./routes', () => ({
  ...jest.requireActual('./routes'),
  RequestsRoute: () => <h1>RequestsRoute</h1>,
}));

const labelIds = {
  navigation: 'ui-requests.navigation.app',
  keyboardShortcuts: 'ui-requests.appMenu.keyboardShortcuts',
  shortcutModalLabel: 'stripes-components.shortcut.modalLabel',
};
const requestsPath = '/requests';

describe('UI Requests', () => {
  const props = {
    match: {
      path: requestsPath,
      params: {},
    },
    history: {
      push: jest.fn(),
    },
  };

  beforeEach(() => {
    render(
      <MemoryRouter initialEntries={[requestsPath]}>
        <Requests
          {...props}
        />
      </MemoryRouter>
    );
  });

  it('should render RequestsRoute', () => {
    expect(screen.queryByText('RequestsRoute')).toBeInTheDocument();
  });

  it('should render "Request app Search" nav item', () => {
    expect(screen.getByText(labelIds.navigation)).toBeInTheDocument();
  });

  it('should render "Keyboard shortcuts" nav item', () => {
    expect(screen.getByText(labelIds.keyboardShortcuts)).toBeInTheDocument();
  });

  it('should render keyboard shortcuts modal', () => {
    fireEvent.click(screen.getByText(labelIds.keyboardShortcuts));

    expect(screen.getByText(labelIds.shortcutModalLabel)).toBeInTheDocument();
  });

  it('should close keyboard shortcuts modal on clicking close button', () => {
    fireEvent.click(screen.getByText(labelIds.keyboardShortcuts));

    const button = screen.getByLabelText('stripes-components.dismissModal');

    fireEvent.click(button);

    expect(screen.queryByText('stripes-components.shortcut.modalLabel')).not.toBeInTheDocument();
  });

  it('should focus on search field', () => {
    const requestAppLink = screen.getByText(labelIds.navigation);
    const elementMock = {
      focus: jest.fn(),
    };

    jest.spyOn(document, 'getElementById').mockReturnValueOnce(elementMock);

    fireEvent.click(requestAppLink);

    expect(elementMock.focus).toHaveBeenCalled();
  });

  it('should redirect to request home page', () => {
    const requestAppLink = screen.getByText(labelIds.navigation);
    const requestAppHomeRoute = '/requests?filters=&sort=requestDate';
    const elementMock = null;

    jest.spyOn(document, 'getElementById').mockReturnValueOnce(elementMock);

    fireEvent.click(requestAppLink);

    expect(props.history.push).toHaveBeenCalledWith(requestAppHomeRoute);
  });
});
