import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';
import fetch from 'isomorphic-fetch';

import Button from '@folio/stripes-components/lib/Button';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Notes from '@folio/stripes-smart-components/lib/Notes';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import makeQueryFunction from '@folio/stripes-components/util/makeQueryFunction';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';
import { requestTypes, fulfilmentTypes } from './constants';

const INITIAL_RESULT_COUNT = 30;
// const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Request Type',
    name: 'request',
    cql: 'requestType',
    values: [
      { name: 'Holds', cql: 'Hold' },
      { name: 'Recalls', cql: 'Recall' },
    ],
  },
];

class Requests extends React.Component {
  static contextTypes = {
    stripes: PropTypes.object,
  }

  static propTypes = {
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    match: PropTypes.shape({
      path: PropTypes.string.isRequired,
    }).isRequired,
    mutator: PropTypes.shape({
      requests: PropTypes.shape({
        GET: PropTypes.func,
        POST: PropTypes.func,
      }),
      addRequestMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      requestCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    notes: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      requests: PropTypes.shape({
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

  static defaultProps = {
    notes: [],
  };

  static manifest = {
    addRequestMode: { initialValue: { mode: false } },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
    requestCount: { initialValue: INITIAL_RESULT_COUNT },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      GET: {
        params: {
          query: makeQueryFunction(
            'requesterId=*',
            'requester.barcode="$QUERY*" or item.title="$QUERY*" or item.barcode="$QUERY*"',
            {
              Title: 'item.title',
              'Item Barcode': 'item.barcode',
              'Request Type': 'requestType',
              Requester: 'requester.lastName requester.firstName',
              'Requester Barcode': 'requester.barcode',
              'Request Date': 'requestDate',
            },
            filterConfig,
          ),
        },
        staticFallback: { params: {} },
      },
    },
    notes: {
      type: 'okapi',
      path: 'notes',
      records: 'notes',
      clear: false,
      GET: {
        params: {
          query: 'link=:{id}',
        },
      },
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
  };

  constructor(props, context) {
    super(props);

    this.okapiUrl = context.stripes.okapi.url;
    this.httpHeaders = Object.assign({}, {
      'X-Okapi-Tenant': context.stripes.okapi.tenant,
      'X-Okapi-Token': context.stripes.store.getState().okapi.token,
      'Content-Type': 'application/json',
    });

    const query = props.location.search ? queryString.parse(props.location.search) : {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      showNotesPane: false,
      sortOrder: query.sort || '',
    };

    this.addRequestFields = this.addRequestFields.bind(this);
    this.collapseDetails = this.collapseDetails.bind(this);
    this.connectedNotes = props.stripes.connect(Notes);
    this.connectedViewRequest = props.stripes.connect(ViewRequest);
    this.create = this.create.bind(this);
    this.findItem = this.findItem.bind(this);
    this.findLoan = this.findLoan.bind(this);
    this.findRequestsForItem = this.findRequestsForItem.bind(this);
    this.findUser = this.findUser.bind(this);
    this.makeLocaleDateString = this.makeLocaleDateString.bind(this);
    this.onChangeFilter = commonChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onClickAddNewRequest = this.onClickAddNewRequest.bind(this);
    this.onClickCloseNewRequest = this.onClickCloseNewRequest.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onSort = this.onSort.bind(this);
    this.toggleNotes = this.toggleNotes.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.updateFilters = this.updateFilters.bind(this);
  }

  onSort(e, meta) {
    const newOrder = meta.alias;
    const oldOrder = this.state.sortOrder;

    const orders = oldOrder ? oldOrder.split(',') : [];
    if (orders.length > 0 && newOrder === orders[0].replace(/^-/, '')) {
      orders[0] = `-${orders[0]}`.replace(/^--/, '');
    } else {
      orders.unshift(newOrder);
    }

    const sortOrder = orders.slice(0, 2).join(',');
    this.setState({ sortOrder });
    this.transitionToParams({ sort: sortOrder });
  }

  /* ************** Search handlers ************** */
  onChangeSearch = (e) => {
    this.props.mutator.requestCount.replace(INITIAL_RESULT_COUNT);
    const query = e.target.value;
    this.setState({ searchTerm: query });
    this.performSearch(query);
  }

  onClearSearch = () => {
    this.setState({ searchTerm: '' });
    this.props.history.push(this.props.location.pathname);
  }

  /* ************** Filter handlers ************** */
  onChangeFilter = (e) => {
    this.props.mutator.requestCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  onSelectRow(e, meta) {
    const requestId = meta.id;
    this.setState({ selectedItem: meta });
    this.props.history.push(`/requests/view/${requestId}${this.props.location.search}`);
  }

  onClickAddNewRequest(e) {
    e.preventDefault();
    this.props.mutator.addRequestMode.replace({ mode: true });
  }

  onClickCloseNewRequest(e) {
    e.preventDefault();
    this.props.mutator.addRequestMode.replace({ mode: false });
  }

  performSearch = _.debounce((query) => {
    this.transitionToParams({ query });
  }, 250);

  // provided for onChangeFilter
  updateFilters(filters) {
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
  }

  collapseDetails() {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  toggleNotes() {
    this.setState((curState) => {
      const show = !curState.showNotesPane;
      return {
        showNotesPane: show,
      };
    });
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
    return fetch(`${this.okapiUrl}/loan-storage/loans?query=(itemId="${itemId}" and status.name<>"Closed")`, { headers: this.httpHeaders }).then(response => response.json());
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

      // Look up the associated borrower (if any) for the loan
      return this.findUser(loan.userId).then((loanUser) => {
        enhancedRequest.loan.userDetail = loanUser.users[0];
        return enhancedRequest;
      });
    });
  }

  create(data) {
    const recordData = Object.assign({}, data);
    recordData.requestDate = new Date();

    // HACK: In order to use redux-form stuff like validation, fields must have a name property.
    // Unfortunately, naming fields means that redux-form will incorporate them as keys into
    // the data object passed through to here. Specifically, the two barcode fields for item
    // and requester are necessary for the form, but incompatible with the request schema.
    // They have to be removed before the record can be posted.
    delete recordData.itemBarcode;
    delete recordData.requesterBarcode;

    this.props.mutator.requests.POST(recordData).then(response => response).then((newRecord) => {
      this.props.mutator.addRequestMode.replace({ mode: false });
      this.props.history.push(`/requests/view/${newRecord.id}${this.props.location.search}`);
    });
  }

  // Helper function to form a locale-aware date for display
  makeLocaleDateString(dateString) {
    if (dateString === '') {
      return '';
    }

    return new Date(Date.parse(dateString)).toLocaleDateString(this.props.stripes.locale);
  }

  render() {
    const { stripes, resources } = this.props;
    const requests = (resources.requests || {}).records || [];
    const patronGroups = resources.patronGroups;// (resources.patronGroups || {}).records || [];
    const addressTypes = (this.props.resources.addressTypes && this.props.resources.addressTypes.hasLoaded) ? this.props.resources.addressTypes.records : [];

    // NOTE: Uncommenting this clause will activate front-end joins of
    // user and item records for every request in the results list. This is
    // probably NOT something we want to do. It's here in case we need something
    // like this later for some reason, but it shouldn't be used under
    // normal circumstances -- and should be removed entirely at some point.
    if (requests.length > 0) {
      // requests = requests.map(this.addRequestFields);
    }

    const searchHeader = (<FilterPaneSearch
      id="SearchField"
      onChange={this.onChangeSearch}
      onClear={this.onClearSearch}
      value={this.state.searchTerm}
      searchAriaLabel="Requests search"
    />);

    const paneTitle = (
      <div style={{ textAlign: 'center' }}>
        <strong>Results</strong>
        <div>
          <em>{requests && requests.length > 0 ? requests.length : '0'} Result{requests.length === 1 ? '' : 's'} Found
          </em>
        </div>
      </div>
    );

    const resultsFormatter = {
      'Item Barcode': rq => (rq.item ? rq.item.barcode : ''),
      'Request Date': rq => new Date(Date.parse(rq.requestDate)).toLocaleDateString(this.props.stripes.locale),
      Requester: rq => (rq.requester ? `${rq.requester.firstName} ${rq.requester.lastName}` : ''),
      'Requester Barcode': rq => (rq.requester ? rq.requester.barcode : ''),
      'Request Type': rq => rq.requestType,
      Title: rq => (rq.item ? rq.item.title : ''),
    };

    const columnMapping = {
      Author: 'author',
    };

    return (
      <Paneset>
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        <Pane
          defaultWidth="fill"
          paneTitle={paneTitle}
          lastMenu={
            <PaneMenu>
              <Button
                id="clickable-new-request"
                title="Add New Request"
                onClick={this.onClickAddNewRequest}
                buttonStyle="primary paneHeaderNewButton"
              >
                + New
              </Button>
            </PaneMenu>
          }
        >
          <MultiColumnList
            contentData={requests}
            virtualize
            autosize
            visibleColumns={['Title', 'Item Barcode', 'Request Type', 'Requester', 'Requester Barcode', 'Request Date']}
            columnMapping={columnMapping}
            formatter={resultsFormatter}
            onHeaderClick={this.onSort}
            onRowClick={this.onSelectRow}
            rowMetadata={['id', 'title']}
            selectedRow={this.state.selectedItem}
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
            isEmptyMessage="No results found. Please check your spelling and filters."
          />
        </Pane>

        {/* Details Pane */}
        <Route
          path={`${this.props.match.path}/view/:requestId`}
          render={props => (
            <this.connectedViewRequest
              stripes={stripes}
              joinRequest={this.addRequestFields}
              paneWidth="44%"
              onClose={this.collapseDetails}
              dateFormatter={this.makeLocaleDateString}
              notesToggle={this.toggleNotes}
              {...props}
            />
          )
          }
        />
        {/* Add new request form */}
        <Layer isOpen={resources.addRequestMode ? resources.addRequestMode.mode : false} label="Add New Request Dialog">
          <RequestForm
            stripes={stripes}
            onSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewRequest}
            findUser={this.findUser}
            findItem={this.findItem}
            findLoan={this.findLoan}
            findRequestsForItem={this.findRequestsForItem}
            optionLists={{ requestTypes, fulfilmentTypes, addressTypes }}
            patronGroups={patronGroups}
            initialValues={{ itemId: null, requesterId: null, requestType: 'Hold', fulfilmentPreference: 'Hold Shelf' }}
            dateFormatter={this.makeLocaleDateString}
          />
        </Layer>
        {
          this.state.showNotesPane &&
          <Route
            path={`${this.props.match.path}/view/:id`}
            render={props => (<this.connectedNotes
              stripes={stripes}
              onToggle={this.toggleNotes}
              link={`requests/${props.match.params.id}`}
              notesResource={this.props.notes}
              {...props}
            />)}
          />
        }
      </Paneset>
    );
  }
}

export default Requests;
