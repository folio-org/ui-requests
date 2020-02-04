import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  keyBy,
  sortBy,
} from 'lodash';
import ReactRouterPropTypes from 'react-router-prop-types';
import { stripesConnect } from '@folio/stripes/core';

import RequestQueueView from '../views/RequestQueueView';
import urls from './urls';

class RequestQueueRoute extends React.Component {
  static getRequest(props) {
    const {
      location,
      resources,
    } = props;

    return get(location, 'state.request') ||
        get(resources, 'request.records[0]');
  }

  static manifest = {
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
    request: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      resourceShouldRefresh: true,
      params: (_q, _p, _r, _l, props) => {
        const request = RequestQueueRoute.getRequest(props);

        return (!request) ? { query: `id==${props.match.params.requestId}` } : null;
      },
    },
    holdings: {
      type: 'okapi',
      records: 'holdingsRecords',
      path: 'holdings-storage/holdings',
      params: (_q, _p, _r, _l, props) => {
        const request = RequestQueueRoute.getRequest(props);
        const holdingsRecordId = get(request, 'item.holdingsRecordId');

        return (holdingsRecordId) ? { query: `id==${holdingsRecordId}` } : null;
      },
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      params: {
        query: 'id==:{itemId}',
      },
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      params: {
        query: 'itemId==:{itemId} and status="Open"',
        limit: '1000',
      },
      shouldRefresh: () => false,
    },
    reorder: {
      type: 'okapi',
      POST: {
        path: 'circulation/requests/queue/:{itemId}/reorder',
      },
      fetch: false,
      clientGeneratePk: false,
    },
  };

  static propTypes = {
    location: ReactRouterPropTypes.location,
    resources: PropTypes.shape({
      items: PropTypes.shape({
        records: PropTypes.array,
      }),
      request: PropTypes.shape({
        records: PropTypes.array,
      }),
      requests: PropTypes.shape({
        records: PropTypes.array,
      }),
    }),
    mutator: PropTypes.shape({
      reorder: PropTypes.object,
    }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
    }).isRequired,
  };

  getRequest = () => {
    return RequestQueueRoute.getRequest(this.props);
  }

  handleClose = () => {
    const {
      history,
      location,
    } = this.props;

    if (get(location, 'state.request')) {
      history.goBack();
    } else {
      const request = this.getRequest();
      history.push(urls.requestView(request.id));
    }
  }

  reorder = (requests) => {
    const { mutator: { reorder } } = this.props;
    const reorderedQueue = requests.map(({ id, position: newPosition }) => ({
      id,
      newPosition,
    }));

    return reorder.POST({ reorderedQueue });
  }

  isLoading = () => {
    const { resources } = this.props;

    return get(resources, 'requests.isPending', true);
  }

  getRequestsWithDeliveryTypes() {
    const { resources } = this.props;
    const requests = get(resources, 'requests.records', []);
    const addressTypes = get(resources, 'addressTypes.records', []);
    const addressTypeMap = keyBy(addressTypes, 'id');

    return requests.map(r => ({
      ...r,
      deliveryType: get(addressTypeMap[r.deliveryAddressTypeId], 'addressType'),
    }));
  }

  render() {
    const { resources, location } = this.props;
    const request = this.getRequest();
    const requests = this.getRequestsWithDeliveryTypes();

    return (
      <RequestQueueView
        data={{
          requests: sortBy(requests, r => r.position),
          item: get(resources, 'items.records[0]', {}),
          holding: get(resources, 'holdings.records[0]', {}),
          request,
        }}
        onClose={this.handleClose}
        isLoading={this.isLoading()}
        onReorder={this.reorder}
        location={location}
      />
    );
  }
}

export default stripesConnect(RequestQueueRoute);
