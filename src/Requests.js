import { omit, get } from 'lodash';
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
import { AppIcon } from '@folio/stripes/core';
import { Button } from '@folio/stripes/components';
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
    label: <FormattedMessage id="ui-requests.requestMeta.type" />,
    name: 'requestType',
    cql: 'requestType',
    values: [
      { name: 'Holds', cql: 'Hold' },
      { name: 'Pages', cql: 'Page' },
      { name: 'Recalls', cql: 'Recall' },
    ],
  },
  {
    label: <FormattedMessage id="ui-requests.requestMeta.status" />,
    name: 'requestStatus',
    cql: 'status',
    values: [
      { name: 'closed - cancelled', cql: 'Closed - Cancelled' },
      { name: 'closed - filled', cql: 'Closed - Filled' },
      { name: 'closed - pickup expired', cql: 'Closed - Pickup expired' },
      { name: 'closed - unfilled', cql: 'Closed - Unfilled' },
      { name: 'open - awaiting pickup', cql: 'Open - Awaiting pickup' },
      { name: 'open - in transit', cql: 'Open - In transit' },
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
      initialValue: { sort: 'Request Date' },
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
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=userId=%{activeRecord.patronId}',
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockId}',
      },
    },
    activeRecord: {},
  };

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
      activeRecord: PropTypes.shape({
        update: PropTypes.func,
      }),
      patronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
    }).isRequired,
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      query: PropTypes.object,
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
    history: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const {
      intl: { formatMessage }
    } = props;

    this.okapiUrl = props.stripes.okapi.url;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': props.stripes.okapi.tenant,
      'X-Okapi-Token': props.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    this.columnLabels = {
      title: formatMessage({ id: 'ui-requests.requests.title' }),
      type: formatMessage({ id: 'ui-requests.requests.type' }),
      requestStatus: formatMessage({ id: 'ui-requests.requests.status' }),
      requesterBarcode: formatMessage({ id: 'ui-requests.requests.requesterBarcode' }),
      requester: formatMessage({ id: 'ui-requests.requests.requester' }),
      requestDate: formatMessage({ id: 'ui-requests.requests.requestDate' }),
      proxy: formatMessage({ id: 'ui-requests.requests.proxy' }),
      position: formatMessage({ id: 'ui-requests.requests.position' }),
      itemBarcode: formatMessage({ id: 'ui-requests.requests.itemBarcode' })
    };

    this.addRequestFields = this.addRequestFields.bind(this);
    this.create = this.create.bind(this);
    this.findResource = this.findResource.bind(this);
    this.buildRecords = this.buildRecords.bind(this);
    this.headers = ['requestType', 'status', 'requestExpirationDate', 'holdShelfExpirationDate',
      'position', 'item.barcode', 'item.title', 'item.contributorNames', 'item.location.name',
      'item.callNumber', 'item.enumeration', 'item.status', 'loan.dueDate', 'requester.name',
      'requester.barcode', 'requester.patronGroup.group', 'fulfilmentPreference', 'requester.pickupServicePoint',
      'deliveryAddress', 'proxy.name', 'proxy.barcode'];

    // Map to pass into exportCsv
    this.columnHeadersMap = this.headers.map(item => {
      return {
        label: this.props.intl.formatMessage({ id: `ui-requests.${item}` }),
        value: item
      };
    });

    this.state = { submitting: false };
  }

  static getDerivedStateFromProps(props) {
    const layer = (props.resources.query || {}).layer;
    if (!layer) {
      return { dupRequest: null };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const patronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
    const prevBlocks = get(prevProps.resources, ['patronBlocks', 'records'], []);
    const { submitting } = this.state;
    const prevExpirated = prevBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expirated = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];

    if (prevExpirated.length > 0 && expirated.length === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: false });
    }

    if (expirated.length > 0 && !submitting) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });
      expirated.forEach(p => {
        this.props.mutator.activeRecord.update({ blockId: p.id });
        this.props.mutator.patronBlocks.DELETE({ id: p.id });
      });
    }

    if (this.csvExportPending) {
      const recordsLoaded = this.props.resources.records.records;
      const numTotalRecords = this.props.resources.records.other.totalRecords;
      if (recordsLoaded.length === numTotalRecords) {
        const columnHeadersMap = this.columnHeadersMap;
        const onlyFields = columnHeadersMap;
        const clonedRequests = JSON.parse(JSON.stringify(recordsLoaded)); // Do not mutate the actual resource
        const recordsToCSV = this.buildRecords(clonedRequests);
        exportCsv(recordsToCSV, {
          onlyFields,
          excludeFields: ['id'],
        });
        this.csvExportPending = false;
      }
    }
  }

  buildRecords(recordsLoaded) {
    const { formatDate, formatTime } = this.props.intl;
    recordsLoaded.forEach(record => {
      const contributorNamesMap = [];
      if (record.item.contributorNames.length > 0) {
        record.item.contributorNames.forEach(item => {
          contributorNamesMap.push(item.name);
        });
      }
      if (record.requester) {
        const { firstName, middleName, lastName } = record.requester;
        record.requester.name = `${firstName || ''} ${middleName || ''} ${lastName || ''}`;
      }
      if (record.loan) {
        const { dueDate } = record.loan;
        record.loan.dueDate = `${formatDate(dueDate)}, ${formatTime(dueDate)}`;
      }
      if (record.proxy) {
        const { firstName, middleName, lastName } = record.proxy;
        record.proxy.name = `${firstName || ''} ${middleName || ''} ${lastName || ''}`;
      }
      if (record.deliveryAddress) {
        const { addressLine1, city, region, postalCode, countryId } = record.deliveryAddress;
        record.deliveryAddress = `${addressLine1 || ''} ${city || ''} ${region || ''} ${countryId || ''} ${postalCode || ''}`;
      }
      record.item.contributorNames = contributorNamesMap.join('; ');
    });
    return recordsLoaded;
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
        this.findResource('requestsForItem', r.itemId),
      ],
    ).then((resultArray) => {
      // Each element of the promises array returns an array of results, but in
      // this case, there should only ever be one result for each.
      const requester = resultArray[0].users[0];
      const requestCount = resultArray[1].requests.length;
      return Object.assign({}, r, { requester, requestCount });
    });
  }

  massageNewRecord = (requestData) => {
    const { intl: { timeZone } } = this.props;
    const isoDate = moment.tz(timeZone).format();
    Object.assign(requestData, { requestDate: isoDate });
  }

  onChangePatron = (patron) => {
    this.props.mutator.activeRecord.update({ patronId: patron.id });
  }

  create = data => this.props.mutator.records.POST(data).then(() => this.props.mutator.query.update({ layer: null }));

  onDuplicate = (request) => {
    const dupRequest = omit(request, [
      'id',
      'metadata',
      'status',
      'requestCount',
      'position',
      'requester',
    ]);

    this.setState({ dupRequest });
    this.props.mutator.query.update({
      layer: 'create',
      itemBarcode: request.item.barcode,
      userBarcode: request.requester.barcode,
    });
  }

  render() {
    const {
      resources,
      mutator,
      stripes,
      history,
    } = this.props;

    const {
      itemBarcode,
      position,
      proxy,
      requestDate,
      requester,
      requesterBarcode,
      requestStatus,
      type,
      title,
    } = this.columnLabels;

    const {
      dupRequest
    } = this.state;

    const patronGroups = (resources.patronGroups || {}).records || [];
    const addressTypes = (resources.addressTypes || {}).records || [];
    const servicePoints = (resources.servicePoints || {}).records || [];
    const InitialValues = dupRequest ||
      { requestType: 'Hold', fulfilmentPreference: 'Hold Shelf' };

    const resultsFormatter = {
      [itemBarcode]: rq => (rq.item ? rq.item.barcode : ''),
      [position]: rq => (rq.position || ''),
      [proxy]: rq => (rq.proxy ? getFullName(rq.proxy) : ''),
      [requestDate]: rq => (
        <AppIcon size="small" app="requests">
          <FormattedTime value={rq.requestDate} day="numeric" month="numeric" year="numeric" />
        </AppIcon>
      ),
      [requester]: rq => (rq.requester ? `${rq.requester.lastName}, ${rq.requester.firstName}` : ''),
      [requesterBarcode]: rq => (rq.requester ? rq.requester.barcode : ''),
      [requestStatus]: rq => rq.status,
      [type]: rq => rq.requestType,
      [title]: rq => (rq.item ? rq.item.title : ''),
    };

    const actionMenu = ({ onToggle }) => (
      <Button
        buttonStyle="dropdownItem"
        id="exportToCsvPaneHeaderBtn"
        onClick={() => {
          if (!this.csvExportPending) {
            mutator.resultCount.replace(resources.records.other.totalRecords);
            this.csvExportPending = true;
          }
          onToggle();
        }}
      >
        <FormattedMessage id="stripes-components.exportToCsv" />
      </Button>
    );

    return (
      <div data-test-request-instances>
        <SearchAndSort
          actionMenu={actionMenu}
          packageInfo={packageInfo}
          objectName="request"
          filterConfig={filterConfig}
          initialResultCount={INITIAL_RESULT_COUNT}
          resultCountIncrement={RESULT_COUNT_INCREMENT}
          viewRecordComponent={ViewRequest}
          editRecordComponent={RequestForm}
          visibleColumns={[
            requestDate,
            title,
            itemBarcode,
            type,
            requestStatus,
            position,
            requester,
            requesterBarcode,
            proxy,
          ]}
          columnWidths={{
            [requestDate]: '220px'
          }}
          resultsFormatter={resultsFormatter}
          newRecordInitialValues={InitialValues}
          massageNewRecord={this.massageNewRecord}
          onCreate={this.create}
          parentResources={resources}
          parentMutator={mutator}
          detailProps={{
            onChangePatron: this.onChangePatron,
            stripes,
            history,
            findResource: this.findResource,
            joinRequest: this.addRequestFields,
            optionLists: {
              addressTypes,
              requestTypes,
              fulfilmentTypes,
              servicePoints
            },
            patronGroups,
            query: resources.query,
            uniquenessValidator: mutator,
            onDuplicate: this.onDuplicate,
          }}
          viewRecordPerms="module.requests.enabled"
          newRecordPerms="module.requests.enabled"
        />
      </div>);
  }
}

export default injectIntl(Requests);
