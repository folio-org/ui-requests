import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render, screen } from '@testing-library/react';

import '../test/jest/__mock__';

import Requests from './index';

const renderRequest = () => {
  const component = (
    <Router>
      <Requests
        match={{ path: 'requests', params: {}, isExact: true, url: '/requests' }}
      />
    </Router>
  );

  return render(component);
};

describe('UI Requests', () => {
  it('should render', () => {
    screen.debug();
    expect(renderRequest()).toBeDefined();
  });
});
