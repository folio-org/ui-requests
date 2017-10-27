import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';

const UserDetail = ({ user, error, patronGroups }) => {
  const userName = (user && user.personal) ? `${user.personal.firstName} ${user.personal.lastName}` : '';
  let recordLink;
  let requesterGroup;

  if (user) {
    recordLink = <Link to={`/users/view/${user.id}`}>{userName}</Link>;
    requesterGroup = (user && patronGroups.records && patronGroups.records.length > 0) ? patronGroups.records.find(g => g.id === user.patronGroup).group : '';
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <KeyValue label="Requester name" value={recordLink} />
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
