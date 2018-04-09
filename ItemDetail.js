import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const ItemDetail = ({ request, dateFormatter }) => {
  if (!request.itemBarcode) { return <div>Loading ...</div>; }

  const itemBarcode = _.get(request, ['itemBarcode'], '');
  const recordLink = itemBarcode ? <Link to={`/inventory/view/${request.item.instanceId}/${request.item.holdingsRecordId}/${request.itemId}`}>{itemBarcode}</Link> : '';
  const currentDueDate = (_.get(request, ['itemStatus', 'name'], '').startsWith('Checked out')) ?
                          dateFormatter(_.get(request, ['loan', 'dueDate'], '')) : '-';

  return (
    <div>
      <Row>
        <Col xs={3}>
          <KeyValue label="Item barcode" value={recordLink} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Title" value={_.get(request, ['title'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Author" value={_.get(request, ['author'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Shelving location" value={_.get(request, ['location'], '')} />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label="Call number" value="" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Volume" value="" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Enumeration" value="" />
        </Col>
        <Col xs={3}>
          <KeyValue label="Copy" value="" />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label="Item status" value={_.get(request, ['itemStatus'], '')} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Current due date" value={dateFormatter(_.get(request, ['loan', 'dueDate'], ''))} />
        </Col>
        <Col xs={3}>
          <KeyValue label="Requests" value={_.get(request, ['itemRequestCount'], '')} />
        </Col>
      </Row>
    </div>
  );
};

ItemDetail.propTypes = {
  request: PropTypes.object.isRequired,
  dateFormatter: PropTypes.func.isRequired,
};

export default ItemDetail;
