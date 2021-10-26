import React from 'react';
import PropTypes from 'prop-types';
import { countBy, chunk } from 'lodash';
import { stripesConnect } from '@folio/stripes/core';

import ItemsDialog from './ItemsDialog';

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

    return items.GET({ params: { query, limit: 1000 } });
  }

  async fetchRequests(items) {
    const { mutator: { requests } } = this.props;

    // Split the list of items into small chunks to create a short enough query string
    // that we can avoid a "414 Request URI Too Long" response from Okapi.
    const CHUNK_SIZE = 40;

    const chunkedItems = chunk(items, CHUNK_SIZE);

    const data = [];

    for (const itemChunk of chunkedItems) {
      let query = itemChunk.map(i => `itemId==${i.id}`).join(' or ');
      query = `(${query}) and (status="Open")`;

      requests.reset();
      // eslint-disable-next-line no-await-in-loop
      const result = await requests.GET({ params: { query, limit: 1000 } });

      data.push(...result);
    }

    return data;
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
      request,
    } = this.props;
    const {
      items,
      isLoading,
    } = this.state;

    return (
      <ItemsDialog
        onRowClick={(_, item) => this.onRowClick(item)}
        isLoading={!!(isLoading || moveInProgress)}
        items={items}
        request={request}
        onClose={onClose}
        open={open}
      />
    );
  }
}

export default stripesConnect(MoveRequestDialog);
