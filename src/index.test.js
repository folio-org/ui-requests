import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen, fireEvent } from '@testing-library/react';

import '../test/jest/__mock__';

import Requests from './index';

jest.mock('./routes/index', () => ({
  ...jest.requireActual('./routes/index'),
  RequestsRoute: () => <h1>RequestsRoute</h1>,
}));

jest.mock('@folio/stripes/components', () => ({
  ...jest.requireActual('@folio/stripes/components'),
  KeyboardShortcutsModal: () => 'KeyboardShortcutsModal'
}));

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
    expect(screen.getByText('ui-requests.navigation.app')).toBeInTheDocument();
  });

  it('should render "Keyboard shortcuts" nav item', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    expect(screen.getByText('ui-requests.appMenu.keyboardShortcuts')).toBeInTheDocument();
  });

  it('should render keyboard shortcuts modal', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    fireEvent.click(screen.getByText('ui-requests.appMenu.keyboardShortcuts'));
    expect(screen.getByText('stripes-components.shortcut.modalLabel')).toBeInTheDocument();
  });
});
