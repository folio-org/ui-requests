import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import moment from 'moment-timezone';
import {
  FormattedTime,
  FormattedMessage,
  injectIntl,
  intlShape,
} from 'react-intl';
import { makeQueryFunction, SearchAndSort } from '@folio/stripes/smart-components';
import { exportCsv } from '@folio/stripes/util';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';
import { requestTypes, fulfilmentTypes } from './constants';
import { getFullName } from './utils';
import packageInfo from '../package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

// TODO: Translate these filter labels
const filterConfig = [
  {
    label: 'Request type',
    name: 'requestType',
    cql: 'requestType',
    values: [
      { name: 'Holds', cql: 'Hold' },
      { name: 'Pages', cql: 'Page' },
      { name: 'Recalls', cql: 'Recall' },
    ],
  },
  {
    label: 'Request status',
    name: 'requestStatus',
    cql: 'status',
    values: [
      { name: 'closed - cancelled', cql: 'Closed - Cancelled' },
      { name: 'closed - filled', cql: 'Closed - Filled' },
      { name: 'open - awaiting pickup', cql: 'Open - Awaiting pickup' },
      { name: 'open - not yet filled', cql: 'Open - Not yet filled' },
    ],
  },
];

class Requests extends React.Component {
  static manifest = {
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
    query: {
      initialValue: {
        query: '',
        filters: '',
        sort: 'Request Date',
      },
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    records: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      recordsRequired: '%{resultCount}',
      perRequest: 30,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(requester.barcode="%{query.query}*" or item.title="%{query.query}*" or item.barcode="%{query.query}*")',
            {
              'Title': 'item.title',
              'Item barcode': 'item.barcode',
              'Type': 'requestType',
              'Requester': 'requester.lastName requester.firstName',
              'Requester Barcode': 'requester.barcode',
              'Request Date': 'requestDate',
            },
            filterConfig,
            2, // do not fetch unless we have a query or a filter
          ),
        },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: 'service-points?query=(pickupLocation==true)&limit=100',
    },
    itemUniquenessValidator: {
      type: 'okapi',
      records: 'items',
      accumulate: 'true',
      path: 'inventory/items',
      fetch: false,
    },
    userUniquenessValidator: {
      type: 'okapi',
      records: 'users',
      accumulate: 'true',
      path: 'users',
      fetch: false,
    },
  }

  static propTypes = {
    intl: intlShape,
    mutator: PropTypes.shape({
      records: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      query: PropTypes.object,
      requestCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
      resultCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      formatDate: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
      okapi: PropTypes.shape({
        url: PropTypes.string.isRequired,
        tenant: PropTypes.string.isRequired,
      }),
      store: PropTypes.shape({
        getState: PropTypes.func.isRequired,
      }),
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.okapiUrl = props.stripes.okapi.url;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': props.stripes.okapi.tenant,
      'X-Okapi-Token': props.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.addRequestFields = this.addRequestFields.bind(this);
    this.create = this.create.bind(this);
    this.findResource = this.findResource.bind(this);
    this.headersMapping = this.headersMapping.bind(this);
  }

  componentDidUpdate() {
    if (this.csvExportPending) {
      const recordsLoaded = this.props.resources.records.records;
      const numTotalRecords = this.props.resources.records.other.totalRecords;
      if (recordsLoaded.length === numTotalRecords) {
        const onlyFields = this.headersMapping();
        exportCsv(recordsLoaded, {
          onlyFields,
          excludeFields: ['id'],
        });
        this.csvExportPending = false;
      }
    }
  }

  headersMapping() {
    const headers = ['requestType', 'status', 'requestExpirationDate', 'holdShelfExpirationDate',
      'position', 'item.barcode', 'item.title', 'item.contributor', 'item.shelfLocation',
      'item.callNumber', 'item.enumeration', 'item.status', 'loan.dueDate', 'requester.firstName',
      'requester.barcode', 'requester.patronGroup', 'fulfilmentPreference', 'requester.pickupServicePoint',
      'requester.deliveryAddress', 'proxy.firstName', 'proxy.barcode'];

    const headersArray = headers.map(item => {
      return {
        label: this.props.intl.formatMessage({ id: `ui-requests.${item}` }),
        value: item
      };
    });
    return headersArray;
  }

  // idType can be 'id', 'barcode', etc.
  findResource(resource, value, idType = 'id') {
    const urls = {
      user: `users?query=(${idType}="${value}")`,
      item: `inventory/items?query=(${idType}="${value}")`,
      holding: `holdings-storage/holdings/${value}`,
      instance: `inventory/instances/${value}`,
      loan: `circulation/loans?query=(itemId="${value}")`,
      requestsForItem: `request-storage/requests?query=(itemId="${value}")`,
    };

    return fetch(`${this.okapiUrl}/${urls[resource]}`, { headers: this.httpHeaders }).then(response => response.json());
  }

  // Called as a map function
  addRequestFields(r) {
    return Promise.all(
      [
        this.findResource('user', r.requesterId),
        this.findResource('item', r.itemId),
        this.findResource('loan', r.itemId),
        this.findResource('requestsForItem', r.itemId),
        this.findResource('holding', r.item.holdingsRecordId),
        this.findResource('instance', r.item.instanceId),
      ],
    ).then((resultArray) => {
      // Each element of the promises array returns an array of results, but in
      // this case, there should only ever be one result for each.
      const user = resultArray[0].users[0];
      const item = resultArray[1].items[0];
      const loan = resultArray[2].loans[0];
      const requestCount = resultArray[3].requests.length;
      const holding = resultArray[4];
      const instance = resultArray[5];

      // One field missing from item is the instanceId ... but it's included in
      // the original request
      item.instanceId = r.item.instanceId;

      return { requestMeta: r, requester: user, item, loan, requestCount, holding, instance };
    });
  }

  massageNewRecord = (requestData) => {
    const { intl: { timeZone } } = this.props;
    const isoDate = moment.tz(timeZone).format();
    Object.assign(requestData, { requestDate: isoDate });
  }

  create = data => this.props.mutator.records.POST(data).then(() => this.props.mutator.query.update({ layer: null }));

  render() {
    const {
      resources,
      stripes,
    } = this.props;
    const patronGroups = (resources.patronGroups || {}).records || [];
    const addressTypes = (resources.addressTypes || {}).records || [];
    const servicePoints = (resources.servicePoints || {}).records || [];

    const resultsFormatter = {
      'Item barcode': rq => (rq.item ? rq.item.barcode : ''),
      'Position': rq => (rq.position || ''),
      'Proxy': rq => (rq.proxy ? getFullName(rq.proxy) : ''),
      'Request Date': rq => <FormattedTime value={rq.requestDate} day="numeric" month="numeric" year="numeric" />,
      'Requester': rq => (rq.requester ? `${rq.requester.lastName}, ${rq.requester.firstName}` : ''),
      'Requester Barcode': rq => (rq.requester ? rq.requester.barcode : ''),
      'Request status': rq => rq.status,
      'Type': rq => rq.requestType,
      'Title': rq => (rq.item ? rq.item.title : ''),
    };

    const actionMenuItems = [
      {
        label: <FormattedMessage id="stripes-components.exportToCsv" />,
        onClick: (() => {
          if (!this.csvExportPending) {
            this.props.mutator.resultCount.replace(this.props.resources.records.other.totalRecords);
            this.csvExportPending = true;
          }
        }),
        id: 'exportToCsvPaneHeaderBtn',
      },
    ];

    return (<SearchAndSort
      actionMenuItems={actionMenuItems}
      packageInfo={packageInfo}
      objectName="request"
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      viewRecordComponent={ViewRequest}
      editRecordComponent={RequestForm}
      visibleColumns={['Request Date', 'Title', 'Item barcode', 'Type', 'Request status', 'Position', 'Requester', 'Requester Barcode', 'Proxy']}
      columnWidths={{ 'Request Date': '10%' }}
      resultsFormatter={resultsFormatter}
      newRecordInitialValues={{ requestType: 'Hold', fulfilmentPreference: 'Hold Shelf' }}
      massageNewRecord={this.massageNewRecord}
      onCreate={this.create}
      parentResources={this.props.resources}
      parentMutator={this.props.mutator}
      detailProps={{
        stripes,
        findResource: this.findResource,
        joinRequest: this.addRequestFields,
        optionLists: {
          addressTypes,
          requestTypes,
          fulfilmentTypes,
          servicePoints
        },
        patronGroups,
        uniquenessValidator: this.props.mutator,
      }}
      viewRecordPerms="module.requests.enabled"
      newRecordPerms="module.requests.enabled"
    />);
  }
}

export default injectIntl(Requests);
