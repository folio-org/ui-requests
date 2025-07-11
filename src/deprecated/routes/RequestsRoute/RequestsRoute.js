import {
  get,
  isEmpty,
  isArray,
  size,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import {
  stringify,
  parse,
} from 'query-string';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';
import DOMPurify from 'dompurify';

import {
  AppIcon,
  stripesConnect,
  IfPermission,
  CalloutContext,
  TitleManager,
} from '@folio/stripes/core';
import {
  Button,
  Checkbox,
  filters2cql,
  FormattedTime,
  TextLink,
  DefaultMCLRowFormatter,
  NoValue,
  MCLPagingTypes,
  Icon,
  exportToCsv,
  dayjs,
} from '@folio/stripes/components';
import {
  deparseFilters,
  makeQueryFunction,
  SearchAndSort,
} from '@folio/stripes/smart-components';
import {
  convertToSlipData,
  effectiveCallNumber,
  getHeaderWithCredentials,
} from '@folio/stripes/util';

import ViewRequest from '../../components/ViewRequest/ViewRequest';
import RequestFormContainer from '../../components/RequestFormContainer/RequestFormContainer';

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
  PRINT_DETAILS_COLUMNS,
  requestFilterTypes,
} from '../../../constants';
import {
  buildUrl,
  getFullName,
  duplicateRequest,
  getInstanceQueryString,
  isDuplicateMode,
  generateUserName,
  getRequestErrorMessage,
  getSelectedSlipDataMulti,
  selectedRowsNonPrintable,
  getNextSelectedRowsState,
} from '../../../utils';
import { getTlrSettings } from '../../utils';
import packageInfo from '../../../../package';
import CheckboxColumn from '../../../components/CheckboxColumn';

import {
  PrintButton,
  PrintContent,
  ErrorModal,
  LoadingButton,
} from '../../../components';

import {
  RequestsFilters,
  RequestsFiltersConfig,
} from '../../components/RequestsFilters';
import RequestsRouteShortcutsWrapper from '../../../components/RequestsRouteShortcutsWrapper';
import {
  isReorderableRequest,
  getFormattedYears,
  getStatusQuery,
  getFullNameForCsvRecords,
  updateQuerySortString,
  getPrintedDetails,
} from '../../../routes/utils';
import SinglePrintButtonForPickSlip from '../../../components/SinglePrintButtonForPickSlip';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;
const DEFAULT_FORMATTER_VALUE = '';

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
  return [...new Set(pickSlipsData.map(pickSlip => pickSlip['request.requestID']))];
};

export const getLastPrintedDetails = (printDetails, intl) => {
  const fullName = getFullName(printDetails?.lastPrintRequester);
  const formattedDate = intl.formatDate(printDetails?.printEventDate);
  const formattedTime = intl.formatTime(printDetails?.printEventDate);
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
  }) => {
    if (requestId) {
      return `circulation/requests/allowed-service-points?operation=${operation}&requestId=${requestId}`;
    }

    let requestUrl = `circulation/requests/allowed-service-points?requesterId=${requesterId}&operation=${operation}`;

    if (itemId) {
      requestUrl = `${requestUrl}&itemId=${itemId}`;
    } else if (instanceId) {
      requestUrl = `${requestUrl}&instanceId=${instanceId}`;
    }

    return requestUrl;
  },
};

export const getListFormatter = (
  {
    getRowURL,
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
    onAfterPrintForSinglePrintButton,
  }
) => ({
  'select': rq => (
    <CheckboxColumn
      request={rq}
      selectedRows={selectedRows}
      toggleRowSelection={toggleRowSelection}
    />),
  'itemBarcode': rq => (rq?.item?.barcode || <NoValue />),
  'position': rq => (rq.position || <NoValue />),
  'proxy': rq => (rq.proxy ? getFullName(rq.proxy) : <NoValue />),
  'requestDate': rq => (
    <AppIcon size="small" app="requests">
      <FormattedTime value={rq.requestDate} day="numeric" month="numeric" year="numeric" />
    </AppIcon>
  ),
  'requester': rq => (rq.requester ? getFullName(rq.requester) : <NoValue />),
  'singlePrint': rq => {
    const singlePrintButtonProps = {
      request: rq,
      pickSlipsToCheck,
      pickSlipsPrintTemplate,
      onBeforeGetContentForSinglePrintButton,
      pickSlipsData,
      getPrintContentRef,
      ...(isViewPrintDetailsEnabled && {
        onBeforePrintForSinglePrintButton,
        onAfterPrintForSinglePrintButton,
      }),
    };
    return (
      <SinglePrintButtonForPickSlip {...singlePrintButtonProps} />);
  },
  'requesterBarcode': rq => (rq?.requester?.barcode || <NoValue />),
  'requestStatus': rq => (requestStatusesTranslations[rq.status]
    ? <FormattedMessage id={requestStatusesTranslations[rq.status]} />
    : <NoValue />),
  'type': rq => <FormattedMessage id={requestTypesTranslations[rq.requestType]} />,
  'title': rq => <TextLink to={getRowURL(rq.id)}>{(rq.instance ? rq.instance.title : <NoValue />)}</TextLink>,
  'year': rq => (getFormattedYears(rq.instance?.publication, DEFAULT_DISPLAYED_YEARS_AMOUNT) || <NoValue />),
  'callNumber': rq => (effectiveCallNumber(rq.item) || <NoValue />),
  'servicePoint': rq => get(rq, 'pickupServicePoint.name', <NoValue />),
  'retrievalServicePoint': rq => get(rq, 'item.retrievalServicePointName', DEFAULT_FORMATTER_VALUE),
  'copies': rq => get(rq, PRINT_DETAILS_COLUMNS.COPIES, <NoValue />),
  'printed': rq => (rq.printDetails ? getLastPrintedDetails(rq.printDetails, intl) : <NoValue />),
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
            '(id=="%{query.query}" or requesterId=="%{query.query}" or requester.barcode=="%{query.query}*" or instance.title="%{query.query}*" or instanceId="%{query.query}*" or item.barcode=="%{query.query}*" or itemId=="%{query.query}" or itemIsbn="%{query.query}" or searchIndex.callNumberComponents.callNumber=="%{query.query}*" or fullCallNumberIndex=="%{query.query}*")',
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
              'retrievalServicePoint': 'item.retrievalServicePointName',
              'requestDate': 'requestDate',
              'position': 'position/number',
              'proxy': 'proxy',
              'copies': 'printDetails.printCount/number',
              'printed': 'printDetails.printEventDate',
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
      records: 'configs',
      path: 'configurations/entries',
      params: {
        query: '(module==SETTINGS and configName==TLR)',
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
    intl: PropTypes.shape({
      formatDate: PropTypes.func,
      formatTime: PropTypes.func,
      formatMessage: PropTypes.func,
    }).isRequired,
    mutator: PropTypes.shape({
      records: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      reportRecords: PropTypes.shape({
        GET: PropTypes.func,
      }),
      query: PropTypes.shape({
        update: PropTypes.func,
      }),
      requestCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
      resultOffset: PropTypes.shape({
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
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
            addressType: PropTypes.string,
          })
        ),
      }),
      currentServicePoint: PropTypes.shape({
        id: PropTypes.string,
      }).isRequired,
      query: PropTypes.shape({
        instanceId: PropTypes.string,
      }),
      records: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          })
        ),
      }),
      staffSlips: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            name: PropTypes.string,
          })
        ).isRequired,
      }),
      pickSlips: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            currentDateTime: PropTypes.string,
          })
        ).isRequired,
        isPending: PropTypes.bool,
      }),
      searchSlips: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            currentDateTime: PropTypes.string,
          })
        ).isRequired,
        isPending: PropTypes.bool,
      }),
      configs: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.shape({
              titleLevelRequestsFeatureEnabled: PropTypes.bool,
            })
          })
        ).isRequired,
      }),
      printHoldRequests: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.string,
          })
        ),
      }),
      circulationSettings: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.shape({
              enablePrintLog: PropTypes.string,
            }),
          })
        ),
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
      user: PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.string,
          username: PropTypes.string,
        })
      }).isRequired,
      timezone: PropTypes.string.isRequired,
      locale: PropTypes.string.isRequired,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
    location: PropTypes.shape({
      search: PropTypes.string,
      pathname: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string,
    }).isRequired,
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
    // Map to pass into exportToCsv
    this.columnHeadersMap = this.getColumnHeaders(reportHeaders);
    this.expiredHoldsReportColumnHeaders = this.getColumnHeaders(expiredHoldsReportHeaders);

    this.state = {
      csvReportPending: false,
      submitting: false,
      errorMessage: '',
      errorModalData: {},
      servicePointId: '',
      requests: [],
      selectedRows: {},
      titleLevelRequestsFeatureEnabled,
      createTitleLevelRequestsByDefault,
      isViewPrintDetailsEnabled: false,
    };

    this.pickSlipsPrintContentRef = React.createRef();
    this.searchSlipsPrintContentRef = React.createRef();
    this.paneTitleRef = React.createRef();
    this.printSelectedContentRef = React.createRef();
  }

  static getDerivedStateFromProps(props, state) {
    const layer = (props.resources.query || {}).layer;
    const newState = {};
    const currViewPrintDetailsSettings = get(props.resources, 'circulationSettings.records[0].value.enablePrintLog') === 'true';

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
    this.setCurrentServicePointId();
  }

  componentDidUpdate(prevProps) {
    const patronBlocks = get(this.props.resources, ['patronBlocks', 'records'], []);
    const prevBlocks = get(prevProps.resources, ['patronBlocks', 'records'], []);
    const { submitting, isViewPrintDetailsEnabled } = this.state;
    const prevExpired = prevBlocks.filter(p => dayjs(dayjs(p.expirationDate).format()).isSameOrBefore(dayjs().format()) && p.expirationDate) || [];
    const expired = patronBlocks.filter(p => dayjs(dayjs(p.expirationDate).format()).isSameOrBefore(dayjs().format()) && p.expirationDate) || [];
    const { id: currentServicePointId } = this.getCurrentServicePointInfo();
    const prevStateServicePointId = get(prevProps.resources.currentServicePoint, 'id');
    const { configs: prevConfigs } = prevProps.resources;
    const { resources, location, mutator } = this.props;
    const { configs, query } = resources;
    const instanceId = parse(location?.search)?.instanceId;

    if (prevExpired.length > 0 && expired.length === 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: false });
    }

    if (expired.length > 0 && !submitting) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ submitting: true });
      expired.forEach(p => {
        mutator.activeRecord.update({ blockId: p.id });
        mutator.patronBlocks.DELETE({ id: p.id });
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

    if (!query.instanceId && instanceId) {
      mutator.query.update({ instanceId });
    }

    if (!resources.records.isPending) {
      this.onSearchComplete(resources.records);
    }

    if (!isViewPrintDetailsEnabled) {
      this.handlePrintDetailsDisabled();
    }
  }

  handlePrintDetailsDisabled() {
    /**
     * The function handles the following actions when `isViewPrintDetailsEnabled` is false:
     *
     * 1. If `filters` in query includes 'PRINT STATUS' filter:
     *    - it clears the 'PRINT STATUS' filter from query by invoking `handleFilterChange`.
     *
     * 2. If `sort` in query includes sort by 'printed' or 'copies' column:
     *    - it removes sorting by 'printed' or 'copies' from the sort query. If both are being sorted,
     *    the sorting is updated to 'requestDate' instead.
    */
    const { resources: { query }, mutator } = this.props;
    const printStatusFilterInQuery = this.getActiveFilters()[requestFilterTypes.PRINT_STATUS];

    if (printStatusFilterInQuery?.length) {
      this.handleFilterChange({ name: requestFilterTypes.PRINT_STATUS, values: [] });
    }

    if (query.sort?.includes('printed') || query.sort?.includes('copies')) {
      const sort = updateQuerySortString(query.sort);
      mutator.query.update({ sort });
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

    // Build a custom query for the CSV record export, which has to include
    // all search and filter parameters
    const queryClauses = [];
    let queryString;

    const queryTerm = this.props.resources?.query?.query;
    const filterQuery = filters2cql(RequestsFiltersConfig, deparseFilters(this.getActiveFilters()));

    if (queryTerm) {
      queryString = `(requesterId=="${queryTerm}" or requester.barcode=="${queryTerm}*" or item.title="${queryTerm}*" or item.barcode=="${queryTerm}*" or itemId=="${queryTerm}")`;
      queryClauses.push(queryString);
    }
    if (filterQuery) queryClauses.push(filterQuery);

    queryString = queryClauses.join(' and ');
    const records = await this.fetchReportData(this.props.mutator.reportRecords, queryString);
    const recordsToCSV = this.buildRecords(records);

    this.columnHeadersMap = this.state.isViewPrintDetailsEnabled ? this.columnHeadersMap :
      getFilteredColumnHeadersMap(this.columnHeadersMap);

    exportToCsv(recordsToCSV, {
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

      record.requestUuid = record?.id;

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
        record.printDetails.lastPrintedDetails = getPrintedDetails(record);
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
      if (record?.item?.retrievalServicePointName) {
        record.retrievalServicePointName = record.item.retrievalServicePointName;
      }
      record.instance.contributorNames = contributorNamesMap.join('; ');
      if (record.tags) record.tags.tagList = tagListMap.join('; ');
    });

    return result;
  }

  // idType can be 'id', 'barcode', etc.
  findResource(resource, value, idType = 'id') {
    const query = urls[resource](value, idType);

    return fetch(`${this.okapiUrl}/${query}`, this.httpHeadersOptions).then(response => response.json());
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

  getHelperResourcePath = (helper, id) => `circulation/requests/${id}`;

  massageNewRecord = (requestData) => {
    const { intl: { timeZone } } = this.props;
    const isoDate = dayjs().tz(timeZone).toISOString();
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

  create = (data) => {
    const query = new URLSearchParams(this.props.location.search);
    const mode = query.get('mode');

    return this.props.mutator.records.POST(data)
      .then(() => {
        this.closeLayer();

        this.context.sendCallout({
          message: isDuplicateMode(mode)
            ? (
              <FormattedMessage
                id="ui-requests.duplicateRequest.success"
                values={{ requester: generateUserName(data.requester.personal) }}
              />
            )
            : (
              <FormattedMessage
                id="ui-requests.createRequest.success"
                values={{ requester: generateUserName(data.requester.personal) }}
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
    exportToCsv(recordsToCSV, {
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

    return DOMPurify.sanitize(get(slipTemplate, 'template', ''), { ADD_TAGS: ['Barcode'] });
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

  savePrintEventDetails = async (requestIds) => {
    const currDateTime = new Date();
    const printTimeStamp = currDateTime.toISOString();
    const { id: loggedInUserId, username: loggedInUsername } = this.props.stripes.user.user;

    try {
      await this.props.mutator.savePrintDetails.POST({
        'requestIds': requestIds,
        'requesterName': loggedInUsername,
        'requesterId': loggedInUserId,
        'printEventDate': printTimeStamp
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to save print event details:', error);
    }
  };

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

  onAfterPrintForPrintButton = () => {
    if (this.state.isViewPrintDetailsEnabled) {
      this.props.mutator.resultOffset.replace(0);
    }
  }

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
      retrievalServicePoint: <FormattedMessage id="ui-requests.requests.retrievalServicePoint" />,
      singlePrint: <FormattedMessage id="ui-requests.requests.singlePrint" />,
      proxy: <FormattedMessage id="ui-requests.requests.proxy" />,
      ...(isViewPrintDetailsEnabled && {
        copies: <FormattedMessage id="ui-requests.requests.copies" />,
        printed: <FormattedMessage id="ui-requests.requests.printed" />,
      }),
    };

    const isPickSlipsArePending = resources?.pickSlips?.isPending;
    const isSearchSlipsArePending = resources?.searchSlips?.isPending;
    const requestsEmpty = isEmpty(requests);
    const isPickSlipsEmpty = isEmpty(pickSlips);
    const isSearchSlipsEmpty = isEmpty(searchSlips);
    const pickSlipsPrintTemplate = this.getPrintTemplate(SLIPS_TYPE.PICK_SLIP);
    const searchSlipsPrintTemplate = this.getPrintTemplate(SLIPS_TYPE.SEARCH_SLIP_HOLD_REQUESTS);
    const pickSlipsData = convertToSlipData(pickSlips, intl, timezone, locale, {
      slipName: SLIPS_TYPE.PICK_SLIP,
      user,
    });
    const searchSlipsData = convertToSlipData(searchSlips, intl, timezone, locale, {
      slipName: SLIPS_TYPE.SEARCH_SLIP_HOLD_REQUESTS,
    });
    let multiSelectPickSlipData = getSelectedSlipDataMulti(pickSlipsData, selectedRows);

    const resultsFormatter = getListFormatter(
      {
        getRowURL: this.getRowURL,
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
        onAfterPrintForSinglePrintButton: this.onAfterPrintForPrintButton,
      }
    );

    const isPrintingDisabled = isPickSlipsEmpty || selectedRowsNonPrintable(pickSlipsData, selectedRows);

    const actionMenu = ({ onToggle, renderColumnsMenu }) => (
      <>
        <IfPermission perm="ui-requests.create">
          <Button
            buttonStyle="dropdownItem"
            id="clickable-newrequest"
            to={`${this.props.location.pathname}?layer=create`}
            onClick={onToggle}
          >
            <Icon icon="plus-sign">
              <FormattedMessage id="stripes-smart-components.new" />
            </Icon>
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
            <Icon icon="download">
              <FormattedMessage id="ui-requests.exportSearchResultsCsv" />
            </Icon>
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
                <Icon icon="report">
                  <FormattedMessage
                    id="ui-requests.exportExpiredHoldShelfCsv"
                    values={{ currentServicePoint: servicePointName }}
                  />
                </Icon>
              </Button>
              <PrintButton
                buttonStyle="dropdownItem"
                id="printPickSlipsBtn"
                disabled={isPickSlipsEmpty}
                template={pickSlipsPrintTemplate}
                contentRef={this.pickSlipsPrintContentRef}
                onBeforeGetContent={() => this.onBeforeGetContentForPrintButton(onToggle)}
                onBeforePrint={async () => {
                  if (isViewPrintDetailsEnabled) {
                    const requestIds = extractPickSlipRequestIds(pickSlipsData);
                    await this.savePrintEventDetails(requestIds);
                  }
                }}
                onAfterPrint={this.onAfterPrintForPrintButton}
              >
                <Icon icon="print">
                  <FormattedMessage
                    id="ui-requests.printPickSlipsForSp"
                    values={{ sp: servicePointName }}
                  />
                </Icon>
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
                  async () => {
                    if (isViewPrintDetailsEnabled) {
                      const selectedPickSlips = getSelectedSlipDataMulti(pickSlipsData, selectedRows);
                      const selectedRequestIds = extractPickSlipRequestIds(selectedPickSlips);
                      await this.savePrintEventDetails(selectedRequestIds);
                    }
                  }
                }
                onAfterPrint={this.onAfterPrintForPrintButton}
              >
                <Icon icon="print">
                  <FormattedMessage
                    id="ui-requests.printSelectedPickSlipsForSp"
                    values={{ sp: servicePointName }}
                  />
                </Icon>
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
                    <Icon icon="print">
                      <FormattedMessage
                        id="ui-requests.printSearchSlipsForSp"
                        values={{ sp: servicePointName }}
                      />
                    </Icon>
                  </PrintButton>
              }
            </>
        }
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
              hasRowClickHandlers={false}
              resultsFormatter={resultsFormatter}
              resultRowFormatter={DefaultMCLRowFormatter}
              newRecordInitialValues={initialValues}
              massageNewRecord={this.massageNewRecord}
              customPaneSub={this.renderPaneSub()}
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
                  fulfillmentTypes,
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
              sortableColumns={['requestDate', 'title', 'year', 'itemBarcode', 'callNumber', 'type', 'requestStatus',
                'position', 'servicePoint', 'requester', 'requesterBarcode', 'retrievalServicePoint', 'proxy', 'copies', 'printed']}
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
