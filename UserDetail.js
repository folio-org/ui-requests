import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';

const UserDetail = ({ user }) => {
  const userName = (user && user.personal) ? `${user.personal.firstName} ${user.personal.lastName}` : '';
  const recordLink = <Link to={`/users/view/${user.id}`}>{userName}</Link>;

  return (
    <div>
      <Row>
        <Col xs={12}>
          <KeyValue label="Requester name" value={recordLink} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue label="Patron group" value={_.get(user, ['patronGroup'], '')} />
        </Col>
      </Row>
    </div>
  );
};

UserDetail.propTypes = {
  user: PropTypes.object.isRequired,
};

export default UserDetail;
