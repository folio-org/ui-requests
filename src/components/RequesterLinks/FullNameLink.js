import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { getFullName, isUserAnonymized } from '../../utils';
import propTypes from './propTypes';

// This link component takes both the userId and the user object
// If a requester or proxy has been deleted the request will still have the requesterId or proxyUserId
// but not have the actual requester/proxy object
// If a requester has been anonymized then the requesterId and proxyUserId will be null
// in addition to the requester/proxy object
const FullNameLink = ({
  userId,
  user,
}) => {
  if (user) {
    return <Link to={`/users/view/${user?.id ?? userId}`}>{getFullName(user)}</Link>;
  }

  return isUserAnonymized(userId)
    ? <FormattedMessage id="ui-requests.requestMeta.anonymized" />
    : <FormattedMessage id="ui-requests.errors.user.unknown" />;
};

FullNameLink.propTypes = propTypes;

export default FullNameLink;
