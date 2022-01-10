import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { Col, KeyValue, Row, FormattedDate } from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';
import {
  ClipCopy,
} from '@folio/stripes/smart-components';

import { openRequestStatusFilters } from './utils';

const MISSING_VALUE_SYMBOL = '-';

const ItemDetail = ({
  currentInstanceId,
  request,
  item,
  loan,
  requestCount,
}) => {
  const itemId = request?.itemId || item.id;

  if (!itemId && !item.barcode) {
    return <FormattedMessage id="ui-requests.actions.loading" />;
  }

  const instanceId = request?.instanceId || currentInstanceId;
  const holdingsRecordId = request?.holdingsRecordId || item.holdingsRecordId;
  const title = request?.instance.title || item.title || MISSING_VALUE_SYMBOL;
  const contributor = get(request, ['instance', 'contributorNames', '0', 'name']) || get(item, ['contributorNames', '0', 'name']) || MISSING_VALUE_SYMBOL;
  const count = request?.requestCount || requestCount;
  const status = get(item, 'status.name') || get(item, 'status') || MISSING_VALUE_SYMBOL;
  const effectiveLocationName = get(item, 'effectiveLocation.name') || get(item, 'location.name') || MISSING_VALUE_SYMBOL;
  const dueDate = loan?.dueDate ? <FormattedDate value={loan.dueDate} /> : MISSING_VALUE_SYMBOL;

  const effectiveCallNumberString = effectiveCallNumber(item);
  const recordLink = itemId ? <Link to={`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`}>{item.barcode || itemId}</Link> : MISSING_VALUE_SYMBOL;
  const positionLink = (
    <Link to={`/requests?filters=${openRequestStatusFilters}&query=${itemId}&sort=Request Date`}>
      {count}
    </Link>
  );
  const itemLabel = item.barcode ? 'ui-requests.item.barcode' : 'ui-requests.item.id';

  return (
    <>
      <Row>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id={itemLabel} />}>
            {recordLink}
            {
              Boolean(item.barcode) && (
                <ClipCopy text={item.barcode} />
              )
            }
          </KeyValue>
        </Col>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.title" />}>
            {title}
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
            {effectiveLocationName}
          </KeyValue>
        </Col>
        <Col xs={8}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.callNumber" />}>
            {effectiveCallNumberString}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.status" />}>
            {status}
          </KeyValue>
        </Col>
        <Col xs={4}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.dueDate" />}>
            {dueDate}
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
  currentInstanceId: PropTypes.string,
  request: PropTypes.object,
  item: PropTypes.object.isRequired,
  loan: PropTypes.object,
  requestCount: PropTypes.number,
};

export default ItemDetail;
