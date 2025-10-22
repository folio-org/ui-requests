import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { getFullName } from '../../utils';
import propTypes from './propTypes';

const FullNameLink = ({
  userId,
  user,
}) => {
  if (user != null) {
    return <Link to={`/users/view/${user?.id ?? userId}`}>{getFullName(user)}</Link>;
  }

  return userId != null
    ? <FormattedMessage id="ui-requests.errors.user.unknown" />
    : <FormattedMessage id="ui-requests.requestMeta.anonymized" />;
};

FullNameLink.propTypes = propTypes;

export default FullNameLink;
