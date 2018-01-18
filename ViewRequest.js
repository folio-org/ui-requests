import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import Icon from '@folio/stripes-components/lib/Icon';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Layer from '@folio/stripes-components/lib/Layer';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import transitionToParams from '@folio/stripes-components/util/transitionToParams';
import removeQueryParam from '@folio/stripes-components/util/removeQueryParam';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';

import RequestForm from './RequestForm';
import { fulfilmentTypes, requestTypes, toUserAddress } from './constants';

class ViewRequest extends React.Component {
  static propTypes = {
    dateFormatter: PropTypes.func.isRequired,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    history: PropTypes.object,
    joinRequest: PropTypes.func.isRequired,
    mutator: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        PUT: PropTypes.func,
      }),
    }).isRequired,
    notesToggle: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    paneWidth: PropTypes.string,
    resources: PropTypes.shape({
      addressTypes: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        records: PropTypes.arrayOf(PropTypes.object),
      }),
      patronGroups: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isPending,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
      }),
      selectedRequest: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        isPending: PropTypes.bool.isPending,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
      }),
    }).isRequired,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    paneWidth: '50%',
    location: {},
    history: {},
    notesToggle: () => {},
  };

  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{requestId}',
    },
    addressTypes: {
      type: 'okapi',
      path: 'addresstypes',
      records: 'addressTypes',
    },
    patronGroups: {
      type: 'okapi',
      path: 'groups',
      records: 'usergroups',
    },
  };

  constructor(props) {
    super(props);

    this.state = {
      enhancedRequest: {},
    };

    this.makeLocaleDateString = this.makeLocaleDateString.bind(this);
    this.onClickCloseEditRequest = this.onClickCloseEditRequest.bind(this);
    this.onClickEditRequest = this.onClickEditRequest.bind(this);
    this.transitionToParams = transitionToParams.bind(this);
    this.removeQueryParam = removeQueryParam.bind(this);
    this.craftLayerUrl = craftLayerUrl.bind(this);
    this.update = this.update.bind(this);
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;

    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && prevRQ.hasLoaded && currentRQ && currentRQ.hasLoaded) {
      if (prevRQ.records[0].id !== currentRQ.records[0].id || !this.state.enhancedRequest.id) {
        const basicRequest = currentRQ.records[0];
        this.props.joinRequest(basicRequest).then((newRequest) => {
          this.setState({
            enhancedRequest: newRequest,
          });
        });
      }
    }
  }

  onClickEditRequest(e) {
    if (e) e.preventDefault();
    this.transitionToParams({ layer: 'edit' });
  }

  onClickCloseEditRequest(e) {
    if (e) e.preventDefault();
    this.removeQueryParam('layer');
  }

  update(record) {
    const updatedRecord = record;

    // Remove the "enhanced record" fields that aren't part of the request schema (and thus can't)
    // be included in the record PUT, or the save will fail
    delete updatedRecord.requesterName;
    delete updatedRecord.requesterBarcode;
    delete updatedRecord.patronGroup;
    delete updatedRecord.itemBarcode;
    delete updatedRecord.title;
    delete updatedRecord.location;
    delete updatedRecord.loan;
    delete updatedRecord.itemStatus;
    delete updatedRecord.itemRequestCount;

    this.props.mutator.selectedRequest.PUT(updatedRecord).then(() => {
      this.onClickCloseEditRequest();
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
    const { resources, location } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    let request = (resources.selectedRequest && resources.selectedRequest.hasLoaded) ? resources.selectedRequest.records[0] : null;

    let patronGroup;
    let borrower;
    let borrowerName;
    let borrowerGroup;

    // Most of the values needed to populate the view come from the "enhanced" request
    // object, which includes parts of the requester's user record, the item record,
    // and the related loan record (if any) and its borrower.
    if (this.state.enhancedRequest.id) {
      request = this.state.enhancedRequest;
      patronGroup = request.patronGroup;
      borrower = request && request.loan && request.loan.userDetail;
      borrowerName = (borrower && borrower.personal) ? `${borrower.personal.firstName} ${borrower.personal.lastName}` : '';
      borrowerGroup = borrower.patronGroup;
      if (resources.patronGroups && resources.patronGroups.hasLoaded) {
        const groupRecord = resources.patronGroups.records.find(g => g.id === request.patronGroup);
        patronGroup = groupRecord.group || patronGroup;
        if (this.state.enhancedRequest.requester) {
          this.state.enhancedRequest.requester.patronGroup = groupRecord ? groupRecord.id : null;
        }
        borrowerGroup = resources.patronGroups.records.find(g => g.id === borrowerGroup).group || borrowerGroup;
      }
    }

    const detailMenu = (
      <PaneMenu>
        <IconButton
          icon="comment"
          id="clickable-show-notes"
          style={{ visibility: !request ? 'hidden' : 'visible' }}
          onClick={this.props.notesToggle}
          title="Show Notes"
        />
        <IconButton
          icon="edit"
          id="clickable-edit-request"
          style={{ visibility: !request ? 'hidden' : 'visible' }}
          href={this.craftLayerUrl('edit')}
          onClick={this.onClickEditRequest}
          title="Edit Request"
        />
      </PaneMenu>
    );

    const itemBarcode = _.get(request, ['itemBarcode'], '');
    const itemRecordLink = itemBarcode ? <Link to={`/items/view/${request.itemId}`}>{itemBarcode}</Link> : '';
    const requesterName = _.get(request, ['requesterName'], '');
    const requesterRecordLink = requesterName ? <Link to={`/users/view/${request.requesterId}`}>{requesterName}</Link> : '';
    const borrowerRecordLink = borrowerName ? <Link to={`/users/view/${borrower.id}`}>{borrowerName}</Link> : '';

    const addressTypes = (this.props.resources.addressTypes && this.props.resources.addressTypes.hasLoaded) ? this.props.resources.addressTypes.records : [];
    let deliveryAddressDetail;
    if (_.get(request, ['fulfilmentPreference'], '') === 'Delivery') {
      const deliveryAddressType = _.get(request, ['deliveryAddressTypeId'], null);
      if (deliveryAddressType) {
        const deliveryLocationsDetail = _.keyBy(request.requester.addresses, a => a.addressTypeId);
        deliveryAddressDetail = toUserAddress(deliveryLocationsDetail[deliveryAddressType]);
      }
    }

    return request ? (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="Request Detail" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <Row>
          <Col xs={12}>
            <KeyValue label="Request type" value={_.get(request, ['requestType'], '')} />
          </Col>
        </Row>
        <fieldset>
          <legend>Item info</legend>
          <Row>
            <Col xs={12}>
              <KeyValue label="Item barcode" value={itemRecordLink} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Title" value={_.get(request, ['title'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Author" value={_.get(request, ['author'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Shelving location" value={_.get(request, ['location'], '')} />
            </Col>
          </Row>
        </fieldset>
        <fieldset>
          <legend>Current Loan</legend>
          <Row>
            <Col xs={4}>
              <KeyValue label="Loaned to" value={borrowerRecordLink} />
            </Col>
            <Col xs={4}>
              <KeyValue label="Patron group" value={borrowerGroup} />
            </Col>
            <Col xs={4}>
              <KeyValue label="Status" value={_.get(request, ['itemStatus', 'name'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <KeyValue label="Current due date" value={this.makeLocaleDateString(_.get(request, ['loan', 'dueDate'], ''))} />
            </Col>
            <Col xs={6}>
              <KeyValue label="Requests" value={_.get(request, ['itemRequestCount'], '')} />
            </Col>
          </Row>
        </fieldset>
        <fieldset>
          <legend>Requester info</legend>
          <Row>
            <Col xs={12}>
              <KeyValue label="Requester name" value={requesterRecordLink} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Patron group" value={patronGroup} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Fulfilment preference" value={_.get(request, ['fulfilmentPreference'], '')} />
            </Col>
          </Row>
          {(_.get(request, ['fulfilmentPreference'], '') === 'Delivery') &&
            <Row>
              <Col xs={12}>
                <KeyValue label="Delivery address" value={deliveryAddressDetail} />
              </Col>
            </Row>
          }
        </fieldset>
        <fieldset>
          <legend>Request details</legend>
          <Row>
            <Col xs={12}>
              <KeyValue label="Request expiration date" value={this.makeLocaleDateString(_.get(request, ['requestExpirationDate'], ''))} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Hold shelf expiration date" value={this.makeLocaleDateString(_.get(request, ['holdShelfExpirationDate'], ''))} />
            </Col>
          </Row>
        </fieldset>
        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit Request Dialog">
          <RequestForm
            initialValues={this.state.enhancedRequest}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.onClickCloseEditRequest}
            optionLists={{ requestTypes, fulfilmentTypes, addressTypes }}
            patronGroups={this.props.resources.patronGroups}
            dateFormatter={this.props.dateFormatter}
          />
        </Layer>
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
