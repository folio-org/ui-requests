import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const ItemDetail = ({ item, newRequest, dateFormatter, loan, requestCount }) => {
  console.log("item", item)
  if (!item.barcode) { return <div>Loading ...</div>; }

  const barcode = item.barcode;
  const recordLink = barcode ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${item.itemId}`}>{barcode}</Link> : '';
  // const currentDueDate = (_.get(request, ['itemStatus', 'name'], '').startsWith('Checked out')) ?
  //                        dateFormatter(_.get(request, ['loan', 'dueDate'], '')) : '-';
  //const status = newRequest ? _.get(item, ['status'], '') : _.get(item, ['status', 'name'], '');
  const status = _.get(item, ['status', 'name'], '');

  return (
    <div>
      <Row>
        <Col xs={3}>
          <KeyValue label="Item barcode" value={recordLink} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Title" value={_.get(item, ['title'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Author" value={_.get(item, ['author'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue
            label="Shelving location"
            value={_.get(item, ['permanentLocation', 'name']) || '-'}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label="Call number" value="-" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Volume" value="-" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Enumeration" value="-" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Copy" value="-" />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label="Item status" value={status || '-'} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Current due date" value={dateFormatter(_.get(loan, ['dueDate'], '')) || '-'} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Requests" value={requestCount} />
        </Col>
      </Row>
    </div>
  );
};

ItemDetail.propTypes = {
  item: PropTypes.object.isRequired,
  loan: PropTypes.object,
  newRequest: PropTypes.bool,
  requestCount: PropTypes.number,
  dateFormatter: PropTypes.func.isRequired,
};

ItemDetail.defaultProps = {
  loan: {},
  newRequest: false,
  requestCount: 0,
};

export default ItemDetail;
