import {
  get,
  isEmpty,
  isArray,
  size,
  unset,
  cloneDeep,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  stringify,
  parse,
} from 'query-string';
import moment from 'moment-timezone';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import { sanitize } from 'dompurify';

import {
  AppIcon,
  stripesConnect,
  IfPermission,
  CalloutContext,
  TitleManager,
  checkIfUserInCentralTenant,
} from '@folio/stripes/core';
import {
  Button,
  Checkbox,
  filters2cql,
  FormattedTime,
  MenuSection,
  TextLink,
  DefaultMCLRowFormatter,
  NoValue,
  MCLPagingTypes,
} from '@folio/stripes/components';
import {
  deparseFilters,
  makeQueryFunction,
  SearchAndSort,
} from '@folio/stripes/smart-components';
import {
  exportCsv,
  effectiveCallNumber,
  getHeaderWithCredentials,
} from '@folio/stripes/util';

import ViewRequest from '../ViewRequest';
import RequestFormContainer from '../RequestFormContainer';

import {
  reportHeaders,
  fulfillmentTypes,
  expiredHoldsReportHeaders,
  SLIPS_TYPE,
  createModes,
  requestStatusesTranslations,
  requestTypesTranslations,
  REQUEST_LEVEL_TYPES,
  DEFAULT_DISPLAYED_YEARS_AMOUNT,
  MAX_RECORDS,
  OPEN_REQUESTS_STATUSES,
  fulfillmentTypeMap,
  DEFAULT_REQUEST_TYPE_VALUE,
  INPUT_REQUEST_SEARCH_SELECTOR,
  SETTINGS_SCOPES,
  SETTINGS_KEYS,
  ITEM_QUERIES,
  REQUEST_ACTION_NAMES,
  CENTRAL_TENANT_URLS,
  PRINT_DETAILS_COLUMNS,
  RESOURCE_TYPES,
  requestFilterTypes,
} from '../constants';
import {
  buildUrl,
  getFullName,
  duplicateRequest,
  convertToSlipData,
  getTlrSettings,
  getInstanceQueryString,
  isDuplicateMode,
  generateUserName,
  getRequestErrorMessage,
  getSelectedSlipDataMulti,
  selectedRowsNonPrintable,
  getNextSelectedRowsState,
  getRequestUrl,
  isMultiDataTenant,
} from '../utils';
import packageInfo from '../../package';
import CheckboxColumn from '../components/CheckboxColumn';

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
import RequestsRouteShortcutsWrapper from '../components/RequestsRouteShortcutsWrapper';
import {
  isReorderableRequest,
  getFormattedYears,
  getStatusQuery,
  getFullNameForCsvRecords,
  getPrintStatusFilteredData,
  filterRecordsByPrintStatus,
} from './utils';
import SinglePrintButtonForPickSlip from '../components/SinglePrintButtonForPickSlip';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;
export const DEFAULT_FORMATTER_VALUE = '';

export const getPrintHoldRequestsEnabled = (printHoldRequests) => {
  const value = printHoldRequests.records[0]?.value;
  const {
    printHoldRequestsEnabled = false,
  } = value ? JSON.parse(value) : {};

  return printHoldRequestsEnabled;
};

export const getFilteredColumnHeadersMap = (columnHeaders) => (
  columnHeaders.filter(column => column.value !== PRINT_DETAILS_COLUMNS.COPIES &&
    column.value !== PRINT_DETAILS_COLUMNS.PRINTED)
);

export const extractPickSlipRequestIds = (pickSlipsData) => {
  return pickSlipsData.map(pickSlip => pickSlip['request.requestID']);
};

export const getLastPrintedDetails = (printDetails, intl) => {
  const fullName = getFullName(printDetails?.lastPrintRequester);
  const formattedDate = intl.formatDate(printDetails?.lastPrintedDate);
  const formattedTime = intl.formatTime(printDetails?.lastPrintedDate);
  const localizedDateTime = `${formattedDate}${formattedTime ? ', ' : ''}${formattedTime}`;

  return fullName + ' ' + localizedDateTime;
};

export const urls = {
  user: (value, idType) => {
    const query = stringify({ query: `(${idType}=="${value}")` });

    return `users?${query}`;
  },
  item: (value, idType) => {
    let query;
    const itemQueryParam = ITEM_QUERIES[idType];

    if (isArray(value)) {
      const queryElements = value.map((valueItem) => `${itemQueryParam}=="${valueItem}"`);

      query = `(${queryElements.join(' or ')})`;
    } else {
      query = `(${itemQueryParam}=="${value}")`;
    }

    query = stringify({ query });

    return `circulation/items-by-instance?${query}`;
  },
  instance: (value) => {
    const query = stringify({ query: getInstanceQueryString(value) });

    return `circulation/items-by-instance?${query}`;
  },
  loan: (value) => {
    const query = stringify({ query: `(itemId=="${value}") and status.name==Open` });

    return `circulation/loans?${query}`;
  },
  requestsForItem: (value) => {
    const statusQuery = getStatusQuery(OPEN_REQUESTS_STATUSES);
    const query = stringify({
      query: `(itemId=="${value}" and (${statusQuery}))`,
      limit: MAX_RECORDS,
    });

    return `circulation/requests?${query}`;
  },
  requestsForInstance: (value) => {
    const statusQuery = getStatusQuery(OPEN_REQUESTS_STATUSES);
    const query = stringify({
      query: `(instanceId=="${value}" and (${statusQuery}))`,
      limit: MAX_RECORDS,
    });

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
  requestTypes: ({
    requesterId,
    itemId,
    instanceId,
    requestId,
    operation,
  }, idType, stripes) => {
    const url = getRequestUrl(REQUEST_ACTION_NAMES.GET_SERVICE_POINTS, stripes);

    if (requestId) {
      return `${url}?operation=${operation}&requestId=${requestId}`;
    }

    let requestUrl = `${url}?requesterId=${requesterId}&operation=${operation}`;

    if (itemId) {
      requestUrl = `${requestUrl}&itemId=${itemId}`;
    } else if (instanceId) {
      requestUrl = `${requestUrl}&instanceId=${instanceId}`;
    }

    return requestUrl;
  },
  ecsTlrSettings: (value, idType, stripes) => {
    const isUserInCentralTenant = checkIfUserInCentralTenant(stripes);

    if (isUserInCentralTenant) {
      return 'tlr/settings';
    }

    return 'circulation/settings?query=name==ecsTlrFeature';
  },
};

export const getListFormatter = (
  {
    getRowURL,
    setURL,
  },
  {
    intl,
    selectedRows,
    pickSlipsToCheck,
    pickSlipsData,
    isViewPrintDetailsEnabled,
    getPrintContentRef,
    pickSlipsPrintTemplate,
    toggleRowSelection,
    onBeforeGetContentForSinglePrintButton,
    onBeforePrintForSinglePrintButton,
  }
) => ({
  'select': rq => (
    <CheckboxColumn
      request={rq}
      selectedRows={selectedRows}
      toggleRowSelection={toggleRowSelection}
    />),
  'itemBarcode': rq => (rq.item ? rq.item.barcode : DEFAULT_FORMATTER_VALUE),
  'position': rq => (rq.position || DEFAULT_FORMATTER_VALUE),
  'proxy': rq => (rq.proxy ? getFullName(rq.proxy) : DEFAULT_FORMATTER_VALUE),
  'requestDate': rq => (
    <AppIcon size="small" app="requests">
      <FormattedTime value={rq.requestDate} day="numeric" month="numeric" year="numeric" />
    </AppIcon>
  ),
  'requester': rq => (rq.requester ? getFullName(rq.requester) : DEFAULT_FORMATTER_VALUE),
  'singlePrint': rq => {
    const singlePrintButtonProps = {
      request: rq,
      pickSlipsToCheck,
      pickSlipsPrintTemplate,
      onBeforeGetContentForSinglePrintButton,
      pickSlipsData,
      getPrintContentRef,
      ...(isViewPrintDetailsEnabled && {
        onBeforePrintForSinglePrintButton
      }),
    };
    return (
      <SinglePrintButtonForPickSlip {...singlePrintButtonProps} />);
  },
  'requesterBarcode': rq => (rq.requester ? rq.requester.barcode : DEFAULT_FORMATTER_VALUE),
  'requestStatus': rq => (requestStatusesTranslations[rq.status]
    ? <FormattedMessage id={requestStatusesTranslations[rq.status]} />
    : <NoValue />),
  'type': rq => <FormattedMessage id={requestTypesTranslations[rq.requestType]} />,
  'title': rq => <TextLink to={getRowURL(rq.id)} onClick={() => setURL(rq.id)}>{(rq.instance ? rq.instance.title : DEFAULT_FORMATTER_VALUE)}</TextLink>,
  'year': rq => getFormattedYears(rq.instance?.publication, DEFAULT_DISPLAYED_YEARS_AMOUNT),
  'callNumber': rq => effectiveCallNumber(rq.item),
  'servicePoint': rq => get(rq, 'pickupServicePoint.name', DEFAULT_FORMATTER_VALUE),
  'copies': rq => get(rq, PRINT_DETAILS_COLUMNS.COPIES, DEFAULT_FORMATTER_VALUE),
  'printed': rq => (rq.printDetails ? getLastPrintedDetails(rq.printDetails, intl) : DEFAULT_FORMATTER_VALUE),
});

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

export const viewPrintDetailsPath = 'circulationSettings.records[0].value.enablePrintLog';

class RequestsRoute extends React.Component {
  static contextType = CalloutContext;

  static manifest = {
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
      params: {
        query: 'cql.allRecords=1 sortby addressType',
        limit: MAX_RECORDS,
      },
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
      resultDensity: 'sparse',
      perRequest: 100,
      throwErrors: false,
      GET: {
        params: {
          query: makeQueryFunction(
            'cql.allRecords=1',
            '(requesterId=="%{query.query}" or requester.barcode="%{query.query}*" or instance.title="%{query.query}*" or instanceId="%{query.query}*" or item.barcode=="%{query.query}*" or itemId=="%{query.query}" or itemIsbn="%{query.query}" or searchIndex.callNumberComponents.callNumber=="%{query.query}*" or fullCallNumberIndex=="%{query.query}*")',
            {
              'title': 'instance.title',
              'instanceId': 'instanceId',
              'publication': 'instance.publication',
              'itemBarcode': 'item.barcode',
              'callNumber': 'searchIndex.shelvingOrder',
              'type': 'requestType',
              'requester': 'requester.lastName requester.firstName',
              'requestStatus': 'status',
              'servicePoint': 'searchIndex.pickupServicePointName',
              'requesterBarcode': 'requester.barcode',
              'requestDate': 'requestDate',
              'position': 'position/number',
              'proxy': 'proxy',
            },
            RequestsFiltersConfig,
            2, // do not fetch unless we have a query or a filter
          ),
        },
        staticFallback: { params: {} },
      },
    },
    ecsTlrRecords: {
      type: 'okapi',
      path: CENTRAL_TENANT_URLS[REQUEST_ACTION_NAMES.CREATE_REQUEST],
      fetch: false,
      throwErrors: false,
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
        limit: MAX_RECORDS,
      },
      records: 'usergroups',
    },
    servicePoints: {
      type: 'okapi',
      records: 'servicepoints',
      path: 'service-points',
      params: {
        query: 'query=(pickupLocation==true) sortby name',
        limit: MAX_RECORDS,
      },
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
      params: {
        query: 'cql.allRecords=1 sortby name',
        limit: MAX_RECORDS,
      },
    },
    staffSlips: {
      type: 'okapi',
      records: 'staffSlips',
      path: 'staff-slips-storage/staff-slips',
      params: {
        query: 'cql.allRecords=1 sortby name',
        limit: MAX_RECORDS,
      },

      throwErrors: false,
    },
    pickSlips: {
      type: 'okapi',
      records: 'pickSlips',
      path: 'circulation/pick-slips/%{currentServicePoint.id}',
      throwErrors: false,
    },
    searchSlips: {
      type: 'okapi',
      records: 'searchSlips',
      path: 'circulation/search-slips/%{currentServicePoint.id}',
      throwErrors: false,
    },
    printHoldRequests: {
      type: 'okapi',
      records: 'configs',
      path: 'configurations/entries',
      params: {
        query: '(module==SETTINGS and configName==PRINT_HOLD_REQUESTS)',
      },
    },
    currentServicePoint: {},
    tags: {
      throwErrors: false,
      type: 'okapi',
      path: 'tags',
      params: {
        query: 'cql.allRecords=1 sortby label',
        limit: MAX_RECORDS,
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
      records: 'items',
      path: 'settings/entries',
      params: {
        query: `(scope==${SETTINGS_SCOPES.CIRCULATION} and key==${SETTINGS_KEYS.GENERAL_TLR})`,
      },
    },
    circulationSettings: {
      throwErrors: false,
      type: 'okapi',
      records: 'circulationSettings',
      path: 'circulation/settings',
      params: {
        query: '(name=printEventLogFeature)',
      },
    },
    savePrintDetails: {
      type: 'okapi',
      POST: {
        path: 'circulation/print-events-entry',
      },
      fetch: false,
      clientGeneratePk: false,
      throwErrors: false,
    },
  };

  static propTypes = {
    intl: PropTypes.object,
    mutator: PropTypes.shape({
      records: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      ecsTlrRecords: PropTypes.shape({
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
      searchSlips: PropTypes.shape({
        GET: PropTypes.func,
      }).isRequired,
      currentServicePoint: PropTypes.shape({
        update: PropTypes.func.isRequired,
      }).isRequired,
      proxy: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
      circulationSettings: PropTypes.shape({
        GET: PropTypes.func,
      }),
      savePrintDetails: PropTypes.shape({
        POST: PropTypes.func,
      }),
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
        isPending: PropTypes.bool.isRequired,
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
      searchSlips: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
        isPending: PropTypes.bool,
      }),
      configs: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }),
      printHoldRequests: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object).isRequired,
      }),
      circulationSettings: PropTypes.shape({
        records: PropTypes.arrayOf(PropTypes.object),
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
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }).isRequired,
    match: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const {
      titleLevelRequestsFeatureEnabled = false,
      createTitleLevelRequestsByDefault = false,
    } = getTlrSettings(props.resources.configs.records[0]?.value);

    this.okapiUrl = props.stripes.okapi.url;

    this.httpHeadersOptions = {
      ...getHeaderWithCredentials({
        tenant: this.props.stripes.okapi.tenant,
        token: this.props.stripes.store.getState().okapi.token,
      })
    };

    this.getRowURL = this.getRowURL.bind(this);
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
      isEcsTlrSettingReceived: false,
      isEcsTlrSettingEnabled: false,
      csvReportPending: false,
      submitting: false,
      errorMessage: '',
      errorModalData: {},
      servicePointId: '',
      requests: [],
      selectedId: '',
      selectedRows: {},
      titleLevelRequestsFeatureEnabled,
      createTitleLevelRequestsByDefault,
      isViewPrintDetailsEnabled: false,
      selectedPrintStatusFilters: [],
    };

    this.pickSlipsPrintContentRef = React.createRef();
    this.searchSlipsPrintContentRef = React.createRef();
    this.paneTitleRef = React.createRef();
    this.printSelectedContentRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const layer = (props.resources.query || {}).layer;
    const newState = {};
    const currViewPrintDetailsSettings = get(props.resources, viewPrintDetailsPath) === 'true';

    if (!layer) {
      newState.dupRequest = null;
    }

    if (currViewPrintDetailsSettings !== state.isViewPrintDetailsEnabled) {
      // Update the `isViewPrintDetailsEnabled` state based on user navigation back to Request App.
      newState.isViewPrintDetailsEnabled = currViewPrintDetailsSettings;
    }

    return Object.keys(newState).length ? newState : null;
  }

  componentDidMount() {
    const { stripes } = this.props;

    this.setCurrentServicePointId();

    if (stripes?.user?.user?.tenants) {
      this.getEcsTlrSettings();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      submitting,
      isViewPrintDetailsEnabled,
      selectedPrintStatusFilters,
    } = this.state;
    const { stripes } = this.props;
    const patronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
    const prevBlocks = get(prevProps.resources, ['patronBlocks', 'records'], []);
    const prevExpired = prevBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const expired = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrBefore(moment().format()) && p.expirationDate) || [];
    const { id: currentServicePointId } = this.getCurrentServicePointInfo();
    const prevStateServicePointId = get(prevProps.resources.currentServicePoint, 'id');
    const { configs: prevConfigs } = prevProps.resources;
    const { configs, query: { filters } } = this.props.resources;
    const instanceId = parse(this.props.location?.search)?.instanceId;

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

    if (configs?.records[0]?.value !== prevConfigs?.records[0]?.value) {
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

    if (!this.props.resources.query.instanceId && instanceId) {
      this.props.mutator.query.update({ instanceId });
    }

    if (!this.props.resources.records.isPending) {
      this.onSearchComplete(this.props.resources.records);
    }

    if (isViewPrintDetailsEnabled !== prevState.isViewPrintDetailsEnabled && !isViewPrintDetailsEnabled) {
      this.columnHeadersMap = getFilteredColumnHeadersMap(this.columnHeadersMap);
    }

    if (filters?.includes(requestFilterTypes.PRINT_STATUS)) {
      const printStatusFilterInQuery = this.getActiveFilters()[requestFilterTypes.PRINT_STATUS];

      this.updateSelectedPrintStatusFilters(isViewPrintDetailsEnabled, selectedPrintStatusFilters, printStatusFilterInQuery);
    }

    if (stripes?.user?.user?.tenants && stripes.user.user !== prevProps.stripes?.user?.user) {
      this.getEcsTlrSettings();
    }
  }

  /* For multi data tenant environments
  * ECS TLR setting has to be retrieved (Settings>Circulation>Consortium title level requests (TLR)).
  * In a case if this setting is enabled we should hide Move and Duplicate buttons in action menu. */
  getEcsTlrSettings = () => {
    const { stripes } = this.props;

    if (isMultiDataTenant(stripes)) {
      this.findResource(RESOURCE_TYPES.ECS_TLR_SETTINGS)
        .then(res => {
          let isEcsTlrSettingEnabled;

          if (checkIfUserInCentralTenant(stripes)) {
            isEcsTlrSettingEnabled = res?.ecsTlrFeatureEnabled;
          } else {
            isEcsTlrSettingEnabled = res?.circulationSettings?.[0]?.value?.enabled;
          }

          this.setState({
            isEcsTlrSettingReceived: true,
            isEcsTlrSettingEnabled,
          });
        })
        .catch(() => {
          this.setState({
            isEcsTlrSettingReceived: false,
            isEcsTlrSettingEnabled: false,
          });
        });
    }
  }

  updateSelectedPrintStatusFilters(isViewPrintDetailsEnabled, selectedPrintStatusFilters, printStatusFilterInQuery) {
    /**
     * Updates the `selectedPrintStatusFilters` state based on pre selected filters when user navigates back to Request App.
     *
     * The function performs the following actions:
     * 1. If `isViewPrintDetailsEnabled` is true and if `Print Status` filters contains exactly one filter:
     *    - it updates state to set `selectedPrintStatusFilters` to this one `Print Status` filter.
     *
     * 2. If `isViewPrintDetailsEnabled` is false and `filters` in query includes 'PRINT STATUS' filter:
     *    - it clears the 'PRINT STATUS' filter from query by invoking `handleFilterChange`.
     */
    if (isViewPrintDetailsEnabled && selectedPrintStatusFilters.length === 0 && printStatusFilterInQuery?.length === 1) {
      this.setState({ selectedPrintStatusFilters: [printStatusFilterInQuery[0]] });
    } else if (!isViewPrintDetailsEnabled && printStatusFilterInQuery?.length) {
      this.handleFilterChange({ name: requestFilterTypes.PRINT_STATUS, values: [] });
    }
  }

  toggleAllRows = () => {
    const { resources } = this.props;
    const { selectedRows } = this.state;
    const toggledRows = resources.records.records.reduce((acc, row) => (
      {
        ...acc,
        [row.id]: row,
      }
    ), {});
    const filterSelectedRows = rows => {
      Object.keys(toggledRows).forEach(id => {
        if (rows[id]) delete rows[id];
      });
      return rows;
    };

    this.setState(({ selectedRows: this.getIsAllRowsSelected() ? filterSelectedRows(selectedRows) : { ...selectedRows, ...toggledRows } }));
  };

  getIsAllRowsSelected = () => {
    const { resources } = this.props;
    const { selectedRows } = this.state;

    if (resources.records.records.length !== 0) {
      return resources.records.records.every(({ id }) => Object.keys(selectedRows).includes(id));
    } else {
      return false;
    }
  };

  onSearchComplete(records) {
    const paneTitleRef = this.paneTitleRef.current;
    const resultsCount = get(records, 'other.totalRecords', 0);

    if (!!resultsCount && paneTitleRef) {
      paneTitleRef.focus();
    } else {
      const searchFieldRef = document.getElementById(INPUT_REQUEST_SEARCH_SELECTOR);

      if (searchFieldRef) {
        searchFieldRef.focus();
      }
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
    const { isViewPrintDetailsEnabled, selectedPrintStatusFilters } = this.state;

    const activeFilters = this.getActiveFilters();
    const activeFilterKeys = Object.keys(activeFilters);
    const isOnlyPrintStatusFilterSelected = activeFilterKeys.length === 1 && activeFilterKeys[0] === requestFilterTypes.PRINT_STATUS;

    // Build a custom query for the CSV record export, which has to include
    // all search and filter parameters
    const queryClauses = [];
    let queryString;

    const queryTerm = this.props.resources?.query?.query;
    const filterQuery = filters2cql(RequestsFiltersConfig, deparseFilters(activeFilters));

    if (queryTerm) {
      queryString = `(requesterId=="${queryTerm}" or requester.barcode="${queryTerm}*" or item.title="${queryTerm}*" or item.barcode=="${queryTerm}*" or itemId=="${queryTerm}")`;
      queryClauses.push(queryString);
    }
    if (filterQuery) queryClauses.push(filterQuery);
    if (isOnlyPrintStatusFilterSelected) queryClauses.push('cql.allRecords=1');

    queryString = queryClauses.join(' and ');
    const records = await this.fetchReportData(this.props.mutator.reportRecords, queryString);

    const printStatusFilteredRecords = isViewPrintDetailsEnabled && selectedPrintStatusFilters.length === 1 &&
      filterRecordsByPrintStatus(records, selectedPrintStatusFilters);
    const recordsToCSV = this.buildRecords(printStatusFilteredRecords || records);

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
    const {
      mutator,
      resources,
    } = this.props;
    const { id } = this.getCurrentServicePointInfo();

    if (resources.currentServicePoint?.id !== id) {
      mutator.currentServicePoint.update({ id });
    }

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
        record.requester.name = getFullNameForCsvRecords(record.requester);
      }
      if (record.printDetails) {
        const fullName = getFullNameForCsvRecords(record.printDetails.lastPrintRequester);
        const lastPrintedDate = record.printDetails.lastPrintedDate || '';
        const date = lastPrintedDate ? `, ${lastPrintedDate}` : '';

        record.printDetails.lastPrintedDetails = `${fullName}${date}`;
      }
      if (record.loan) {
        const { dueDate } = record.loan;
        record.loan.dueDate = `${formatDate(dueDate)}, ${formatTime(dueDate)}`;
      }
      if (record.proxy) {
        record.proxy.name = getFullNameForCsvRecords(record.proxy);
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
    const { stripes } = this.props;
    const query = urls[resource](value, idType, stripes);

    return fetch(`${this.okapiUrl}/${query}`, this.httpHeadersOptions)
      .then(response => response.json())
      .catch(() => null);
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
      const titleRequestCount = titleRequests?.requests.filter(r => r.requestLevel === REQUEST_LEVEL_TYPES.TITLE).length || 0;
      const dynamicProperties = {};
      const requestsForFilter = titleLevelRequestsFeatureEnabled ? titleRequests.requests : itemRequests.requests;

      dynamicProperties.numberOfReorderableRequests = requestsForFilter.filter(currentRequest => isReorderableRequest(currentRequest)).length;

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

  getRowURL(id) {
    const {
      match: { path },
      location: { search },
    } = this.props;

    return `${path}/view/${id}${search}`;
  }

  setURL = (id) => {
    this.setState({
      selectedId: id,
    });
  }

  resultIsSelected = ({ item }) => item.id === this.state.selectedId;

  viewRecordOnCollapse = () => {
    this.setState({
      selectedId: null,
    });
  }

  getHelperResourcePath = (helper, id) => `circulation/requests/${id}`;

  massageNewRecord = (requestData) => {
    const { intl: { timeZone } } = this.props;
    const isoDate = moment.tz(timeZone).toISOString();
    Object.assign(requestData, { requestDate: isoDate });
  };

  renderPaneSub() {
    const selectedRowsCount = size(this.state.selectedRows);

    return selectedRowsCount
      ? (
        <FormattedMessage
          id="ui-requests.rows.recordsSelected"
          values={{ count: selectedRowsCount }}
        />
      )
      : null;
  }

  onChangePatron = (patron) => {
    this.props.mutator.activeRecord.update({ patronId: patron.id });
  };

  create = (requestData) => {
    const { stripes } = this.props;
    const userPersonalData = cloneDeep(requestData?.requester?.personal);
    let mutator = this.props.mutator.records;

    if (isMultiDataTenant(stripes) && checkIfUserInCentralTenant(stripes)) {
      unset(requestData, 'item');
      unset(requestData, 'requester');
      unset(requestData, 'holdingsRecordId');

      mutator = this.props.mutator.ecsTlrRecords;
    }

    const query = new URLSearchParams(this.props.location.search);
    const mode = query.get('mode');

    return mutator.POST(requestData)
      .then((res) => {
        const {
          match: {
            path,
          },
          history,
        } = this.props;

        history.push(`${path}/view/${res?.primaryRequestId || res?.id}`);

        this.context.sendCallout({
          message: isDuplicateMode(mode)
            ? (
              <FormattedMessage
                id="ui-requests.duplicateRequest.success"
                values={{ requester: generateUserName(userPersonalData) }}
              />
            )
            : (
              <FormattedMessage
                id="ui-requests.createRequest.success"
                values={{ requester: generateUserName(userPersonalData) }}
              />
            ),
        });
      })
      .catch(resp => {
        this.context.sendCallout({
          message: isDuplicateMode(mode)
            ? <FormattedMessage id="ui-requests.duplicateRequest.fail" />
            : <FormattedMessage id="ui-requests.createRequest.fail" />,
          type: 'error',
        });

        return this.processError(resp);
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
    return { item };
  }

  handleJsonError({ errors }) {
    const {
      intl,
    } = this.props;
    const errorMessages = [];

    errors.forEach((error) => (
      errorMessages.push(getRequestErrorMessage(error, intl))
    ));

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
      userId: null,
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
    if (request.requestLevel === REQUEST_LEVEL_TYPES.TITLE) {
      dupRequest.createTitleLevelRequest = true;
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
    } = this.props;

    this.setState({
      holdsShelfReportPending: true,
    });

    reset();

    const { id } = this.getCurrentServicePointInfo();

    this.setState({
      servicePointId: id,
    });

    if (id !== this.state.servicePointId) {
      const path = `circulation/requests-reports/hold-shelf-clearance/${id}`;
      const { requests } = await GET({ path });

      this.setState({
        requests,
      });
    }

    this.setState({
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

  getPrintTemplate(slipType) {
    const staffSlips = get(this.props.resources, 'staffSlips.records', []);
    const slipTypeInLowerCase = slipType.toLowerCase();
    const slipTemplate = staffSlips.find(slip => slip.name.toLowerCase() === slipTypeInLowerCase);

    return sanitize(get(slipTemplate, 'template', ''), { ADD_TAGS: ['Barcode'] });
  }

  handleFilterChange = ({ name, values }) => {
    if (name === requestFilterTypes.PRINT_STATUS) {
      this.setState({ selectedPrintStatusFilters: values });
    }

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
    const { titleLevelRequestsFeatureEnabled, isViewPrintDetailsEnabled } = this.state;

    return (
      <RequestsFilters
        activeFilters={this.getActiveFilters()}
        resources={resources}
        onChange={onChange}
        onClear={(name) => onChange({ name, values: [] })}
        titleLevelRequestsFeatureEnabled={titleLevelRequestsFeatureEnabled}
        isViewPrintDetailsEnabled={isViewPrintDetailsEnabled}
      />
    );
  };

  savePrintEventDetails = (requestIds) => {
    const currDateTime = new Date();
    const printTimeStamp = currDateTime.toISOString();
    const { id: loggedInUserId, username: loggedInUsername } = this.props.stripes.user.user;

    this.props.mutator.savePrintDetails.POST({
      'requestIds' : requestIds,
      'requesterName' : loggedInUsername,
      'requesterId' : loggedInUserId,
      'printEventDate' : printTimeStamp
    });
  }

  onBeforeGetContentForPrintButton = (onToggle) => (
    new Promise(resolve => {
      this.context.sendCallout({ message: <FormattedMessage id="ui-requests.printInProgress" /> });
      onToggle();
      // without the timeout the printing process starts right away
      // and the callout and onToggle above are blocked
      setTimeout(() => resolve(), 1000);
    })
  );

  onBeforeGetContentForSinglePrintButton = () => (
    new Promise(resolve => {
      this.context.sendCallout({ message: <FormattedMessage id="ui-requests.printInProgress" /> });
      setTimeout(() => resolve(), 1000);
    })
  );

  printContentRefs = {};

  getPrintContentRef = (rqId) => {
    if (!this.printContentRefs[rqId]) {
      this.printContentRefs[rqId] = React.createRef();
    }

    return this.printContentRefs[rqId];
  };

  toggleRowSelection = row => {
    this.setState(({ selectedRows }) => ({ selectedRows: getNextSelectedRowsState(selectedRows, row) }));
  };

  getPageTitle = () => {
    const {
      location,
      intl: {
        formatMessage,
      },
    } = this.props;
    const query = parse(location.search)?.query;

    if (query) {
      return formatMessage({ id: 'ui-requests.documentTitle.search' }, { query });
    }

    return formatMessage({ id: 'ui-requests.meta.title' });
  }

  render() {
    const {
      resources,
      mutator,
      stripes,
      history,
      location,
      intl,
      stripes: {
        timezone,
        locale,
        user: { user }
      },
    } = this.props;

    const {
      csvReportPending,
      dupRequest,
      errorMessage,
      errorModalData,
      requests,
      servicePointId,
      selectedRows,
      holdsShelfReportPending,
      createTitleLevelRequestsByDefault,
      isViewPrintDetailsEnabled,
      isEcsTlrSettingReceived,
      isEcsTlrSettingEnabled,
      selectedPrintStatusFilters,
    } = this.state;
    const isPrintHoldRequestsEnabled = getPrintHoldRequestsEnabled(resources.printHoldRequests);
    const { name: servicePointName } = this.getCurrentServicePointInfo();
    const pickSlips = get(resources, 'pickSlips.records', []);
    const searchSlips = get(resources, 'searchSlips.records', []);
    const patronGroups = get(resources, 'patronGroups.records', []);
    const addressTypes = get(resources, 'addressTypes.records', []);
    const servicePoints = get(resources, 'servicePoints.records', []);
    const cancellationReasons = get(resources, 'cancellationReasons.records', []);
    const requestCount = get(resources, 'records.other.totalRecords', 0);
    const initialValues = dupRequest ||
    {
      requestType: DEFAULT_REQUEST_TYPE_VALUE,
      fulfillmentPreference: fulfillmentTypeMap.HOLD_SHELF,
      createTitleLevelRequest: createTitleLevelRequestsByDefault,
    };

    const columnLabels = {
      select: <Checkbox
        data-testid="selectRequestCheckbox"
        checked={this.getIsAllRowsSelected()}
        aria-label={<FormattedMessage id="ui-requests.instances.rows.select" />}
        onChange={this.toggleAllRows}
      />,
      requestDate: <FormattedMessage id="ui-requests.requests.requestDate" />,
      title: <FormattedMessage id="ui-requests.requests.title" />,
      year: <FormattedMessage id="ui-requests.requests.year" />,
      itemBarcode: <FormattedMessage id="ui-requests.requests.itemBarcode" />,
      callNumber: <FormattedMessage id="ui-requests.requests.callNumber" />,
      type: <FormattedMessage id="ui-requests.requests.type" />,
      requestStatus: <FormattedMessage id="ui-requests.requests.status" />,
      position: <FormattedMessage id="ui-requests.requests.queuePosition" />,
      servicePoint: <FormattedMessage id="ui-requests.requests.servicePoint" />,
      requester: <FormattedMessage id="ui-requests.requests.requester" />,
      requesterBarcode: <FormattedMessage id="ui-requests.requests.requesterBarcode" />,
      singlePrint: <FormattedMessage id="ui-requests.requests.singlePrint" />,
      proxy: <FormattedMessage id="ui-requests.requests.proxy" />,
      ...(isViewPrintDetailsEnabled && {
        copies: <FormattedMessage id="ui-requests.requests.copies" />,
        printed: <FormattedMessage id="ui-requests.requests.printed" />,
      }),
    };

    const isPickSlipsArePending = resources?.pickSlips?.isPending;
    const isSearchSlipsArePending = resources?.searchSlips?.isPending;
    const isRequestsRecordsLoaded = resources.records.hasLoaded;
    const requestsEmpty = isEmpty(requests);
    const isPickSlipsEmpty = isEmpty(pickSlips);
    const isSearchSlipsEmpty = isEmpty(searchSlips);
    const pickSlipsPrintTemplate = this.getPrintTemplate(SLIPS_TYPE.PICK_SLIP);
    const searchSlipsPrintTemplate = this.getPrintTemplate(SLIPS_TYPE.SEARCH_SLIP_HOLD_REQUESTS);
    const pickSlipsData = convertToSlipData(pickSlips, intl, timezone, locale, SLIPS_TYPE.PICK_SLIP, user);
    const searchSlipsData = convertToSlipData(searchSlips, intl, timezone, locale, SLIPS_TYPE.SEARCH_SLIP_HOLD_REQUESTS);
    let multiSelectPickSlipData = getSelectedSlipDataMulti(pickSlipsData, selectedRows);
    /**
     * For 'displayPrintStatusFilteredData' to be true the length of 'selectedPrintStatusFilters' must be 1.
     * This is because we only filter data when exactly one PrintStatus filter is selected ([Printed] or [Not Printed]).
     * If the filter array is empty or contains both filters ([] or [Printed, Not Printed]),
     * no filtering is needed as the data should be used directly from the query response.
     */
    const displayPrintStatusFilteredData = isViewPrintDetailsEnabled &&
    isRequestsRecordsLoaded && selectedPrintStatusFilters.length === 1;

    const resultsFormatter = getListFormatter(
      {
        getRowURL: this.getRowURL,
        setURL: this.setURL,
      },
      {
        intl,
        selectedRows,
        pickSlipsToCheck: pickSlips,
        pickSlipsData,
        isViewPrintDetailsEnabled,
        getPrintContentRef: this.getPrintContentRef,
        pickSlipsPrintTemplate,
        toggleRowSelection: this.toggleRowSelection,
        onBeforeGetContentForSinglePrintButton: this.onBeforeGetContentForSinglePrintButton,
        onBeforePrintForSinglePrintButton: this.savePrintEventDetails,
      }
    );

    const isPrintingDisabled = isPickSlipsEmpty || selectedRowsNonPrintable(pickSlipsData, selectedRows);

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
          {csvReportPending ?
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
            isPickSlipsArePending ?
              <LoadingButton>
                <FormattedMessage id="ui-requests.pickSlipsLoading" />
              </LoadingButton> :
              <>
                <Button
                  data-testid="exportExpiredHoldShelfToCsvButton"
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
                  disabled={isPickSlipsEmpty}
                  template={pickSlipsPrintTemplate}
                  contentRef={this.pickSlipsPrintContentRef}
                  onBeforeGetContent={() => this.onBeforeGetContentForPrintButton(onToggle)}
                  onBeforePrint={() => {
                    if (isViewPrintDetailsEnabled) {
                      const requestIds = extractPickSlipRequestIds(pickSlipsData);
                      this.savePrintEventDetails(requestIds);
                    }
                  }}
                >
                  <FormattedMessage
                    id="ui-requests.printPickSlips"
                    values={{ sp: servicePointName }}
                  />
                </PrintButton>
                <PrintButton
                  buttonStyle="dropdownItem"
                  id="printSelectedPickSlipsBtn"
                  disabled={isPrintingDisabled}
                  template={pickSlipsPrintTemplate}
                  contentRef={this.printSelectedContentRef}
                  onBeforeGetContent={
                    () => new Promise(resolve => {
                      this.context.sendCallout({ message: <FormattedMessage id="ui-requests.printInProgress" /> });
                      onToggle();
                      // without the timeout the printing process starts right away
                      // and the callout and onToggle above are blocked
                      setTimeout(() => resolve(), 1000);
                      multiSelectPickSlipData = getSelectedSlipDataMulti(pickSlipsData, selectedRows);
                    })
                    }
                  onBeforePrint={
                    () => {
                      if (isViewPrintDetailsEnabled) {
                        const selectedPickSlips = getSelectedSlipDataMulti(pickSlipsData, selectedRows);
                        const selectedRequestIds = extractPickSlipRequestIds(selectedPickSlips);
                        this.savePrintEventDetails(selectedRequestIds);
                      }
                    }
                  }
                >
                  <FormattedMessage
                    id="ui-requests.printPickSlipsSelected"
                    values={{ sp: servicePointName }}
                  />
                </PrintButton>
              </>
          }
          {
            isPrintHoldRequestsEnabled &&
            <>
              {
                isSearchSlipsArePending ?
                  <LoadingButton>
                    <FormattedMessage id="ui-requests.searchSlipsLoading" />
                  </LoadingButton> :
                  <PrintButton
                    buttonStyle="dropdownItem"
                    id="printSearchSlipsBtn"
                    disabled={isSearchSlipsEmpty}
                    template={searchSlipsPrintTemplate}
                    contentRef={this.searchSlipsPrintContentRef}
                    onBeforeGetContent={() => this.onBeforeGetContentForPrintButton(onToggle)}
                  >
                    <FormattedMessage
                      id="ui-requests.printSearchSlips"
                      values={{ sp: servicePointName }}
                    />
                  </PrintButton>
              }
            </>
          }
        </MenuSection>
        {renderColumnsMenu}
      </>
    );

    const columnManagerProps = {
      excludeKeys: ['title', 'select'],
      visibleColumns: [
        'select',
        'title',
        'requestDate',
        'year',
        'itemBarcode',
        'type',
        'requestStatus',
        'position',
        'requester',
        'requesterBarcode',
        'proxy',
      ],
    };
    const pageTitle = this.getPageTitle();

    return (
      <RequestsRouteShortcutsWrapper
        history={history}
        location={location}
        stripes={stripes}
      >
        <>
          {
            isEmpty(errorModalData) ||
            <ErrorModal
              onClose={this.errorModalClose}
              label={intl.formatMessage({ id: errorModalData.label })}
              errorMessage={intl.formatMessage({ id: errorModalData.errorMessage })}
            />
          }
          <TitleManager page={pageTitle} />
          <div data-test-request-instances>
            <SearchAndSort
              paneTitleRef={this.paneTitleRef}
              columnManagerProps={columnManagerProps}
              hasNewButton={false}
              actionMenu={actionMenu}
              packageInfo={packageInfo}
              objectName="request"
              initialResultCount={INITIAL_RESULT_COUNT}
              resultCountIncrement={RESULT_COUNT_INCREMENT}
              viewRecordComponent={ViewRequest}
              editRecordComponent={RequestFormContainer}
              getHelperResourcePath={this.getHelperResourcePath}
              columnWidths={{
                requestDate: { max: 165 },
                title: { max: 300 },
                year: { max: 58 },
                position: { max: 150 },
                requestType: { max: 101 },
                itemBarcode: { max: 140 },
                type: { max: 100 },
                select: { max: 30 },
                copies: { max: 95 },
              }}
              columnMapping={columnLabels}
              resultsRowClickHandlers={false}
              resultsFormatter={resultsFormatter}
              resultRowFormatter={DefaultMCLRowFormatter}
              newRecordInitialValues={initialValues}
              massageNewRecord={this.massageNewRecord}
              customPaneSub={this.renderPaneSub()}
              onCreate={this.create}
              onCloseNewRecord={this.handleCloseNewRecord}
              parentResources={displayPrintStatusFilteredData ?
                getPrintStatusFilteredData(resources, selectedPrintStatusFilters) : resources}
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
                  fulfillmentTypes,
                  servicePoints,
                  cancellationReasons,
                },
                patronGroups,
                query: resources.query,
                onDuplicate: this.onDuplicate,
                buildRecordsForHoldsShelfReport: this.buildRecordsForHoldsShelfReport,
                isEcsTlrSettingReceived,
                isEcsTlrSettingEnabled,
              }}
              viewRecordOnCollapse={this.viewRecordOnCollapse}
              viewRecordPerms="ui-requests.view"
              newRecordPerms="ui-requests.create"
              renderFilters={this.renderFilters}
              resultIsSelected={this.resultIsSelected}
              onFilterChange={this.handleFilterChange}
              sortableColumns={['requestDate', 'title', 'year', 'itemBarcode', 'callNumber', 'type', 'requestStatus', 'position', 'servicePoint', 'requester', 'requesterBarcode', 'proxy']}
              pageAmount={100}
              pagingType={MCLPagingTypes.PREV_NEXT}
            />
          </div>
          <PrintContent
            printContentTestId="pickSlipsPrintTemplate"
            ref={this.pickSlipsPrintContentRef}
            template={pickSlipsPrintTemplate}
            dataSource={pickSlipsData}
          />
          <PrintContent
            ref={this.printSelectedContentRef}
            template={pickSlipsPrintTemplate}
            dataSource={multiSelectPickSlipData}
          />
          {
            isPrintHoldRequestsEnabled &&
            <PrintContent
              printContentTestId="searchSlipsPrintTemplate"
              ref={this.searchSlipsPrintContentRef}
              template={searchSlipsPrintTemplate}
              dataSource={searchSlipsData}
            />
          }
        </>
      </RequestsRouteShortcutsWrapper>
    );
  }
}

export default stripesConnect(injectIntl(RequestsRoute));
