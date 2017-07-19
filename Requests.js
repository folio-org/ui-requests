import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import queryString from 'query-string';

import FilterGroups, { initialFilterState, onChangeFilter as commonChangeFilter } from '@folio/stripes-components/lib/FilterGroups';
import FilterPaneSearch from '@folio/stripes-components/lib/FilterPaneSearch';
import MultiColumnList from '@folio/stripes-components/lib/MultiColumnList';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';

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
    requestCount: { initialValue: INITIAL_RESULT_COUNT },
    // TODO: 'requests' that follows is a stub -- has to be replaced with proper
    // back-end connection once it's ready.
    requests: {
      initialValue: [
        { id: 1, title: 'Item 1', author: 'A1', barcode: '14234125123', requestType: 'Recall', requestor: 'Arby Bodwin', reqBarcode: '1806808068', date: '05/06/17' },
        { id: 2, title: 'Item 2', author: 'A2', barcode: '108058093403', requestType: 'Recall', requestor: 'Arby Bodwin', reqBarcode: '1806808068', date: '05/06/17' },
        { id: 3, title: 'Item 3', author: 'A1', barcode: '198015808312', requestType: 'Recall', requestor: 'Arby Bodwin', reqBarcode: '1806808068', date: '05/06/17' },
      ],
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

    this.onChangeFilter = commonChangeFilter.bind(this);
    this.onChangeSearch = this.onChangeSearch.bind(this);
    this.onClearSearch = this.onClearSearch.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.updateFilters = this.updateFilters.bind(this);
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

  render() {
    const requests = this.props.data.requests || [];
    const { requests: requestsInfo } = this.props.resources;

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
          <em>{requestsInfo && requestsInfo.hasLoaded ? requestsInfo.other.totalRecords : '0'} Result{requests.length === 1 ? '' : 's'} Found
          </em>
        </div>
      </div>
    );

    const resultsFormatter = {
      Author: rq => rq.author,
      'Item Barcode': rq => rq.barcode,
      'Request Date': rq => rq.date,
      Requestor: rq => rq.requestor,
      'Requestor Barcode': rq => rq.reqBarcode,
      'Request Type': rq => rq.requestType,
      Title: rq => rq.title,
    };

    return (
      <Paneset>
        <Pane defaultWidth="16%" header={searchHeader}>
          <FilterGroups config={filterConfig} filters={this.state.filters} onChangeFilter={this.onChangeFilter} />
        </Pane>
        <Pane defaultWidth="fill" paneTitle={paneTitle}>
          <MultiColumnList
            contentData={requests}
            virtualize
            autosize={true}
            visibleColumns={['Title', 'Author', 'Item Barcode', 'Request Type', 'Requestor', 'Requestor Barcode', 'Request Date']}
            formatter={resultsFormatter}
          />
        </Pane>
      </Paneset>
    )
  }

}

export default Requests;
