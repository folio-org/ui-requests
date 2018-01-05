import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import { getFullName } from './utils';

const UserDetail = (props) => {
  if (props.error) {
    return <div style={{ color: 'red' }}>{props.error}</div>;
  }

  const patronGroups = (props.patronGroups || {}).records || [];
  const user = props.user || {};
  const patronGroupId = user.patronGroup || {};
  const requesterGroup = (patronGroups.find(g => g.id === patronGroupId) || {}).group || '';
  const path = `/users/view/${user.id}`;

  return (
    <div>
      <br />
      <Row>
        <Col xs={12}>
          <KeyValue label="Requester name" value={<Link to={path}>{getFullName(user)}</Link>} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue label="Barcode" value={user.barcode ? <Link to={path}>{user.barcode}</Link> : ''} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue label="Patron group" value={requesterGroup} />
        </Col>
      </Row>
    </div>
  );
};

UserDetail.propTypes = {
  error: PropTypes.string,
  patronGroups: PropTypes.shape({
    hasLoaded: PropTypes.bool.isRequired,
    isPending: PropTypes.bool.isPending,
    other: PropTypes.shape({
      totalRecords: PropTypes.number,
    }),
  }).isRequired,
  user: PropTypes.object.isRequired,
};

UserDetail.defaultProps = {
  error: '',
};

export default UserDetail;
