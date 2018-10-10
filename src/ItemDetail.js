import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';

const ItemDetail = ({ item, instance, holding, loan, requestCount }) => {
  if (!item.barcode) {
    return <FormattedMessage id="ui-requests.actions.loading" />;
  }

  const recordLink = item.barcode ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${item.id}`}>{item.barcode}</Link> : '';
  const status = get(item, ['status', 'name'], '');
  const contributor = get(instance, ['contributors', '0', 'name'], '-');
  const positionLink = item ? <Link to={`/requests?filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&query=${item.barcode}&sort=Request%20Date`}>{requestCount}</Link> : '-';

  return (
    <div>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.barcode" />}>
            {recordLink}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.title" />}>
            {get(item, ['title'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.contributor" />}>
            {contributor}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.shelfLocation" />}>
            {get(item, ['effectiveLocation', 'name']) || '-'}
          </KeyValue>
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.callNumber" />}>
            {get(holding, ['callNumber'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.enumeration" />}>
            {get(item, ['enumeration'], '-')}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.copyNumber" />}>
            {'-'}
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
            {loan.dueDate ? <FormattedDate value={loan.dueDate} /> : '-'}
          </KeyValue>
        </Col>
        <Col xs={3}>
          <KeyValue label={<FormattedMessage id="ui-requests.item.requestsOnItem" />}>
            {positionLink}
          </KeyValue>
        </Col>
      </Row>
    </div>
  );
};

ItemDetail.propTypes = {
  item: PropTypes.object.isRequired,
  holding: PropTypes.object,
  instance: PropTypes.object,
  loan: PropTypes.object,
  requestCount: PropTypes.number,
};

ItemDetail.defaultProps = {
  holding: {},
  instance: {},
  loan: {},
  requestCount: 0,
};

export default ItemDetail;
