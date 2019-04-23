import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';

const ItemDetail = ({ item, loan, itemId, requestCount }) => {
  if (!item.id) {
    return <FormattedMessage id="ui-requests.actions.loading" />;
  }

  const recordLink = item ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${itemId}`}>{item.barcode || item.id}</Link> : '-';
  const status = get(item, 'status.name') || get(item, 'status');
  const contributor = get(item, ['contributorNames', '0', 'name'], '-');
  const positionLink = item.barcode ? <Link to={`/requests?filters=requestStatus.Open%20-%20Awaiting%20pickup%2CrequestStatus.Open%20-%20In%20transit%2CrequestStatus.Open%20-%20Not%20yet%20filled&query=${item.barcode}&sort=Request%20Date`}>{requestCount}</Link> : '-';
  const itemLabel = item.barcode ? 'ui-requests.item.barcode' : 'ui-requests.item.id';

  return (
    <React.Fragment>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id={itemLabel} />}>
            {recordLink}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.title" />}>
            {get(item, ['title'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.contributorNames" />}>
            {contributor}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.location.name" />}>
            {get(item, ['effectiveLocation', 'name']) || '-'}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.callNumber" />}>
            {get(item, ['callNumber'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.enumeration" />}>
            {get(item, ['enumeration'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.copyNumber" />}>
            {get(item, ['copyNumber'], '-')}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.status" />}>
            {status || '-'}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.dueDate" />}>
            {loan && loan.dueDate ? <FormattedDate value={loan.dueDate} /> : '-'}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.requestsOnItem" />}>
            {positionLink}
          </KeyValue>
        </Col>
      </Row>
    </React.Fragment>
  );
};

ItemDetail.propTypes = {
  item: PropTypes.object,
  loan: PropTypes.object,
  itemId: PropTypes.string,
  requestCount: PropTypes.number
};

export default ItemDetail;
