import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { getFullName } from '../../utils';
import propTypes from './propTypes';

const FullNameLink = ({
  request: {
    requesterId,
    requester,
  } = {},
}) => {
  if (requesterId != null && requester == null) {
    return <FormattedMessage id="ui-requests.requestMeta.unknown" />;
  }

  if (requesterId == null && requester == null) {
    return <FormattedMessage id="ui-requests.requestMeta.anonymized" />;
  }

  const id = requester?.id ?? requesterId;
  return <Link to={`/users/view/${id}`}>{getFullName(requester)}</Link>;
};

FullNameLink.propTypes = propTypes;

export default FullNameLink;
