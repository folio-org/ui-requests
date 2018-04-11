import React from 'react';
import PropTypes from 'prop-types';
import fetch from 'isomorphic-fetch';
import moment from 'moment-timezone';
import { filters2cql } from '@folio/stripes-components/lib/FilterGroups';
import SearchAndSort from '@folio/stripes-smart-components/lib/SearchAndSort';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';
import { requestTypes, fulfilmentTypes } from './constants';
import packageInfo from './package';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Request type',
    name: 'requestType',
    cql: 'requestType',
    values: [
      { name: 'Holds', cql: 'Hold' },
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
  static contextTypes = {
    stripes: PropTypes.object,
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
    }).isRequired,
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isPending,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

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
              Title: 'item.title',
              'Item Barcode': 'item.barcode',
              'Request Type': 'requestType',
              Requester: 'requester.lastName requester.firstName',
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
  };

  constructor(props, context) {
    super(props);

    this.okapiUrl = context.stripes.okapi.url;
    this.formatDate = context.stripes.formatDate;
    this.formatDateTime = context.stripes.formatDateTime;
    this.timezone = context.stripes.timezone;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': context.stripes.okapi.tenant,
      'X-Okapi-Token': context.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.addRequestFields = this.addRequestFields.bind(this);
    this.create = this.create.bind(this);
    this.findItem = this.findItem.bind(this);
    this.findLoan = this.findLoan.bind(this);
    this.findRequestsForItem = this.findRequestsForItem.bind(this);
    this.findUser = this.findUser.bind(this);
  }

  // idType can be 'id', 'barcode', etc.
  findUser(value, idType = 'id') {
    return fetch(`${this.okapiUrl}/users?query=(${idType}="${value}")`, { headers: this.httpHeaders }).then(response => response.json());
  }

  // idType can be 'id', 'barcode', etc.
  findItem(value, idType = 'id') {
    return fetch(`${this.okapiUrl}/inventory/items?query=(${idType}="${value}")`, { headers: this.httpHeaders }).then(response => response.json());
  }

  findLoan(itemId) {
    return fetch(`${this.okapiUrl}/circulation/loans?query=(itemId="${itemId}" and status.name<>"Closed")`, { headers: this.httpHeaders }).then(response => response.json());
  }

  findRequestsForItem(itemId) {
    return fetch(`${this.okapiUrl}/request-storage/requests?query=(itemId="${itemId}")`, { headers: this.httpHeaders }).then(response => response.json());
  }

  // Called as a map function
  addRequestFields(r) {
    return Promise.all(
      [
        this.findUser(r.requesterId),
        this.findItem(r.itemId),
        this.findLoan(r.itemId),
        this.findRequestsForItem(r.itemId),
      ],
    ).then((resultArray) => {
      // Each element of the promises array returns an array of results, but in
      // this case, there should only ever be one result for each.
      const user = resultArray[0].users[0];
      const item = resultArray[1].items[0];
      const loan = resultArray[2].loans[0];
      const requestCount = resultArray[3].requests.length;

      const enhancedRequest = Object.assign({}, r);
      enhancedRequest.requesterName = (user && user.personal) ? `${user.personal.firstName} ${user.personal.lastName}` : '';
      enhancedRequest.requesterBarcode = (user && user.personal) ? user.barcode : '';
      enhancedRequest.patronGroup = (user && user.personal) ? user.patronGroup : '';
      enhancedRequest.requester.addresses = (user && user.personal && user.personal.addresses) ? user.personal.addresses : [];

      enhancedRequest.title = item ? item.title : '';
      enhancedRequest.itemBarcode = item ? item.barcode : '';
      enhancedRequest.itemStatus = item ? item.status : '';
      enhancedRequest.location = (item && item.location) ? item.location.name : '';

      enhancedRequest.loan = loan;
      enhancedRequest.itemRequestCount = requestCount;

      return enhancedRequest;
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
    const addressTypes = (resources.addressTypes && resources.addressTypes.hasLoaded) ? resources.addressTypes.records : [];

    const resultsFormatter = {
      'Item barcode': rq => (rq.item ? rq.item.barcode : ''),
      Position: () => '', // TODO: add correct function once this is implemented
      Proxy: () => '', // TODO: add correct function once this is implemented
      'Request date': rq => this.makeLocaleDateTimeString(rq.requestDate),
      Requester: rq => (rq.requester ? `${rq.requester.lastName}, ${rq.requester.firstName}` : ''),
      'Requester barcode': rq => (rq.requester ? rq.requester.barcode : ''),
      'Request status': rq => rq.status,
      Type: rq => rq.requestType,
      Title: rq => (rq.item ? rq.item.title : ''),
    };

    return (<SearchAndSort
      packageInfo={packageInfo}
      objectName="request"
      filterConfig={filterConfig}
      initialResultCount={INITIAL_RESULT_COUNT}
      resultCountIncrement={RESULT_COUNT_INCREMENT}
      viewRecordComponent={ViewRequest}
      editRecordComponent={RequestForm}
      visibleColumns={['Request date', 'Title', 'Item barcode', 'Type', 'Request status', 'Position', 'Requester', 'Requester barcode', 'Proxy']}
      columnWidths={{ 'Request date': '10%' }}
      resultsFormatter={resultsFormatter}
      newRecordInitialValues={{ requestType: 'Hold', fulfilmentPreference: 'Hold Shelf' }}
      massageNewRecord={this.massageNewRecord}
      onCreate={this.create}
      parentResources={this.props.resources}
      parentMutator={this.props.mutator}
      detailProps={{
        stripes,
        findItem: this.findItem,
        findLoan: this.findLoan,
        findUser: this.findUser,
        findRequestsForItem: this.findRequestsForItem,
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
