import React from 'react';
import PropTypes from 'prop-types';
import { countBy, get, orderBy } from 'lodash';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  MultiColumnList,
  Pane,
} from '@folio/stripes/components';
import { stripesConnect } from '@folio/stripes/core';
import { Loading } from './components';

import css from './MoveRequestDialog.css';

const COLUMN_NAMES = [
  'barcode',
  'itemStatus',
  'requestQueue',
  'location',
  'materialType',
  'loanType',
];

const COLUMN_WIDTHS = {
  barcode: '16%',
  itemStatus: '16%',
  requestQueue: '16%',
  location: '16%',
  materialType: '16%',
  loanType: '16%',
};

const COLUMN_MAP = {
  barcode: <FormattedMessage id="ui-requests.barcode" />,
  itemStatus: <FormattedMessage id="ui-requests.item.status" />,
  requestQueue: <FormattedMessage id="ui-requests.requestQueue" />,
  location: <FormattedMessage id="ui-requests.location" />,
  materialType: <FormattedMessage id="ui-requests.materialType" />,
  loanType: <FormattedMessage id="ui-requests.loanType" />,
};

const formatter = {
  itemStatus: item => item.status.name,
  location: item => get(item, 'effectiveLocation.name', ''),
  materialType: item => item.materialType.name,
  loanType: item => (item.temporaryLoanType ? get(item, 'temporaryLoanType.name', '') : get(item, 'permanentLoanType.name', '')),
};

class MoveRequestDialog extends React.Component {
  static manifest = {
    holdings: {
      type: 'okapi',
      records: 'holdingsRecords',
      path: 'holdings-storage/holdings',
      accumulate: true,
      fetch: false,
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: true,
      fetch: false,
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      accumulate: true,
      fetch: false,
    },
  };

  static propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    moveInProgress: PropTypes.bool,
    onItemSelected: PropTypes.func,
    request: PropTypes.object,
    resources: PropTypes.shape({
      holdings: PropTypes.shape({
        records: PropTypes.array,
      }),
      items: PropTypes.shape({
        records: PropTypes.array,
      }),
      requests: PropTypes.shape({
        records: PropTypes.array,
      }),
    }),
    mutator: PropTypes.shape({
      holdings: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    }),
  };

  constructor(props) {
    super(props);
    this.state = {
      items: [],
      isLoading: true,
    };
  }

  async componentDidMount() {
    const holdings = await this.fetchHoldings();
    let items = await this.fetchItems(holdings);
    const requests = await this.fetchRequests(items);
    const requestMap = countBy(requests, 'itemId');
    const { request } = this.props;

    items = items
      .filter(item => item.id !== request.itemId)
      .map(item => ({ ...item, requestQueue: requestMap[item.id] || 0 }));

    this.setState({ items, isLoading: false });
  }

  fetchHoldings() {
    const {
      mutator:  { holdings },
      request: { item: { instanceId } }
    } = this.props;
    const query = `instanceId==${instanceId}`;
    holdings.reset();

    return holdings.GET({ params: { query } });
  }

  fetchItems(holdings) {
    const { mutator: { items } } = this.props;
    const query = holdings.map(h => `holdingsRecordId==${h.id}`).join(' or ');
    items.reset();

    return items.GET({ params: { query } });
  }

  fetchRequests(items) {
    const { mutator: { requests } } = this.props;
    let query = items.map(i => `itemId==${i.id}`).join(' or ');
    query = `(${query}) and (status="Open")`;
    requests.reset();

    return requests.GET({ params: { query } });
  }

  async onRowClick(item) {
    const requests = await this.fetchRequests([item]);
    this.props.onItemSelected(item, requests);
  }

  render() {
    const {
      onClose,
      open,
      moveInProgress,
    } = this.props;
    const {
      items,
      isLoading,
    } = this.state;
    const contentData = orderBy(items, 'requestQueue');
    const count = items.length;

    return (
      <Modal
        data-test-move-request-modal
        label={<FormattedMessage id="ui-requests.moveRequest.selectItem" />}
        open={open}
        contentClass={css.content}
        onClose={onClose}
        dismissible
      >
        <Pane
          paneTitle={<FormattedMessage id="ui-requests.moveRequest.instanceItems" />}
          paneSub={<FormattedMessage id="ui-requests.resultCount" values={{ count }} />}
          defaultWidth="fill"
          noOverflow
        >
          {(isLoading || moveInProgress) ?
            <Loading /> :
            <MultiColumnList
              id="instance-items-list"
              interactive
              ariaLabel={<FormattedMessage id="ui-requests.moveRequest.instanceItems" />}
              contentData={contentData}
              visibleColumns={COLUMN_NAMES}
              columnMapping={COLUMN_MAP}
              columnWidths={COLUMN_WIDTHS}
              formatter={formatter}
              isEmptyMessage={<FormattedMessage id="ui-requests.moveRequest.instanceItems.notFound" />}
              onRowClick={(_, item) => this.onRowClick(item)}
            /> }
        </Pane>
      </Modal>
    );
  }
}

export default stripesConnect(MoveRequestDialog);
