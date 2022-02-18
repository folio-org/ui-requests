import {
  get,
  isEmpty,
  isArray,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { stringify } from 'query-string';
import moment from 'moment-timezone';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { SubmissionError } from 'redux-form';
import {
  AppIcon,
  stripesConnect,
  IfPermission,
  CalloutContext,
} from '@folio/stripes/core';
import {
  Button,
  filters2cql,
  FormattedTime,
  MenuSection,
} from '@folio/stripes/components';
import {
  deparseFilters,
  makeQueryFunction,
  SearchAndSort,
} from '@folio/stripes/smart-components';
import { exportCsv } from '@folio/stripes/util';

import ViewRequest from '../ViewRequest';
import RequestForm from '../RequestForm';
import {
  reportHeaders,
  fulfilmentTypes,
  expiredHoldsReportHeaders,
  pickSlipType,
  createModes,
  requestStatusesTranslations,
  requestTypesTranslations,
  REQUEST_LEVEL_TYPES,
  DEFAULT_DISPLAYED_YEARS_AMOUNT,
  requestStatuses,
} from '../constants';
import {
  buildUrl,
  getFullName,
  duplicateRequest,
  convertToSlipData,
  getTlrSettings,
  getInstanceQueryString,
  isDuplicateMode,
} from '../utils';
import packageInfo from '../../package';
import {
  PrintButton,
  PrintContent,
  ErrorModal,
  LoadingButton,
} from '../components';

import {
  RequestsFilters,
  RequestsFiltersConfig,
} from '../components/RequestsFilters';
import { getFormattedYears } from './utils';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const urls = {
  user: (value, idType) => {
    const query = stringify({ query: `(${idType}=="${value}")` });
    return `users?${query}`;
  },
  item: (value, idType) => {
    let query;

    if (isArray(value)) {
      query = `(${value.map((valueItem) => `${idType}=="${valueItem}"`).join(' or ')})`;
    } else {
      query = `(${idType}=="${value}")`;
    }

    query = stringify({ query });
    return `inventory/items?${query}`;
  },
  instance: (value) => {
    const query = stringify({ query: getInstanceQueryString(value) });

    return `inventory/instances?${query}`;
  },
  loan: (value) => {
    const query = stringify({ query: `(itemId=="${value}") and status=Open` });
    return `circulation/loans?${query}`;
  },
  requestsForItem: (value) => {
    const query = stringify({ query: `(itemId=="${value}" and status=Open)` });
    return `circulation/requests?${query}`;
  },
  requestsForInstance: (value) => {
    const query = stringify({ query: `(instanceId=="${value}" and status=Open)` });

    return `circulation/requests?${query}`;
  },
  requestPreferences: (value) => {
    const query = stringify({ query: `(userId=="${value}")` });
    return `request-preference-storage/request-preference?${query}`;
  },
  holding: (value, idType) => {
    const query = stringify({ query: `(${idType}=="${value}")` });
    return `holdings-storage/holdings?${query}`;
  },
};

export const buildHoldRecords = (records) => {
  return records.map(record => {
    if (record.requester) {
      const {
        firstName,
        lastName,
      } = record.requester;

      record.requester.name = [lastName, firstName].filter(namePart => namePart).join(', ');
    }

    return record;
  });
};

class RequestsRoute extends React.Component {
  static contextType = CalloutContext;

  static manifest = {
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
    query: {
      initialValue: { sort: 'requestDate' },
    },
    resultCount: { initialValue: INITIAL_RESULT_COUNT },
    resultOffset: { initialValue: 0 },
    records: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      resultOffset: '%{resultOffset}',
      perRequest: 100,
      throwErrors: false,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(requesterId=="%{query.query}" or requester.barcode="%{query.query}*" or instance.title="%{query.query}*" or instanceId="%{query.query}*" or item.barcode=="%{query.query}*" or itemId=="%{query.query}" or itemIsbn="%{query.query}")',
            {
              'title': 'instance.title',
              'instanceId': 'instanceId',
              'publication': 'instance.publication',
              'itemBarcode': 'item.barcode',
              'type': 'requestType',
              'requester': 'requester.lastName requester.firstName',
              'requestStatus': 'status',
              'requesterBarcode': 'requester.barcode',
              'requestDate': 'requestDate',
              'position': 'position',
              'proxy': 'proxy',
            },
            RequestsFiltersConfig,
            2, // do not fetch unless we have a query or a filter
          ),
        },
        staticFallback: { params: {} },
      },
    },
    reportRecords: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      perRequest: 1000,
      throwErrors: false,
      accumulate: true,
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      params: {
        query: 'cql.allRecords=1 sortby group',
        limit: '200',
      },
      records: 'usergroups',
    },
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: 'service-points?query=(pickupLocation==true) sortby name&limit=100',
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
    instanceUniquenessValidator: {
      type: 'okapi',
      records: 'instances',
      accumulate: true,
      path: 'inventory/instances',
      fetch: false,
    },
    patronBlocks: {
      type: 'okapi',
      records: 'manualblocks',
      path: 'manualblocks?query=userId==%{activeRecord.patronId}',
      DELETE: {
        path: 'manualblocks/%{activeRecord.blockId}',
      },
    },
    automatedPatronBlocks: {
      type: 'okapi',
      records: 'automatedPatronBlocks',
      path: 'automated-patron-blocks/%{activeRecord.patronId}',
    },
    activeRecord: {},
    expiredHolds: {
      accumulate: 'true',
      type: 'okapi',
      path: 'circulation/requests-report/expired-holds',
      fetch: false,
    },
    cancellationReasons: {
      type: 'okapi',
      path: 'cancellation-reason-storage/cancellation-reasons',
      records: 'cancellationReasons',
    },
    staffSlips: {
      type: 'okapi',
      records: 'staffSlips',
      path: 'staff-slips-storage/staff-slips?limit=100',
      throwErrors: false,
    },
    pickSlips: {
      type: 'okapi',
      records: 'pickSlips',
      path: 'circulation/pick-slips/%{currentServicePoint.id}',
      fetch: true,
      throwErrors: false,
    },
    currentServicePoint: {},
    tags: {
      throwErrors: false,
      type: 'okapi',
      path: 'tags',
      params: {
        query: 'cql.allRecords=1 sortby label',
        limit: '10000',
      },
      records: 'tags',
    },
    proxy: {
      type: 'okapi',
      records: 'proxiesFor',
      path: 'proxiesfor',
      accumulate: true,
      fetch: false,
    },
    configs: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries',
      params: {
        query: '(module==SETTINGS and configName==TLR)',
      },
    },
  };

  static propTypes = {
    intl: PropTypes.object,
    mutator: PropTypes.shape({
      records: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      reportRecords: PropTypes.shape({
        GET: PropTypes.func,
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
      expiredHolds: PropTypes.shape({
        GET: PropTypes.func,
        reset: PropTypes.func,
      }),
      patronBlocks: PropTypes.shape({
        DELETE: PropTypes.func,
      }),
      staffSlips: PropTypes.shape({
        GET: PropTypes.func,
      }),
      pickSlips: PropTypes.shape({
        GET: PropTypes.func,
      }).isRequired,
      currentServicePoint: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
      proxy: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      currentServicePoint: PropTypes.object.isRequired,
      query: PropTypes.object,
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }),
      pickSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
        isPending: PropTypes.bool,
      }),
      configs: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
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
      user: PropTypes.object.isRequired,
      timezone: PropTypes.string.isRequired,
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.object,
    location: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const { intl: { formatMessage } } = props;
    const {
      titleLevelRequestsFeatureEnabled = false,
      createTitleLevelRequestsByDefault = false,
    } = getTlrSettings(props.resources.configs.records[0]?.value);

    this.okapiUrl = props.stripes.okapi.url;
    this.httpHeaders = {
      'X-Okapi-Tenant': props.stripes.okapi.tenant,
      'X-Okapi-Token': props.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    };

    this.columnLabels = {
      requestDate: formatMessage({ id: 'ui-requests.requests.requestDate' }),
      title: formatMessage({ id: 'ui-requests.requests.title' }),
      year: formatMessage({ id: 'ui-requests.requests.year' }),
      itemBarcode: formatMessage({ id: 'ui-requests.requests.itemBarcode' }),
      type: formatMessage({ id: 'ui-requests.requests.type' }),
      requestStatus: formatMessage({ id: 'ui-requests.requests.status' }),
      position: formatMessage({ id: 'ui-requests.requests.queuePosition' }),
      requester: formatMessage({ id: 'ui-requests.requests.requester' }),
      requesterBarcode: formatMessage({ id: 'ui-requests.requests.requesterBarcode' }),
      proxy: formatMessage({ id: 'ui-requests.requests.proxy' }),
    };

    this.addRequestFields = this.addRequestFields.bind(this);
    this.processError = this.processError.bind(this);
    this.create = this.create.bind(this);
    this.findResource = this.findResource.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.buildRecords = this.buildRecords.bind(this);
    // Map to pass into exportCsv
    this.columnHeadersMap = this.getColumnHeaders(reportHeaders);
    this.expiredHoldsReportColumnHeaders = this.getColumnHeaders(expiredHoldsReportHeaders);

    this.state = {
      csvReportPending: false,
      submitting: false,
      errorMessage: '',
      errorModalData: {},
      servicePointId: '',
      requests: [],
      titleLevelRequestsFeatureEnabled,
      createTitleLevelRequestsByDefault,
    };

    this.printContentRef = React.createRef();
  }

  static getDerivedStateFromProps(props) {
    const layer = (props.resources.query || {}).layer;
    if (!layer) {
      return { dupRequest: null };
    }

    return null;
  }

  componentDidMount() {
    this.setCurrentServicePointId();
  }

  componentDidUpdate(prevProps) {
    const patronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
    const prevBlocks = get(prevProps.resources, ['patronBlocks', 'records'], []);
    const { submitting } = this.state;
    const prevExpired = prevBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expired = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const { id: currentServicePointId } = this.getCurrentServicePointInfo();
    const prevStateServicePointId = get(prevProps.resources.currentServicePoint, 'id');
    const { configs: prevConfigs } = prevProps.resources;
    const { configs } = this.props.resources;

    if (prevExpired.length > 0 && expired.length === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: false });
    }

    if (expired.length > 0 && !submitting) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });
      expired.forEach(p => {
        this.props.mutator.activeRecord.update({ blockId: p.id });
        this.props.mutator.patronBlocks.DELETE({ id: p.id });
      });
    }

    if (prevStateServicePointId !== currentServicePointId) {
      this.setCurrentServicePointId();
    }

    if (prevConfigs.hasLoaded !== configs.hasLoaded && configs.hasLoaded) {
      const {
        titleLevelRequestsFeatureEnabled = false,
        createTitleLevelRequestsByDefault = false,
      } = getTlrSettings(configs.records[0]?.value);

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        titleLevelRequestsFeatureEnabled,
        createTitleLevelRequestsByDefault,
      });
    }
  }

  async fetchReportData(mutator, query) {
    const { GET, reset } = mutator;

    const limit = 1000;
    const data = [];
    let offset = 0;
    let hasData = true;

    while (hasData) {
      try {
        reset();
        // eslint-disable-next-line no-await-in-loop
        const result = await GET({ params: { query, limit, offset } });
        hasData = result.length;
        offset += limit;
        if (hasData) {
          data.push(...result);
        }
      } catch (err) {
        hasData = false;
      }
    }

    return data;
  }

  // Export function for the CSV search report action
  async exportData() {
    this.setState({ csvReportPending: true });

    // Build a custom query for the CSV record export, which has to include
    // all search and filter parameters
    const queryClauses = [];
    let queryString;

    const queryTerm = this.props.resources?.query?.query;
    const filterQuery = filters2cql(RequestsFiltersConfig, deparseFilters(this.getActiveFilters()));

    if (queryTerm) {
      queryString = `(requesterId=="${queryTerm}" or requester.barcode="${queryTerm}*" or item.title="${queryTerm}*" or item.barcode=="${queryTerm}*" or itemId=="${queryTerm}")`;
      queryClauses.push(queryString);
    }

    if (filterQuery) queryClauses.push(filterQuery);

    queryString = queryClauses.join(' and ');
    const records = await this.fetchReportData(this.props.mutator.reportRecords, queryString);
    const recordsToCSV = this.buildRecords(records);

    exportCsv(recordsToCSV, {
      onlyFields: this.columnHeadersMap,
      excludeFields: ['id'],
    });

    this.setState({ csvReportPending: false });
  }

  getCurrentServicePointInfo = () => {
    const { stripes } = this.props;

    const currentState = stripes.store.getState();
    const id = get(currentState, 'okapi.currentUser.curServicePoint.id');
    const name = get(currentState, 'okapi.currentUser.curServicePoint.name');

    return { id, name };
  };

  setCurrentServicePointId = () => {
    const { mutator } = this.props;
    const { id } = this.getCurrentServicePointInfo();

    mutator.currentServicePoint.update({ id });
    this.buildRecordsForHoldsShelfReport();
  };

  getColumnHeaders = (headers) => {
    const { intl: { formatMessage } } = this.props;

    return headers.map(item => ({
      label: formatMessage({ id: `ui-requests.${item}` }),
      value: item,
    }));
  };

  buildRecords(recordsLoaded) {
    const result = JSON.parse(JSON.stringify(recordsLoaded)); // Do not mutate the actual resource
    const { formatDate, formatTime } = this.props.intl;

    result.forEach(record => {
      const contributorNamesMap = [];
      const tagListMap = [];

      if (record.instance.contributorNames && record.instance.contributorNames.length > 0) {
        record.instance.contributorNames.forEach(item => {
          contributorNamesMap.push(item.name);
        });
      }
      if (record.tags && record.tags.tagList.length > 0) {
        record.tags.tagList.forEach(item => {
          tagListMap.push(item);
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
      record.instance.contributorNames = contributorNamesMap.join('; ');
      if (record.tags) record.tags.tagList = tagListMap.join('; ');
    });

    return result;
  }

  // idType can be 'id', 'barcode', etc.
  findResource(resource, value, idType = 'id') {
    const query = urls[resource](value, idType);
    const options = { headers: this.httpHeaders };
    return fetch(`${this.okapiUrl}/${query}`, options).then(response => response.json());
  }

  toggleModal() {
    this.setState({ errorMessage: '' });
  }

  // Called as a map function
  addRequestFields(request) {
    const {
      requesterId,
      instanceId,
      itemId,
    } = request;
    const { titleLevelRequestsFeatureEnabled } = this.state;

    return Promise.all(
      [
        this.findResource('user', requesterId),
        this.findResource('requestsForInstance', instanceId),
        ...(itemId
          ? [
            this.findResource('requestsForItem', itemId),
          ]
          : []),
      ],
    ).then(([users, titleRequests, itemRequests]) => {
      // Each element of the promises array returns an array of results, but in
      // this case, there should only ever be one result for each.
      const requester = get(users, 'users[0]', null);
      const titleRequestCount = get(titleRequests, 'totalRecords', 0);
      const dynamicProperties = {};
      const requestsForFilter = titleLevelRequestsFeatureEnabled ? titleRequests : itemRequests;

      dynamicProperties.numberOfNotYetFilledRequests = requestsForFilter.requests.filter(currentRequest => currentRequest.status === requestStatuses.NOT_YET_FILLED).length;

      if (itemId) {
        dynamicProperties.itemRequestCount = get(itemRequests, 'totalRecords', 0);
      }

      return {
        ...request,
        requester,
        titleRequestCount,
        ...dynamicProperties,
      };
    });
  }

  getHelperResourcePath = (helper, id) => `circulation/requests/${id}`;

  massageNewRecord = (requestData) => {
    const { intl: { timeZone } } = this.props;
    const isoDate = moment.tz(timeZone).format();
    Object.assign(requestData, { requestDate: isoDate });
  };

  onChangePatron = (patron) => {
    this.props.mutator.activeRecord.update({ patronId: patron.id });
  };

  create = (data) => {
    const {
      firstName,
      lastName,
    } = data.requester.personal;
    const query = new URLSearchParams(this.props.location.search);
    const mode = query.get('mode');

    return this.props.mutator.records.POST(data)
      .then(() => {
        this.closeLayer();

        if (!isDuplicateMode(mode)) {
          this.context.sendCallout({
            message: (
              <FormattedMessage
                id="ui-requests.createRequest.success"
                values={{ requester: `${lastName}, ${firstName}` }}
              />
            ),
          });
        }
      })
      .catch(resp => {
        this.processError(resp);

        if (!isDuplicateMode(mode)) {
          this.context.sendCallout({
            message: <FormattedMessage id="ui-requests.createRequest.fail" />,
            type: 'error',
          });
        }
      });
  };

  processError(resp) {
    const contentType = resp.headers.get('Content-Type') || '';
    if (contentType.startsWith('application/json')) {
      return resp.json().then(error => this.handleJsonError(error));
    } else {
      return resp.text().then(error => this.handleTextError(error));
    }
  }

  handleTextError(error) {
    const item = { barcode: error };
    throw new SubmissionError({ item });
  }

  handleJsonError({ errors }) {
    const errorMessages = [];
    errors.forEach(({ message }) => errorMessages.push(message));
    this.setState({ errorMessage: errorMessages.join(';') });
  }

  handleCloseNewRecord = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.closeLayer();
  };

  closeLayer() {
    const url = buildUrl(this.props.location, {
      layer: null,
      itemBarcode: null,
      userBarcode: null,
      itemId: null,
      instanceId: null,
      query: null,
    });

    this.props.history.push(url);
  }

  onDuplicate = (request) => {
    const dupRequest = duplicateRequest(request);

    const newRequestData = {
      layer: 'create',
      instanceId: request.instanceId,
      userBarcode: request.requester.barcode,
      mode: createModes.DUPLICATE,
    };

    if (request.requestLevel === REQUEST_LEVEL_TYPES.ITEM) {
      newRequestData.itemBarcode = request.item.barcode;
      newRequestData.itemId = request.itemId;
    }

    this.setState({ dupRequest });
    this.props.mutator.query.update(newRequestData);
  };

  buildRecordsForHoldsShelfReport = async () => {
    const {
      mutator: {
        expiredHolds: {
          reset,
          GET,
        },
      },
      stripes: { user },
    } = this.props;

    this.setState({
      holdsShelfReportPending: true,
    });

    reset();

    const servicePointId = get(user, 'user.curServicePoint.id', '');
    const path = `circulation/requests-reports/hold-shelf-clearance/${servicePointId}`;
    const { requests } = await GET({ path });

    this.setState({
      servicePointId,
      requests,
      holdsShelfReportPending: false,
    });
  }

  exportExpiredHoldsToCSV = async () => {
    const {
      servicePointId,
      requests,
    } = this.state;

    if (!servicePointId) {
      this.setState(
        {
          errorModalData: {
            errorMessage: 'ui-requests.noServicePoint.errorMessage',
            label: 'ui-requests.noServicePoint.label',
          },
        }
      );

      return;
    }

    const recordsToCSV = buildHoldRecords(requests);
    exportCsv(recordsToCSV, {
      onlyFields: this.expiredHoldsReportColumnHeaders,
      excludeFields: ['id'],
    });
  };

  errorModalClose = () => {
    this.setState({ errorModalData: {} });
  };

  getPrintTemplate() {
    const staffSlips = get(this.props.resources, 'staffSlips.records', []);
    const pickSlip = staffSlips.find(slip => slip.name.toLowerCase() === pickSlipType);
    return get(pickSlip, 'template', '');
  }

  handleFilterChange = ({ name, values }) => {
    const { mutator } = this.props;
    const newFilters = {
      ...this.getActiveFilters(),
      [name]: values,
    };

    const filters = Object.keys(newFilters)
      .map((filterName) => {
        return newFilters[filterName]
          .map((filterValue) => `${filterName}.${filterValue}`)
          .join(',');
      })
      .filter(filter => filter)
      .join(',');

    mutator.query.update({ filters });
  };

  getActiveFilters = () => {
    const { query } = this.props.resources;

    if (!query || !query.filters) return {};

    return query.filters
      .split(',')
      .reduce((filterMap, currentFilter) => {
        const [name, value] = currentFilter.split('.');

        if (!Array.isArray(filterMap[name])) {
          filterMap[name] = [];
        }

        filterMap[name].push(value);

        return filterMap;
      }, {});
  }

  renderFilters = (onChange) => {
    const { resources } = this.props;
    const { titleLevelRequestsFeatureEnabled } = this.state;

    return (
      <RequestsFilters
        activeFilters={this.getActiveFilters()}
        resources={resources}
        onChange={onChange}
        onClear={(name) => onChange({ name, values: [] })}
        titleLevelRequestsFeatureEnabled={titleLevelRequestsFeatureEnabled}
      />
    );
  };

  render() {
    const {
      resources,
      mutator,
      stripes,
      history,
      intl,
      stripes: {
        timezone,
        locale,
      },
    } = this.props;

    const {
      csvReportPending,
      dupRequest,
      errorMessage,
      errorModalData,
      requests,
      servicePointId,
      holdsShelfReportPending,
      createTitleLevelRequestsByDefault,
    } = this.state;
    const { name: servicePointName } = this.getCurrentServicePointInfo();
    const pickSlips = get(resources, 'pickSlips.records', []);
    const patronGroups = get(resources, 'patronGroups.records', []);
    const addressTypes = get(resources, 'addressTypes.records', []);
    const servicePoints = get(resources, 'servicePoints.records', []);
    const cancellationReasons = get(resources, 'cancellationReasons.records', []);
    const requestCount = get(resources, 'records.other.totalRecords', 0);
    const initialValues = dupRequest ||
      {
        requestType: 'Hold',
        fulfilmentPreference: 'Hold Shelf',
        createTitleLevelRequest: createTitleLevelRequestsByDefault,
      };

    const pickSlipsArePending = resources?.pickSlips?.isPending;
    const requestsEmpty = isEmpty(requests);
    const pickSlipsEmpty = isEmpty(pickSlips);
    const printTemplate = this.getPrintTemplate();
    const pickSlipsData = convertToSlipData(pickSlips, intl, timezone, locale);
    const resultsFormatter = {
      'itemBarcode': rq => (rq.item ? rq.item.barcode : ''),
      'position': rq => (rq.position || ''),
      'proxy': rq => (rq.proxy ? getFullName(rq.proxy) : ''),
      'requestDate': rq => (
        <AppIcon size="small" app="requests">
          <FormattedTime value={rq.requestDate} day="numeric" month="numeric" year="numeric" />
        </AppIcon>
      ),
      'requester': rq => (rq.requester ? `${rq.requester.lastName}, ${rq.requester.firstName}` : ''),
      'requesterBarcode': rq => (rq.requester ? rq.requester.barcode : ''),
      'requestStatus': rq => <FormattedMessage id={requestStatusesTranslations[rq.status]} />,
      'type': rq => <FormattedMessage id={requestTypesTranslations[rq.requestType]} />,
      'title': rq => (rq.instance ? rq.instance.title : ''),
      'year': rq => getFormattedYears(rq.instance?.publication, DEFAULT_DISPLAYED_YEARS_AMOUNT),
    };

    const actionMenu = ({ onToggle, renderColumnsMenu }) => (
      <>
        <MenuSection label={intl.formatMessage({ id: 'ui-requests.actions.label' })}>
          <IfPermission perm="ui-requests.create">
            <Button
              buttonStyle="dropdownItem"
              id="clickable-newrequest"
              to={`${this.props.location.pathname}?layer=create`}
              onClick={onToggle}
            >
              <FormattedMessage id="stripes-smart-components.new" />
            </Button>
          </IfPermission>
          { csvReportPending ?
            <LoadingButton>
              <FormattedMessage id="ui-requests.csvReportPending" />
            </LoadingButton> :
            <Button
              buttonStyle="dropdownItem"
              id="exportToCsvPaneHeaderBtn"
              disabled={!requestCount}
              onClick={() => {
                this.context.sendCallout({ message: <FormattedMessage id="ui-requests.csvReportInProgress" /> });
                onToggle();
                this.exportData();
              }}
            >
              <FormattedMessage id="ui-requests.exportSearchResultsToCsv" />
            </Button>
          }
          {
            pickSlipsArePending ?
              <LoadingButton>
                <FormattedMessage id="ui-requests.pickSlipsLoading" />
              </LoadingButton> :
              <>
                <Button
                  buttonStyle="dropdownItem"
                  id="exportExpiredHoldsToCsvPaneHeaderBtn"
                  disabled={holdsShelfReportPending || (servicePointId && requestsEmpty)}
                  onClick={() => {
                    onToggle();
                    this.exportExpiredHoldsToCSV();
                  }}
                >
                  <FormattedMessage
                    id="ui-requests.exportExpiredHoldShelfToCsv"
                    values={{ currentServicePoint: servicePointName }}
                  />
                </Button>
                <PrintButton
                  buttonStyle="dropdownItem"
                  id="printPickSlipsBtn"
                  disabled={pickSlipsEmpty}
                  template={printTemplate}
                  contentRef={this.printContentRef}
                  onBeforeGetContent={
                    () => new Promise(resolve => {
                      this.context.sendCallout({ message: <FormattedMessage id="ui-requests.printInProgress" /> });
                      onToggle();
                      // without the timeout the printing process starts right away
                      // and the callout and onToggle above are blocked
                      setTimeout(() => resolve(), 1000);
                    })
                  }
                >
                  <FormattedMessage
                    id="ui-requests.printPickSlips"
                    values={{ sp: servicePointName }}
                  />
                </PrintButton>
              </>
          }
        </MenuSection>
        {renderColumnsMenu}
      </>
    );

    const columnManagerProps = {
      excludeKeys: ['title'],
    };

    return (
      <>
        {
          isEmpty(errorModalData) ||
          <ErrorModal
            onClose={this.errorModalClose}
            label={intl.formatMessage({ id: errorModalData.label })}
            errorMessage={intl.formatMessage({ id: errorModalData.errorMessage })}
          />
        }
        <div data-test-request-instances>
          <SearchAndSort
            columnManagerProps={columnManagerProps}
            hasNewButton={false}
            actionMenu={actionMenu}
            packageInfo={packageInfo}
            objectName="request"
            initialResultCount={INITIAL_RESULT_COUNT}
            resultCountIncrement={RESULT_COUNT_INCREMENT}
            viewRecordComponent={ViewRequest}
            editRecordComponent={RequestForm}
            getHelperResourcePath={this.getHelperResourcePath}
            columnWidths={{
              requestDate: { max: 165 },
              title: { max: 300 },
              year: { max: 58 },
              position: { max: 150 },
              requestType: { max: 101 },
              itemBarcode: { max: 140 },
              type: { max: 100 },
            }}
            columnMapping={this.columnLabels}
            resultsFormatter={resultsFormatter}
            newRecordInitialValues={initialValues}
            massageNewRecord={this.massageNewRecord}
            onCreate={this.create}
            onCloseNewRecord={this.handleCloseNewRecord}
            parentResources={resources}
            parentMutator={mutator}
            detailProps={{
              onChangePatron: this.onChangePatron,
              stripes,
              history,
              errorMessage,
              findResource: this.findResource,
              toggleModal: this.toggleModal,
              joinRequest: this.addRequestFields,
              optionLists: {
                addressTypes,
                fulfilmentTypes,
                servicePoints,
                cancellationReasons,
              },
              patronGroups,
              query: resources.query,
              onDuplicate: this.onDuplicate,
              buildRecordsForHoldsShelfReport: this.buildRecordsForHoldsShelfReport,
            }}
            viewRecordPerms="ui-requests.view"
            newRecordPerms="ui-requests.create"
            renderFilters={this.renderFilters}
            onFilterChange={this.handleFilterChange}
            pageAmount={100}
            pagingType="click"
          />
        </div>
        <PrintContent
          ref={this.printContentRef}
          template={printTemplate}
          dataSource={pickSlipsData}
        />
      </>
    );
  }
}

export default stripesConnect(injectIntl(RequestsRoute));
