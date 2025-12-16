import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { getFullName, isUserAnonymized } from '../../utils';
import propTypes from './propTypes';

/**
FullNameLink component displays a link to the user's profile using their userId and user object.
If the user object is present, it renders a link with the user's full name.
If the user is anonymized (userId === null), it displays an anonymized message.
If the user is not found, it displays an unknown user message.
@param {Object} props
@param {string|null|undefined} props.userId - The user's identifier.
@param {Object|null|undefined} props.user - The user object.
@returns {JSX.Element} A link to the user profile or a message.
*/
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
