import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
  FormattedDate,
  NoValue,
} from '@folio/stripes/components';
import { effectiveCallNumber } from '@folio/stripes/util';
import {
  ClipCopy,
} from '@folio/stripes/smart-components';

import { openRequestStatusFilters } from './utils';

const DEFAULT_COUNT_VALUE = 0;

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
  const title = request?.instance.title || item.title || <NoValue />;
  const contributor = request?.instance.contributorNames?.[0]?.name || item.contributorNames?.[0]?.name || <NoValue />;
  const count = request?.itemRequestCount || requestCount || DEFAULT_COUNT_VALUE;
  const status = item.status?.name || item.status || <NoValue />;
  const effectiveLocationName = item.effectiveLocation?.name || item.location?.name || <NoValue />;
  const dueDate = loan?.dueDate ? <FormattedDate value={loan.dueDate} /> : <NoValue />;

  const effectiveCallNumberString = effectiveCallNumber(item);
  const recordLink = itemId ? <Link to={`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`}>{item.barcode || itemId}</Link> : <NoValue />;
  const positionLink = count
    ? (
      <Link to={`/requests?filters=${openRequestStatusFilters}&query=${itemId}&sort=Request Date`}>
        {count}
      </Link>
    )
    : count;
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
          <KeyValue
            label={<FormattedMessage id="ui-requests.item.requestsOnItem" />}
            value={positionLink}
          />
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
