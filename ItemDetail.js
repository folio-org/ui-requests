import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';


import KeyValue from '@folio/stripes-components/lib/KeyValue';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

const ItemDetail = ({ item, instance, holding, dateFormatter, loan, requestCount, intl }) => {
  if (!item.barcode) { return <div>{intl.formatMessage({ id: 'ui-requests.actions.loading' })}</div>; }

  const barcode = item.barcode;
  const recordLink = barcode ? <Link to={`/inventory/view/${item.instanceId}/${item.holdingsRecordId}/${item.itemId}`}>{barcode}</Link> : '';
  const status = _.get(item, ['status', 'name'], '');
  const contributor = _.get(instance, ['contributors', '0', 'name'], '-');

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
            value={_.get(item, ['permanentLocation', 'name']) || '-'}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.callNumber' })} value={_.get(holding, ['callNumber'], '-')} />
        </Col>
        <Col xs={3}>
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.volume' })} value="-" />
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
          <KeyValue label={intl.formatMessage({ id: 'ui-requests.item.numRequests' })} value={requestCount} />
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
  intl: PropTypes.func.isRequired,
};

ItemDetail.defaultProps = {
  holding: {},
  instance: {},
  loan: {},
  requestCount: 0,
};

export default injectIntl(ItemDetail);
