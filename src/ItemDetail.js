import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';

import { openRequestStatusFilters } from './utils';

const ItemDetail = ({ item, loan, requestCount }) => {
  if (!item.id && !item.barcode) {
    return <FormattedMessage id="ui-requests.actions.loading" />;
  }

  const recordLink = item ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${item.id}`}>{item.barcode || item.id}</Link> : '-';
  const status = get(item, 'status.name') || get(item, 'status');
  const contributor = get(item, ['contributorNames', '0', 'name'], '-');

  const positionLink = (
    <Link to={`/requests?filters=${openRequestStatusFilters}&query=${item.barcode || item.id}&sort=Request Date`}>
      {requestCount}
    </Link>
  );
  const itemLabel = item.barcode ? 'ui-requests.item.barcode' : 'ui-requests.item.id';

  return (
    <>
      <Row>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id={itemLabel} />}>
            {recordLink}
          </KeyValue>
        </Col>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.title" />}>
            {get(item, ['title'], '-')}
          </KeyValue>
        </Col>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.contributorNames" />}>
            {contributor}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.effectiveLocation" />}>
            {get(item, 'effectiveLocation.name') || get(item, 'location.name') || ''}
          </KeyValue>
        </Col>
        <Col xs={8}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.callNumber" />}>
            {effectiveCallNumber(item)}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.status" />}>
            {status || '-'}
          </KeyValue>
        </Col>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.dueDate" />}>
            {loan && loan.dueDate ? <FormattedDate value={loan.dueDate} /> : '-'}
          </KeyValue>
        </Col>
        <Col
          data-test-requests-on-item
          xs={4}
        >
          <KeyValue label={<FormattedMessage id="ui-requests.item.requestsOnItem" />}>
            {positionLink}
          </KeyValue>
        </Col>
      </Row>
    </>
  );
};

ItemDetail.propTypes = {
  item: PropTypes.object,
  loan: PropTypes.object,
  requestCount: PropTypes.number
};

export default ItemDetail;
