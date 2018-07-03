import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';

import { Accordion, AccordionSet } from '@folio/stripes-components/lib/Accordion';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Layer from '@folio/stripes-components/lib/Layer';
import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import IconButton from '@folio/stripes-components/lib/IconButton';
import craftLayerUrl from '@folio/stripes-components/util/craftLayerUrl';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import CancelRequestDialog from './CancelRequestDialog';
import ItemDetail from './ItemDetail';
import ViewMetadata from './ViewMetadata';
import UserDetail from './UserDetail';
import RequestForm from './RequestForm';
import { fulfilmentTypes, requestTypes, toUserAddress } from './constants';

class ViewRequest extends React.Component {
  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{id}',
    },
    relatedRequesterId: {},
    testRequester: {
      type: 'okapi',
      path: 'users?query=(id==%{relatedRequesterId})',
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
    createdBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.createdByUserId})',
    },
    updatedBy: {
      type: 'okapi',
      records: 'users',
      path: 'users?query=(id==!{metadata.updatedByUserId})',
    },
  }

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
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      locale: PropTypes.string.isRequired,
      formatDate: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  }

  static defaultProps = {
    editLink: '',
    paneWidth: '50%',
    onEdit: () => {},
    notesToggle: () => {},
  }

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

    this.cViewMetadata = props.stripes.connect(ViewMetadata);
    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.craftLayerUrl = craftLayerUrl.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.update = this.update.bind(this);
    this.formatDate = this.props.stripes.formatDate;
  }

  static getDerivedStateFromProps(props, state) {
    const request = _.get(props.resources.selectedRequest, ['records', 0]);
    const prevRequest = state.fullRequestDetail.requestMeta;
    if (request && prevRequest && !_.isEqual(request, prevRequest)) {
      return {
        fullRequestDetail: {
          ...state.fullRequestDetail,
          requestMeta: request,
        }
      };
    }

    return null;
  }

  componentDidMount() {
    this._mounted = true;
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;
    // Only update if actually needed (otherwise, this gets called way too often)
    if (this._mounted && prevRQ && currentRQ && currentRQ.hasLoaded) {
      if ((prevRQ.records[0] && prevRQ.records[0].id !== currentRQ.records[0].id) || !(this.state.fullRequestDetail.requestMeta && this.state.fullRequestDetail.requestMeta.id)) {
        const basicRequest = currentRQ.records[0];
        this.props.joinRequest(basicRequest).then((newRequest) => {
          this.setState({
            fullRequestDetail: newRequest,
          });
        });
      }
    }
  }

  componentWillUnmount() {
    this._mounted = false;
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

  cancelRequest(cancellationInfo) {
    // Get the initial request data, mix in the cancellation info, PUT,
    // and then close cancel/edit modes since cancelled requests can't be edited.
    const request = _.get(this.props.resources, ['selectedRequest', 'records', 0], {});
    const cancelledRequest = {
      ...request,
      ...cancellationInfo,
    };

    this.props.mutator.selectedRequest.PUT(cancelledRequest).then(() => {
      this.setState({ isCancellingRequest: false });
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

  render() {
    const { location, stripes } = this.props;
    const { intl } = stripes;
    const { patronGroups, addressTypes } = this.props.resources;
    const { fullRequestDetail } = this.state;
    const query = location.search ? queryString.parse(location.search) : {};
    let request;// = (selectedRequest && selectedRequest.hasLoaded) ? selectedRequest.records[0] : null;

    let patronGroup;

    // Most of the values needed to populate the view come from the "enhanced" request
    // object, fullRequestDetail, which includes parts of the requester's user record,
    // the item records,
    // and the related loan record (if any), in the form:
    // {
    //  requestMeta: { top-level request details },
    //  requester: { user details },
    //  item: { item details },
    //  loan: { loan details },
    //  holding: { holding record details },
    //  instance: { instance record details },
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

    const requestStatus = _.get(request, ['requestMeta', 'status'], '-');
    // TODO: Internationalize this
    const isRequestClosed = requestStatus.startsWith('Closed');

    const detailMenu = (
      <PaneMenu>
        <IconButton
          icon="comment"
          id="clickable-show-notes"
          style={{ visibility: !request ? 'hidden' : 'visible' }}
          onClick={this.props.notesToggle}
          title={intl.formatMessage({ id: 'ui-requests.actions.showNotes' })}
        />
        {!isRequestClosed &&
          <IconButton
            icon="edit"
            id="clickable-edit-request"
            style={{ visibility: !request ? 'hidden' : 'visible' }}
            href={this.props.editLink}
            onClick={this.props.onEdit}
            title={intl.formatMessage({ id: 'ui-requests.actions.editRequest' })}
          />
        }
      </PaneMenu>
    );

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
      stripes.formatDate(_.get(request, ['requestMeta', 'holdShelfExpirationDate'], '')) : '-';

    return request ? (
      <Pane
        defaultWidth={this.props.paneWidth}
        paneTitle={intl.formatMessage({ id: 'ui-requests.requestMeta.detailLabel' })}
        lastMenu={detailMenu}
        actionMenuItems={!isRequestClosed ? [{
          id: 'clickable-edit-request',
          title: 'Edit Request',
          label: 'Edit',
          href: this.props.editLink,
          onClick: this.props.onEdit,
          icon: 'edit',
        }, {
          id: 'clickable-cancel-request',
          title: intl.formatMessage({ id: 'ui-requests.cancel.cancelRequest' }),
          label: intl.formatMessage({ id: 'ui-requests.cancel.cancelRequest' }),
          onClick: () => this.setState({ isCancellingRequest: true }),
          icon: 'cancel',
        }] : undefined}
        dismissible
        onClose={this.props.onClose}
      >
        <AccordionSet accordionStatus={this.state.accordions} onToggle={this.onToggleSection}>
          <Accordion
            open
            id="request-info"
            label={intl.formatMessage({ id: 'ui-requests.requestMeta.information' })}
          >
            <Row>
              <Col xs={12}>
                <this.cViewMetadata metadata={request.requestMeta.metadata} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-requests.requestMeta.type' })} value={_.get(request, ['requestMeta', 'requestType'], '-')} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-requests.requestMeta.status' })} value={_.get(request, ['requestMeta', 'status'], '-')} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-requests.requestMeta.expirationDate' })} value={stripes.formatDate(_.get(request, ['requestMeta', 'requestExpirationDate'])) || '-'} />
              </Col>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-requests.requestMeta.holdShelfExpirationDate' })} value={holdShelfExpireDate} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue label={intl.formatMessage({ id: 'ui-requests.requestMeta.queuePosition' })} value="-" />
              </Col>
            </Row>
          </Accordion>
          <Accordion
            open
            id="item-info"
            label={intl.formatMessage({ id: 'ui-requests.item.information' })}
          >
            <ItemDetail
              item={request.item}
              holding={request.holding}
              instance={request.instance}
              loan={request.loan}
              dateFormatter={stripes.formatDate}
              requestCount={request.requestCount}
              intl={intl}
            />
          </Accordion>
          <Accordion
            open
            id="requester-info"
            label={intl.formatMessage({ id: 'ui-requests.requester.information' })}
          >
            <UserDetail
              user={request.requester}
              proxy={request.requestMeta.proxy}
              stripes={this.props.stripes}
              patronGroup={patronGroup}
              requestMeta={request.requestMeta}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddressDetail}
              pickupLocation=""
              onSelectProxy={() => {}}
              onCloseProxy={() => {}}
            />
          </Accordion>
        </AccordionSet>

        <Layer isOpen={query.layer ? query.layer === 'edit' : false} label={intl.formatMessage({ id: 'ui-requests.actions.editRequestLink' })}>
          <RequestForm
            stripes={stripes}
            initialValues={fullRequestDetail.requestMeta}
            fullRequest={fullRequestDetail}
            metadataDisplay={this.cViewMetadata}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
            onCancelRequest={this.cancelRequest}
            optionLists={{ requestTypes, fulfilmentTypes, addressTypes }}
            patronGroups={patronGroups}
            dateFormatter={this.props.dateFormatter}
          />
        </Layer>
        <this.connectedCancelRequestDialog
          open={this.state.isCancellingRequest}
          onCancelRequest={this.cancelRequest}
          onClose={() => this.setState({ isCancellingRequest: false })}
          request={request}
          stripes={this.props.stripes}
        />
      </Pane>
    ) : null;
  }
}

export default ViewRequest;
