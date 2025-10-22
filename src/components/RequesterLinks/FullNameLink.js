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
  const id = requester?.id ?? requesterId;
  return (id
    ? <Link to={`/users/view/${id}`}>{getFullName(requester)}</Link>
    : <FormattedMessage id="ui-requests.requestMeta.anonymized" />
  );
};

FullNameLink.propTypes = propTypes;

export default FullNameLink;
