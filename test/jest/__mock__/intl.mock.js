import React from 'react';

jest.mock('react-intl', () => {
  const intl = {
    formatMessage: ({ id }) => id,
    formatDate: (value) => value,
    formatTime: (value) => value,
  };

  return {
    ...jest.requireActual('react-intl'),
    FormattedMessage: jest.fn(({ id, values, children }) => {
      let valuesString = '';

      if (children) {
        return children([id]);
      }

      if (values) {
        Object.keys(values).forEach((key) => {
          valuesString += values[key];
        });
      }

      return (
        <>
          {id}
          {values && <span>{valuesString}</span>}
        </>
      );
    }),
    FormattedTime: jest.fn(({ value, children }) => {
      if (children) {
        return children([value]);
      }

      return value;
    }),
    FormattedDate: jest.fn(({ value, children }) => {
      if (children) {
        return children([value]);
      }

      return value;
    }),
    useIntl: () => intl,
    injectIntl: (Component) => (props) => <Component {...props} intl={intl} />,
  };
});
