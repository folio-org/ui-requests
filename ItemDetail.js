import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';

const ItemDetail = ({ item, error }) => {
  let recordLink;
  if (item) {
    recordLink = <Link to={`/items/view/${item.id}`}>{_.get(item, ['barcode'], '')}</Link>;
  }

  if (error) {
    return (
      <div style={{color: 'red'}}>
        {error}
      </div>
    );
  }
  else {
    return (
      <div>
        <Row>
          <Col xs={12}>
            <KeyValue label="Item barcode" value={recordLink} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue label="Title" value={_.get(item, ['title'], '')} />
          </Col>
        </Row>
        <Row>
          <Col xs={12}>
            <KeyValue label="Shelving location" value={_.get(item, ['location', 'name'], '')} />
          </Col>
        </Row>
        <h4>Current Loan</h4>
        <Row>
          <Col xs={12}>
            <KeyValue label="Status" value={_.get(item, ['status', 'name'], '')} />
          </Col>
        </Row>
      </div>
    );
  }
};

ItemDetail.propTypes = {
  item: PropTypes.object,
  error: PropTypes.string,
};

export default ItemDetail;
