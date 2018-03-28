import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import { Link } from 'react-router-dom';

import { Accordion, AccordionSet } from '@folio/stripes-components/lib/Accordion';
import Headline from '@folio/stripes-components/lib/Headline';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Layer from '@folio/stripes-components/lib/Layer';
import MetaSection from '@folio/stripes-components/lib/MetaSection';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ItemDetail from './ItemDetail';
import RequestForm from './RequestForm';
import { fulfilmentTypes, requestTypes, toUserAddress } from './constants';
import css from './requests.css';

class ViewRequest extends React.Component {
  static propTypes = {
    dateFormatter: PropTypes.func.isRequired,
    editLink: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    joinRequest: PropTypes.func.isRequired,
    mutator: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        PUT: PropTypes.func,
      }),
    }).isRequired,
    notesToggle: PropTypes.func,
    onClose: PropTypes.func.isRequired,
    onCloseEdit: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
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
    editLink: '',
    paneWidth: '50%',
    onEdit: () => {},
    notesToggle: () => {},
  };

  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{id}',
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
      accordions: {
        'request-info': true,
        'item-info': true,
        'requester-info': true,
      },
    };

    this.makeLocaleDateString = this.makeLocaleDateString.bind(this);
    this.onToggleSection = this.onToggleSection.bind(this);
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
      this.props.onCloseEdit();
    });
  }

  onToggleSection({id}) {
    this.setState((curState) => {
      let newState = _.cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
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
    const { resources, location, stripes } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};
    let request = (resources.selectedRequest && resources.selectedRequest.hasLoaded) ? resources.selectedRequest.records[0] : null;

    let patronGroup;

    // Most of the values needed to populate the view come from the "enhanced" request
    // object, which includes parts of the requester's user record, the item record,
    // and the related loan record (if any) and its borrower.
    if (this.state.enhancedRequest.id) {
      request = this.state.enhancedRequest;
      patronGroup = request.patronGroup;
      if (resources.patronGroups && resources.patronGroups.hasLoaded) {
        const groupRecord = resources.patronGroups.records.find(g => g.id === request.patronGroup);
        patronGroup = groupRecord.group || patronGroup;
        if (this.state.enhancedRequest.requester) {
          this.state.enhancedRequest.requester.patronGroup = groupRecord ? groupRecord.id : null;
        }
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
          href={this.props.editLink}
          onClick={this.props.onEdit}
          title="Edit Request"
        />
      </PaneMenu>
    );

    const requesterName = _.get(request, ['requesterName'], '');
    const requesterBarcode = _.get(request, ['requesterBarcode'], '');
    const requesterRecordLink = requesterName ? <Link to={`/users/view/${request.requesterId}`}>{requesterName}</Link> : '';
    const requesterBarcodeLink = requesterBarcode ? <Link to={`/users/view/${request.requesterId}`}>{requesterBarcode}</Link> : '';
    //  const borrowerRecordLink = borrowerName ? <Link to={`/users/view/${borrower.id}`}>{borrowerName}</Link> : '';

    const addressTypes = (this.props.resources.addressTypes && this.props.resources.addressTypes.hasLoaded) ? this.props.resources.addressTypes.records : [];
    let deliveryAddressDetail;
    if (_.get(request, ['fulfilmentPreference'], '') === 'Delivery') {
      const deliveryAddressType = _.get(request, ['deliveryAddressTypeId'], null);
      if (deliveryAddressType) {
        const deliveryLocationsDetail = _.keyBy(request.requester.addresses, a => a.addressTypeId);
        deliveryAddressDetail = toUserAddress(deliveryLocationsDetail[deliveryAddressType]);
      }
    }
    const holdShelfExpireDate = (_.get(request, ['status'], '') === 'Open - Awaiting pickup') ?
                                this.makeLocaleDateString(_.get(request, ['holdShelfExpirationDate'], '')) : '-';

    const requesterSection = (
      <div>
        <Row>
          <Col xs={12}>
            <div className={`${css.section} ${css.active}`}>
              <Headline size="medium" tag="h3">
                Requester
              </Headline>
              <div>
                {requesterRecordLink} Barcode: {requesterBarcodeLink}
              </div>
            </div>
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
            <KeyValue label="Patron group" value={patronGroup} />
          </Col>
          <Col xs={4}>
            <KeyValue label="Fulfilment preference" value={_.get(request, ['fulfilmentPreference'], '')} />
          </Col>
          {(_.get(request, ['fulfilmentPreference'], '') === 'Delivery') &&
            <Col xs={4}>
              <KeyValue label="Pickup location" value={deliveryAddressDetail} />
            </Col>
          }
        </Row>
      </div>
    );

    return request ? (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="Request Detail" lastMenu={detailMenu} dismissible onClose={this.props.onClose}>
        <AccordionSet accordionStatus={this.state.accordions} onToggle={this.onToggleSection}>
          <Accordion
            open
            id="request-info"
            label="Request information"
          >
            <Row>
              <Col xs={12}>
                <MetaSection
                  id="requestInfoMeta"
                  contentId="requestInfoMetaContent"
                  lastUpdatedDate={request.metaData.updatedDate}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label="Request type" value={_.get(request, ['requestType'], '')} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Request status" value={_.get(request, ['status'], '')} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Request expiration date" value={this.makeLocaleDateString(_.get(request, ['requestExpirationDate'], ''))} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Hold shelf expiration date" value={holdShelfExpireDate} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label="Position in queue" value="" />
              </Col>
            </Row>
          </Accordion>
          <Accordion
            open
            id="item-info"
            label="Item information"
          >
            <ItemDetail request={request} dateFormatter={this.makeLocaleDateString} />
          </Accordion>
          <Accordion
            open
            id="requester-info"
            label="Requester information"
          >
            {request.requesterBarcode ? requesterSection : 'Loading ...'}
          </Accordion>
        </AccordionSet>

        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit Request Dialog">
          <RequestForm
            stripes={stripes}
            initialValues={this.state.enhancedRequest}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
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
