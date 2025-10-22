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
  if (requester != null) {
    return <Link to={`/users/view/${requester?.id ?? requesterId}`}>{getFullName(requester)}</Link>;
  }

  return requesterId != null
    ? <FormattedMessage id="ui-requests.requestMeta.unknown" />
    : <FormattedMessage id="ui-requests.requestMeta.anonymized" />;
};

FullNameLink.propTypes = propTypes;

export default FullNameLink;
