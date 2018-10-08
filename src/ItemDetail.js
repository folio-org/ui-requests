import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import { Col, KeyValue, Row } from '@folio/stripes/components';

const ItemDetail = ({ item, instance, holding, dateFormatter, loan, requestCount, intl }) => {
  if (!item.barcode) { return <div>{intl.formatMessage({ id: 'ui-requests.actions.loading' })}</div>; }

  const recordLink = item.barcode ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${item.id}`}>{item.barcode}</Link> : '';
  const status = _.get(item, ['status', 'name'], '');
  const contributor = _.get(instance, ['contributors', '0', 'name'], '-');
  const positionLink = item ? <Link to={`/requests?filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&query=${item.barcode}&sort=Request%20Date`}>{requestCount}</Link> : '-';

  return (
    <div>
      <Row>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.barcode' })} value={recordLink} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.title' })} value={_.get(item, ['title'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.contributor' })} value={contributor} />
        </Col>
        <Col xs={3}>
          <KeyValue
            label={intl.formatMessage({ id: 'ui-requests.item.shelfLocation' })}
            value={_.get(item, ['effectiveLocation', 'name']) || '-'}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.callNumber' })} value={_.get(holding, ['callNumber'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.enumeration' })} value={_.get(item, ['enumeration'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.copyNumber' })} value="-" />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.status' })} value={status || '-'} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.dueDate' })} value={dateFormatter(_.get(loan, ['dueDate'], '')) || '-'} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.requestsOnItem' })} value={positionLink} />
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
  dateFormatter: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

ItemDetail.defaultProps = {
  holding: {},
  instance: {},
  loan: {},
  requestCount: 0,
};

export default injectIntl(ItemDetail);
