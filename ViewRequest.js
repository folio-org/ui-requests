import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { Accordion, AccordionSet } from '@folio/stripes-components/lib/Accordion';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Layer from '@folio/stripes-components/lib/Layer';
import MetaSection from '@folio/stripes-components/lib/MetaSection';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import ItemDetail from './ItemDetail';
import UserDetail from './UserDetail';
import RequestForm from './RequestForm';
import { fulfilmentTypes, requestTypes, toUserAddress } from './constants';

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
      formatDate: PropTypes.func.isRequired,
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
      fullRequestDetail: {},
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
    this.formatDate = this.props.stripes.formatDate;
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;

    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && prevRQ.hasLoaded && currentRQ && currentRQ.hasLoaded) {
      if (prevRQ.records[0].id !== currentRQ.records[0].id || !this.state.fullRequestDetail.id) {
        const basicRequest = currentRQ.records[0];
        this.props.joinRequest(basicRequest).then((newRequest) => {
          console.log("basicRequest", basicRequest)
          console.log("newRequest", newRequest)
          this.setState({
            fullRequestDetail: newRequest,
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

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
    });
  }

  // Helper function to form a locale-aware date for display
  makeLocaleDateString(dateString) {
    if (dateString === '') {
      return '';
    }
    return this.formatDate(dateString);
  }

  render() {
    const { location, stripes } = this.props;
    const { patronGroups, addressTypes, selectedRequest } = this.props.resources;
    const { fullRequestDetail } = this.state;
    const query = location.search ? queryString.parse(location.search) : {};
    let request;// = (selectedRequest && selectedRequest.hasLoaded) ? selectedRequest.records[0] : null;

    let patronGroup;

    // Most of the values needed to populate the view come from the "enhanced" request
    // object, fullRequestDetail, which includes parts of the requester's user record,
    // the item record,
    // and the related loan record (if any), in the form:
    // {
    //  requestMeta: { top-level request details },
    //  requester: { user details },
    //  item: { item details },
    //  loan: { loan details },
    //  requestCount: number of requests for the item
    // }
    if (fullRequestDetail.requestMeta) {
      request = fullRequestDetail;
      patronGroup = request.requester.patronGroup;
      if (patronGroups && patronGroups.hasLoaded) {
        const groupRecord = patronGroups.records.find(g => g.id === patronGroup);
        patronGroup = groupRecord.group || patronGroup;
        if (fullRequestDetail.requester) {
          fullRequestDetail.requester.patronGroup = groupRecord ? groupRecord.id : null;
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

    //addressTypes = (addressTypes && addressTypes.hasLoaded) ? addressTypes.records : [];
    let deliveryAddressDetail;
    let selectedDelivery = false;
    if (_.get(request, ['requestMeta', 'fulfilmentPreference'], '') === 'Delivery') {
      selectedDelivery = true;
      const deliveryAddressType = _.get(request, ['requestMeta', 'deliveryAddressTypeId'], null);
      if (deliveryAddressType) {
        const deliveryLocations = _.keyBy(request.requester.personal.addresses, 'addressTypeId');
        deliveryAddressDetail = toUserAddress(deliveryLocations[deliveryAddressType]);
      }
    }
    const holdShelfExpireDate = (_.get(request, ['requestMeta', 'status'], '') === 'Open - Awaiting pickup') ?
      this.makeLocaleDateString(_.get(request, ['requestMeta', 'holdShelfExpirationDate'], '')) : '-';

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
                  lastUpdatedDate={request.requestMeta.metaData.updatedDate}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label="Request type" value={_.get(request, ['requestMeta', 'requestType'], '-')} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Request status" value={_.get(request, ['requestMeta', 'status'], '-')} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Request expiration date" value={this.makeLocaleDateString(_.get(request, ['requestMeta', 'requestExpirationDate'])) || '-'} />
              </Col>
              <Col xs={3}>
                <KeyValue label="Hold shelf expiration date" value={holdShelfExpireDate} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label="Position in queue" value="-" />
              </Col>
            </Row>
          </Accordion>
          <Accordion
            open
            id="item-info"
            label="Item information"
          >
            <ItemDetail item={request.item} dateFormatter={this.makeLocaleDateString} />
          </Accordion>
          <Accordion
            open
            id="requester-info"
            label="Requester information"
          >
            <UserDetail
              user={request.requester}
              patronGroup={patronGroup}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddressDetail}
              pickupLocation=""
            />
          </Accordion>
        </AccordionSet>

        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label="Edit Request Dialog">
          <RequestForm
            stripes={stripes}
            initialValues={fullRequestDetail}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
            optionLists={{ requestTypes, fulfilmentTypes, addressTypes }}
            patronGroups={patronGroups}
            dateFormatter={this.props.dateFormatter}
          />
        </Layer>
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
