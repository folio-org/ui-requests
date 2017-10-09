import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';

const ItemDetail = ({ item, error, patronGroups, dateFormatter }) => {
  let recordLink;
  let borrowerLink;
  let borrowerName;
  let borrowerGroup;

  const { itemRecord, loanRecord, borrowerRecord } = item;

  if (item) {
    borrowerName = `${_.get(borrowerRecord, ['personal', 'firstName'], '')} ${_.get(borrowerRecord, ['personal', 'lastName'], '')}`;
    borrowerGroup = (borrowerRecord && patronGroups.length > 0) ? patronGroups.find(g => g.id === borrowerRecord.patronGroup).group : '';

    if (itemRecord) {
      recordLink = <Link to={`/items/view/${itemRecord.id}`}>{_.get(itemRecord, ['barcode'], '')}</Link>;
    }
    if (borrowerRecord) {
      borrowerLink = <Link to={`/users/view/${borrowerRecord.id}`}>{borrowerName}</Link>;
    }
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <KeyValue label="Item barcode" value={recordLink} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue label="Title" value={_.get(itemRecord, ['title'], '')} />
        </Col>
      </Row>
      <Row>
        <Col xs={12}>
          <KeyValue label="Shelving location" value={_.get(itemRecord, ['location', 'name'], '')} />
        </Col>
      </Row>
      <h4>Current Loan</h4>
      {item && loanRecord &&
        <Row>
          <Col xs={4}>
            <KeyValue label="Loaned to" value={borrowerLink} />
          </Col>
          <Col xs={2}>
            <KeyValue label="Patron group" value={borrowerGroup} />
          </Col>
          <Col xs={2}>
            <KeyValue label="Status" value={_.get(itemRecord, ['status', 'name'], '')} />
          </Col>
          <Col xs={2}>
            <KeyValue label="Current due date" value={dateFormatter(_.get(loanRecord, ['dueDate'], ''))} />
          </Col>
          <Col xs={2}>
            <KeyValue label="Requests" value={''} />
          </Col>
        </Row>
      }
    </div>
  );
};

ItemDetail.propTypes = {
  item: PropTypes.object.isRequired,
  error: PropTypes.string,
  patronGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  dateFormatter: PropTypes.func.isRequired,
};

ItemDetail.defaultProps = {
  error: '',
};

export default ItemDetail;
