import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';

class ViewRequest extends React.Component {

  static manifest = Object.freeze({
    // requests: {
    //   type: 'okapi',
    //   path: 'request-storage/requests/:{requestId}',
    //   clear: false,
    // },
  });

  constructor(props) {
    super(props);

  }

  render() {
    const { requests, match: { params: { requestId }}} = this.props;

    if (!requests || !requestId) return <div />;

    let request = requests.find(r => r.id == requestId);
    
    if (request) {
      request = this.props.joinRequest(request);
      console.log("new request is", request)
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
              <KeyValue label="Patron group" value={_.get(request, ['patronGroup'], '')} />
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
        </fieldset>
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
