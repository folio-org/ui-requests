import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Link } from 'react-router-dom';

import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Pane from '@folio/stripes-components/lib/Pane';

class ViewRequest extends React.Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    paneWidth: PropTypes.string,
    request: PropTypes.object.isRequired,
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
  };

  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'request-storage/requests/:{requestId}',
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
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps, prevState) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;

    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && prevRQ.hasLoaded && currentRQ && currentRQ.hasLoaded) {
      if (prevRQ.records[0].id !== currentRQ.records[0].id || !this.state.enhancedRequest.id) {
        const basicRequest = currentRQ.records[0];
        this.props.joinRequest(basicRequest).then(newRequest => {
          this.setState({
            enhancedRequest: newRequest,
          });
        });
      }
    }
  }
  
  // Helper function to form a locale-aware date for display
  makeLocaleDateString(dateString) {
    if (dateString === '') {
      return '';
    }
    else {
      return new Date(Date.parse(dateString)).toLocaleDateString(this.props.stripes.locale);
    }
  }

  render() {
    const { resources } = this.props;
    let request = (resources.selectedRequest && resources.selectedRequest.hasLoaded) ? resources.selectedRequest.records[0] : null;
    
    let patronGroup, borrower, borrowerName, borrowerGroup;
    
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
        patronGroup = resources.patronGroups.records.find(g => g.id === request.patronGroup).group || patronGroup;
        borrowerGroup = resources.patronGroups.records.find(g => g.id === borrowerGroup).group || borrowerGroup;
      }
    }
    
    let itemRecordLink, requesterRecordLink;
    const itemBarcode = _.get(request, ['itemBarcode'], '');
    itemRecordLink = itemBarcode ? <Link to={`/items/view/${request.itemId}`}>{itemBarcode}</Link> : '';
    
    const requesterName = _.get(request, ['requesterName'], '');
    requesterRecordLink = requesterName ? <Link to={`/users/view/${request.requesterId}`}>{requesterName}</Link> : '';
    
    const borrowerRecordLink = borrowerName ? <Link to={`/users/view/${borrower.id}`}>{borrowerName}</Link> : '';

    return request ? (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="Request Detail" dismissible onClose={this.props.onClose}>
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
              <KeyValue label="Status" value={_.get(request, ['loan', 'status', 'name'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <KeyValue label="Current due date" value={this.makeLocaleDateString(_.get(request, ['loan', 'dueDate'], ''))} />
            </Col>
            <Col xs={6}>
              <KeyValue label="Requests" value={_.get(request, [], '')} />
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
              <KeyValue label="Request type" value={_.get(request, ['requestType'], '')} />
            </Col>
          </Row>
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
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
