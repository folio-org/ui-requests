import { Link } from 'react-router-dom';

import { NoValue } from '@folio/stripes/components';

import propTypes from './propTypes';

const BarcodeLink = ({
  userId,
  user,
}) => {
  return user?.barcode
    ? <Link to={`/users/view/${user?.id ?? userId}`}>{user.barcode}</Link>
    : <NoValue />;
};

BarcodeLink.propTypes = propTypes;

export default BarcodeLink;
