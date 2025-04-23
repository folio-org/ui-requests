import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  keyBy,
} from 'lodash';
import ReactRouterPropTypes from 'react-router-prop-types';
import { stripesConnect } from '@folio/stripes/core';

import RequestQueueView from '../views/RequestQueueView';
import urls from './urls';
import {
  requestStatuses,
  SETTINGS_SCOPES,
  SETTINGS_KEYS,
} from '../constants';
import {
  getTlrSettings,
  isPageRequest,
} from '../utils';

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
    configs: {
      type: 'okapi',
      records: 'items',
      path: 'settings/entries',
      params: {
        query: `(scope==${SETTINGS_SCOPES.CIRCULATION} and key==${SETTINGS_KEYS.GENERAL_TLR})`,
      },
    },
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
        const holdingsRecordId = get(request, 'holdingsRecordId');

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
      accumulate: true,
      fetch: false,
      shouldRefresh: () => false,
    },
    reorderInstanceQueue: {
      type: 'okapi',
      POST: {
        path: 'circulation/requests/queue/instance/:{id}/reorder',
      },
      fetch: false,
      clientGeneratePk: false,
      throwErrors: false,
    },
    reorderItemQueue: {
      type: 'okapi',
      POST: {
        path: 'circulation/requests/queue/item/:{id}/reorder',
      },
      fetch: false,
      clientGeneratePk: false,
      throwErrors: false,
    },
  };

  static propTypes = {
    location: ReactRouterPropTypes.location,
    resources: PropTypes.shape({
      items: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          })
        ),
      }),
      request: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          })
        ),
      }),
      requests: PropTypes.shape({
        isPending: PropTypes.bool,
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          })
        ),
      }).isRequired,
      configs: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.shape({
              titleLevelRequestsFeatureEnabled: PropTypes.bool,
            })
          })
        ).isRequired,
        hasLoaded: PropTypes.bool.isRequired,
      }).isRequired,
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        requestId: PropTypes.string,
      }),
    }).isRequired,
    mutator: PropTypes.shape({
      reorderInstanceQueue: PropTypes.shape({
        POST: PropTypes.func,
      }).isRequired,
      reorderItemQueue: PropTypes.shape({
        POST: PropTypes.func,
      }).isRequired,
      requests: PropTypes.shape({
        reset: PropTypes.func,
        GET: PropTypes.func,
      }).isRequired,
    }),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
      goBack: PropTypes.func.isRequired,
    }).isRequired,
  };

  componentDidMount() {
    this.setTlrSettings();
  }

  componentDidUpdate(prevProps) {
    const { configs: prevConfigs } = prevProps.resources;
    const { configs } = this.props.resources;

    if ((prevConfigs.hasLoaded !== configs.hasLoaded && configs.hasLoaded)) {
      this.setTlrSettings();
    }
  }

  setTlrSettings = () => {
    const { configs } = this.props.resources;
    const { titleLevelRequestsFeatureEnabled } = getTlrSettings(configs.records[0]?.value);

    this.setState({ titleLevelRequestsFeatureEnabled }, this.getRequests);
  }

  getRequests = () => {
    const {
      mutator: { requests },
      resources: {
        configs,
      },
      match: {
        params,
      },
    } = this.props;
    const { titleLevelRequestsFeatureEnabled } = this.state;

    if (!configs.hasLoaded) {
      return;
    }

    const path = `circulation/requests/queue/${titleLevelRequestsFeatureEnabled ? 'instance' : 'item'}/${params.id}`;

    requests.reset();
    requests.GET({ path });
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

  reorder = (requests) => {
    const {
      mutator: {
        reorderInstanceQueue,
        reorderItemQueue,
      },
    } = this.props;
    const { titleLevelRequestsFeatureEnabled } = this.state;
    const reorderedQueue = requests.map(({ id, position: newPosition }) => ({
      id,
      newPosition,
    }));

    return titleLevelRequestsFeatureEnabled
      ? reorderInstanceQueue.POST({ reorderedQueue })
      : reorderItemQueue.POST({ reorderedQueue });
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
    const titleLevelRequestsFeatureEnabled = !!this.state?.titleLevelRequestsFeatureEnabled;
    const { resources, location } = this.props;
    const request = this.getRequest();
    const requests = this.getRequestsWithDeliveryTypes();
    const notYetFilledRequests = [];
    let inProgressRequests = [];
    const pageRequests = [];

    requests
      .forEach((r) => {
        if (isPageRequest(r)) {
          pageRequests.push(r);
        } else if (r.status === requestStatuses.NOT_YET_FILLED) {
          notYetFilledRequests.push(r);
        } else {
          inProgressRequests.push(r);
        }
      });

    inProgressRequests = [
      ...inProgressRequests,
      ...pageRequests, // page requests should be shown at the bottom of the accordion
    ];

    return (
      <RequestQueueView
        data={{
          notYetFilledRequests,
          inProgressRequests,
          item: get(resources, 'items.records[0]', {}),
          holding: get(resources, 'holdings.records[0]', {}),
          request,
        }}
        isTlrEnabled={titleLevelRequestsFeatureEnabled}
        onClose={this.handleClose}
        isLoading={this.isLoading()}
        onReorder={this.reorder}
        location={location}
      />
    );
  }
}

export default stripesConnect(RequestQueueRoute);
