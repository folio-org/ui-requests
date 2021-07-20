import React from 'react';

jest.mock('react-router-dom', () => {
  return {
    ...jest.requireActual('react-router-dom'),
    Link: jest.fn(({ to, children }) => (
      <span data-test-link data-test-to={to}>
        {children}
      </span>
    )),
  };
});
