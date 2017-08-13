import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';

import Button from '@folio/stripes-components/lib/Button';
import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import Layer from '@folio/stripes-components/lib/Layer';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';

import ViewRequest from './ViewRequest';
import RequestForm from './RequestForm';

const INITIAL_RESULT_COUNT = 30;
const RESULT_COUNT_INCREMENT = 30;

const filterConfig = [
  {
    label: 'Request Type',
    name: 'request',
    cql: '',
    values: ['Hold', { name: 'Paging request', cql: 'paging' }, 'Recall'],
  },
];

class Requests extends React.Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
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
      addRequestMode: PropTypes.shape({
        replace: PropTypes.func,
      }),
      requestCount: PropTypes.shape({
        replace: PropTypes.func,
      }),
    }).isRequired,
    okapi: PropTypes.object,
    resources: PropTypes.shape({
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
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static manifest = {
    addRequestMode: { initialValue: { mode: false } },
    requestCount: { initialValue: INITIAL_RESULT_COUNT },
    requests: {
      type: 'okapi',
      path: 'request-storage/requests',
      records: 'requests'
    },
    // Metadata from associated ITEM and USER records will, hopefully,
    // be aggregated in a business logic module somewhere. For now, though,
    // these next entries are necessary
    users: {
      type: 'okapi',
      path: 'users',
      records: 'users',
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
    },
  };

  constructor(props) {
    super(props);

    const query = props.location.search ? queryString.parse(props.location.search) : {};
    this.state = {
      filters: initialFilterState(filterConfig, query.filters),
      selectedItem: {},
      searchTerm: query.query || '',
      sortOrder: query.sort || '',
    };

    this.addRequestFields = this.addRequestFields.bind(this);
    this.collapseDetails = this.collapseDetails.bind(this);
    this.connectedViewRequest = props.stripes.connect(ViewRequest);
    this.findItem = this.findItem.bind(this);
    this.findUser = this.findUser.bind(this);
    this.onChangeFilter = commonChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.onClickAddNewRequest = this.onClickAddNewRequest.bind(this);
    this.onClickCloseNewRequest = this.onClickCloseNewRequest.bind(this);
    this.onSelectRow = this.onSelectRow.bind(this);
    this.onSort = this.onSort.bind(this);
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

  performSearch = _.debounce((query) => {
    this.transitionToParams({ query });
  }, 250);

  /* ************** Filter handlers ************** */
  onChangeFilter = (e) => {
    this.props.mutator.requestCount.replace(INITIAL_RESULT_COUNT);
    this.commonChangeFilter(e);
  }

  // provided for onChangeFilter
  updateFilters(filters) {
    this.transitionToParams({ filters: Object.keys(filters).filter(key => filters[key]).join(',') });
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

  collapseDetails() {
    this.setState({
      selectedItem: {},
    });
    this.props.history.push(`${this.props.match.path}${this.props.location.search}`);
  }

  findUser(id) {
    console.log("finduser", id, this.props.data.users)
    return _.find(this.props.data.users, { id });
  }

  findItem(id) {
    console.log("finditem", id, this.props.data.items)

    return this.props.data.items.length > 0 ? _.find(this.props.data.items, { id }) : null;
  }

  // Called as a map function
  addRequestFields(r) {
    // Approach: process each entry in the requests list. For each one, do two lookups (ugh),
    // one to find the referenced item and one to fetch the referenced user. Then modify the array structure
    // to include the fields we need

    const item = this.findItem(r.itemId);
    const user = this.findUser(r.requesterId);

    r.title = item ? item.title : '';
    r.itemBarcode = item ? item.barcode : '';
    r.requesterName = user ? `${user.personal.firstName} ${user.personal.lastName}` : '';
    r.requesterBarcode = user ? user.barcode : '';

    return r;
  }

  create(record) {

  }

  render() {
    const { stripes } = this.props;
    const requests = this.props.data.requests || [];
    //const { requests: requestsInfo } = this.props.resources;

    if (requests.length > 0) {
      requests.map(this.addRequestFields);
    }

    const searchHeader = <FilterPaneSearch
      id="SearchField"
      onChange={this.onChangeSearch}
      onClear={this.onClearSearch}
      value={this.state.searchTerm}
      searchAriaLabel="Requests search"
    />;

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
      'Item Barcode': rq => rq.itemBarcode,
      'Request Date': rq => new Date(Date.parse(rq.requestDate)).toLocaleDateString(this.props.stripes.locale),
      'Requester': rq => rq.requesterName,
      'Requester Barcode': rq => rq.requesterBarcode,
      'Request Type': rq => rq.requestType,
      'Title': rq => rq.title,
    };

    const columnMapping = {
      Author: 'author'
    };

    return (
      <Paneset>
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        <Pane defaultWidth="fill" paneTitle={paneTitle} lastMenu={
          <PaneMenu>
            <Button
              title="Add New Request"
              onClick={this.onClickAddNewRequest} buttonStyle="primary paneHeaderNewButton">+ New</Button>
          </PaneMenu>
        }>
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
            sortOrder={this.state.sortOrder.replace(/^-/, '').replace(/,.*/, '')}
            sortDirection={this.state.sortOrder.startsWith('-') ? 'descending' : 'ascending'}
          />
        </Pane>

        {/* Details Pane */}
        <Route
          path={`${this.props.match.path}/view/:requestId`}
          render={props => <this.connectedViewRequest stripes={stripes} requests={requests} paneWidth="44%" onClose={this.collapseDetails} {...props} />}
        />
        {/* Add new request form */}
        <Layer isOpen={this.props.data.addRequestMode ? this.props.data.addRequestMode.mode : false} label="Add New Request Dialog">
          <RequestForm
            handleSubmit={(record) => { this.create(record); }}
            onCancel={this.onClickCloseNewRequest}
          />
        </Layer>
      </Paneset>
    )
  }

}

export default Requests;
