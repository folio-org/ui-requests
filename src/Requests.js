import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import moment from 'moment-timezone';
import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import SearchAndSort from '@folio/stripes-smart-components/lib/SearchAndSort';
import exportToCsv from '@folio/stripes-util/lib/exportCsv';

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
          query: (...args) => {
            /*
              As per other SearchAndSort modules (users, instances) ...
              This code is not DRY as it is copied from makeQueryFunction in stripes-components.
              This is necessary, as makeQueryFunction only referneces query paramaters as a data source.
              STRIPES-480 is intended to correct this and allow this query function to be replace with a call
              to makeQueryFunction.
              https://issues.folio.org/browse/STRIPES-480
            */
            const resourceData = args[2];
            const sortMap = {
              'Title': 'item.title',
              'Item barcode': 'item.barcode',
              'Type': 'requestType',
              'Requester': 'requester.lastName requester.firstName',
              'Requester Barcode': 'requester.barcode',
              'Request Date': 'requestDate',
            };
            let cql = `(requester.barcode="${resourceData.query.query}*" or item.title="${resourceData.query.query}*" or item.barcode="${resourceData.query.query}*")`;
            const filterCql = filters2cql(filterConfig, resourceData.query.filters);

            if (filterCql) {
              if (cql) {
                cql = `(${cql}) and ${filterCql}`;
              } else {
                cql = filterCql;
              }
            }

            const { sort } = resourceData.query;
            if (sort) {
              const sortIndexes = sort.split(',').map((sort1) => {
                let reverse = false;
                if (sort1.startsWith('-')) {
                  // eslint-disable-next-line no-param-reassign
                  sort1 = sort1.substr(1);
                  reverse = true;
                }
                let sortIndex = sortMap[sort1] || sort1;
                if (reverse) {
                  sortIndex = `${sortIndex.replace(' ', '/sort.descending ')}/sort.descending`;
                }
                return sortIndex;
              });

              cql += ` sortby ${sortIndexes.join(' ')}`;
            }
            return cql;
          },
        },
        staticFallback: { params: {} },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
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
      formatDateTime: PropTypes.func.isRequired,
      locale: PropTypes.string,
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
      timezone: PropTypes.string.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);

    this.okapiUrl = props.stripes.okapi.url;
    this.formatDate = props.stripes.formatDate;
    this.formatDateTime = props.stripes.formatDateTime;
    this.timezone = props.stripes.timezone;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': props.stripes.okapi.tenant,
      'X-Okapi-Token': props.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.addRequestFields = this.addRequestFields.bind(this);
    this.create = this.create.bind(this);
    this.findResource = this.findResource.bind(this);
  }

  componentDidUpdate() {
    if (this.csvExportPending) {
      const recordsLoaded = this.props.resources.records.records;
      const numTotalRecords = this.props.resources.records.other.totalRecords;
      if (recordsLoaded.length === numTotalRecords) {
        exportToCsv(recordsLoaded, {
          excludeFields: ['id'],
          explicitlyIncludeFields: ['proxy.firstName', 'proxy.lastName', 'proxy.barcode']
        });
        this.csvExportPending = false;
      }
    }
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
    const isoDate = moment.tz(this.timezone).format();
    Object.assign(requestData, { requestDate: isoDate });
  }

  create = data => this.props.mutator.records.POST(data).then(() => this.props.mutator.query.update({ layer: null }));

  // Helper function to form a locale-aware date for display
  makeLocaleDateString = (dateString) => {
    if (dateString === '') {
      return '';
    }
    return this.formatDate(dateString);
  };

  makeLocaleDateTimeString = (dateString) => {
    if (dateString === '') {
      return '';
    }

    return this.formatDateTime(dateString);
  }

  render() {
    const { resources, stripes } = this.props;
    const patronGroups = resources.patronGroups;// (resources.patronGroups || {}).records || [];
    const addressTypes = (resources.addressTypes && resources.addressTypes.hasLoaded) ? resources.addressTypes : [];

    const resultsFormatter = {
      'Item barcode': rq => (rq.item ? rq.item.barcode : ''),
      'Position': rq => (rq.position || ''),
      'Proxy': rq => (rq.proxy ? getFullName(rq.proxy) : ''),
      'Request Date': rq => this.makeLocaleDateTimeString(rq.requestDate),
      'Requester': rq => (rq.requester ? `${rq.requester.lastName}, ${rq.requester.firstName}` : ''),
      'Requester Barcode': rq => (rq.requester ? rq.requester.barcode : ''),
      'Request status': rq => rq.status,
      'Type': rq => rq.requestType,
      'Title': rq => (rq.item ? rq.item.title : ''),
    };

    const actionMenuItems = [
      {
        label: stripes.intl.formatMessage({ id: 'stripes-components.exportToCsv' }),
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
        },
        patronGroups,
        dateFormatter: this.makeLocaleDateString,
        uniquenessValidator: this.props.mutator,
      }}
      viewRecordPerms="module.requests.enabled"
      newRecordPerms="module.requests.enabled"
    />);
  }
}

export default Requests;
