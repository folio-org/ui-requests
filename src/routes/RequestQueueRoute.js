import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import ReactRouterPropTypes from 'react-router-prop-types';
import { stripesConnect } from '@folio/stripes/core';

import RequestQueueView from '../views/RequestQueueView';
import urls from './urls';

class RequestQueueRoute extends React.Component {
  static manifest = {
    request: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      params: (_q, _p, _r, _l, props) => {
        const request = RequestQueueRoute.getRequest(props);

        return (!request) ? { query: `id==${props.match.params.id}` } : null;
      },
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      params: (_q, _p, _r, _l, props) => {
        const request = RequestQueueRoute.getRequest(props);

        return (request) ? { query: `id==${request.itemId}` } : null;
      },
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      params: (_q, _p, _r, _l, props) => {
        const request = RequestQueueRoute.getRequest(props);

        return (request) ? { query: `itemId==${request.itemId}` } : null;
      },
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
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  static getRequest(props) {
    const {
      location,
      resources,
    } = props;

    return get(location, 'state.request') ||
      get(resources, 'request.records[0]');
  }

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

  isLoading = () => {
    const { resources } = this.props;

    return get(resources, 'items.isPending', true);
  }

  render() {
    const { resources } = this.props;

    return (
      <RequestQueueView
        data={{
          requests:  get(resources, 'requests.records', []),
          item: get(resources, 'items.records[0]', {}),
        }}
        onClose={this.handleClose}
        isLoading={this.isLoading()}
      />
    );
  }
}

export default stripesConnect(RequestQueueRoute);
