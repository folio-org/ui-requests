import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Pane from '@folio/stripes-components/lib/Pane';

class ViewRequest extends React.Component {

  static propTypes = {
    onClose: PropTypes.func.isRequired,
    paneWidth: PropTypes.string,
    request: PropTypes.object.isRequired,
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
  }

  componentDidUpdate(prevProps, prevState) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;

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

  render() {
    const { resources } = this.props;
    let request = (resources.selectedRequest && resources.selectedRequest.hasLoaded) ? resources.selectedRequest.records[0] : null;
    let patronGroup;

    if (this.state.enhancedRequest.id) {
      request = this.state.enhancedRequest;
      patronGroup = request.patronGroup;
      if (resources.patronGroups && resources.patronGroups.hasLoaded) {
        patronGroup = resources.patronGroups.records.find(g => g.id === request.patronGroup).group || patronGroup;
      }
    }

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
              <KeyValue label="Item barcode" value={_.get(request, ['itemBarcode'], '')} />
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
          <legend>Requester info</legend>
          <Row>
            <Col xs={12}>
              <KeyValue label="Requester name" value={_.get(request, ['requesterName'], '')} />
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
              <KeyValue label="Request expiration date" value={_.get(request, ['requestExpirationDate'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="Hold shelf expiration date" value={_.get(request, ['holdShelfExpirationDate'], '')} />
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <KeyValue label="id" value={_.get(request, ['id'], '')} />
            </Col>
          </Row>
        </fieldset>
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
