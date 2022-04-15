import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import '../test/jest/__mock__';

import Requests from './index';

jest.mock('./routes/index', () => ({
  ...jest.requireActual('./routes/index'),
  RequestsRoute: () => <h1>RequestsRoute</h1>,
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
    screen.debug();
  });

  it('should render RequestsRoute', () => {
    window.history.pushState({}, '', '/requests');

    renderRequest();
    expect(screen.getByText('RequestsRoute')).toBeInTheDocument();
  });
});