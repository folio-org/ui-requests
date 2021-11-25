import React from 'react';

jest.mock('@folio/stripes/core', () => ({
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
  stripesConnect: jest.fn((component) => component),
  Pluggable: jest.fn(() => null),
}));
