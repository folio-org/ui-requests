import React from 'react';
import { FormattedMessage } from 'react-intl';

import css from './Asterisk.css';

const Asterisk = () => (
  <FormattedMessage id="ui-requests.required">
    {required => (
      <span
        className={css.asterisk}
        aria-label={required}
      >
        &nbsp;*
      </span>
    )}
  </FormattedMessage>
);

export default Asterisk;
