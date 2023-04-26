import React from 'react';
import buildStripes from './stripes.mock';

const mockStripes = buildStripes();

jest.mock('@folio/stripes-core', () => ({
  ...jest.requireActual('@folio/stripes-core'),
  AppContextMenu: ({ children }) => (typeof children === 'function' ? children(jest.fn()) : children),
  IntlConsumer: jest.fn(({ children }) => {
    const intl = {
      formatMessage: jest.fn(({ id }) => id),
    };
    return (
      <div>
        {children(intl)}
      </div>
    );
  }),
  withStripes: Component => props => (
    <Component
      stripes={mockStripes}
      {...props}
    />
  ),
  stripesConnect: Component => props => <Component {...props} />,
  Pluggable: jest.fn(() => null),
  IfPermission: jest.fn(({ children }) => <div>{children}</div>),
  TitleManager: jest.fn(jest.fn(() => null)),
}));
