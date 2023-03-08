import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';

import '../test/jest/__mock__';

import Requests from './index';

jest.mock('./routes/index', () => ({
  ...jest.requireActual('./routes/index'),
  RequestsRoute: () => <h1>RequestsRoute</h1>,
}));

const labelIds = {
  navigation: 'ui-requests.navigation.app',
  keyboardShortcuts: 'ui-requests.appMenu.keyboardShortcuts',
  shortcutMvodalLabel: 'stripes-components.shortcut.modalLabel',
};

describe('UI Requests', () => {
  const renderRequest = () => {
    const component = (
      <Router>
        <Requests
          match={{ path: '/requests', params: {}, isExact: true, url: '/requests' }}
        />
      </Router>
    );

    return render(component);
  };

  it('should render', () => {
    expect(renderRequest()).toBeDefined();
  });

  it('should render RequestsRoute', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    expect(screen.getByText('RequestsRoute')).toBeInTheDocument();
  });

  it('should render "Request app Search" nav item', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    expect(screen.getByText(labelIds.navigation)).toBeInTheDocument();
  });

  it('should render "Keyboard shortcuts" nav item', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    expect(screen.getByText(labelIds.keyboardShortcuts)).toBeInTheDocument();
  });

  it('should render keyboard shortcuts modal', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    fireEvent.click(screen.getByText(labelIds.keyboardShortcuts));
    expect(screen.getByText(labelIds.shortcutMvodalLabel)).toBeInTheDocument();
  });

  it('should close keyboard shortcuts modal on clicking close button', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    fireEvent.click(screen.getByText(labelIds.keyboardShortcuts));
    const button = screen.getByRole('button', { name: /stripes-components.dismissModal/i });
    fireEvent.click(button);
    expect(screen.queryByText('stripes-components.shortcut.modalLabel')).not.toBeInTheDocument();
  });
});
