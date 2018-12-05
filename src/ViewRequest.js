import {
  get,
  isEqual,
  cloneDeep,
  includes,
  keyBy
} from 'lodash';
import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';

import { TitleManager } from '@folio/stripes/core';
import { Link } from 'react-router-dom';
import {
  Button,
  Accordion,
  AccordionSet,
  Col,
  Icon,
  IconButton,
  KeyValue,
  Layer,
  Pane,
  PaneMenu,
  Row
} from '@folio/stripes/components';
import { ViewMetaData } from '@folio/stripes/smart-components';

import CancelRequestDialog from './CancelRequestDialog';
import ItemDetail from './ItemDetail';
import UserDetail from './UserDetail';
import RequestForm from './RequestForm';
import { toUserAddress } from './constants';

class ViewRequest extends React.Component {
  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{id}',
    },
  };

  static propTypes = {
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
    onClose: PropTypes.func.isRequired,
    onCloseEdit: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    optionLists: PropTypes.object,
    paneWidth: PropTypes.string,
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    resources: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
      }),
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    match: PropTypes.object,
  };

  static defaultProps = {
    editLink: '',
    paneWidth: '50%',
    onEdit: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      request: {},
      accordions: {
        'request-info': true,
        'item-info': true,
        'requester-info': true,
      },
    };

    this.cViewMetaData = props.stripes.connect(ViewMetaData);
    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.craftLayerUrl = this.craftLayerUrl.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.update = this.update.bind(this);
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;
    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && currentRQ && currentRQ.hasLoaded) {
      const requestId = get(this.state, ['request', 'id'], '');
      if ((prevRQ.records[0] && !isEqual(prevRQ.records[0], currentRQ.records[0])) || !requestId) {
        const basicRequest = currentRQ.records[0];
        this.props.joinRequest(basicRequest).then(request => {
          this.setState({ request });
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
    delete updatedRecord.requestCount;

    this.props.mutator.selectedRequest.PUT(updatedRecord).then(() => {
      this.props.onCloseEdit();
    });
  }

  cancelRequest(cancellationInfo) {
    // Get the initial request data, mix in the cancellation info, PUT,
    // and then close cancel/edit modes since cancelled requests can't be edited.
    const request = get(this.props.resources, ['selectedRequest', 'records', 0], {});
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
      const newState = cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
    });
  }

  craftLayerUrl(mode) {
    const url = this.props.location.pathname + this.props.location.search;
    return includes(url, '?') ? `${url}&layer=${mode}` : `${url}?layer=${mode}`;
  }

  getRequest() {
    const { resources, match: { params: { id } } } = this.props;
    const selRequest = (resources.selectedRequest || {}).records || [];
    if (!id || selRequest.length === 0) return null;
    const curRequest = selRequest.find(r => r.id === id);
    if (!curRequest) return null;

    return (curRequest.id === this.state.request.id) ? this.state.request : curRequest;
  }

  getPatronGroupName(request) {
    if (!request) return '';
    const { patronGroups } = this.props;
    if (!patronGroups.length) return '';
    const pgId = request.requester.patronGroup;
    const patronGroup = patronGroups.find(g => (g.id === pgId));
    return get(patronGroup, ['desc'], '');
  }

  getPickupServicePointName(request) {
    if (!request) return '';
    const { optionLists: { servicePoints } } = this.props;
    const servicePoint = servicePoints.find(sp => (sp.id === request.pickupServicePointId));
    return get(servicePoint, ['name'], '');
  }

  render() {
    const {
      patronGroups,
      optionLists,
      location,
      stripes,
      editLink,
      onEdit,
    } = this.props;
    const query = location.search ? queryString.parse(location.search) : {};

    const request = this.getRequest();
    const patronGroupName = this.getPatronGroupName(request);
    const getPickupServicePointName = this.getPickupServicePointName(request);
    const requestStatus = get(request, ['status'], '-');
    // TODO: Internationalize this
    const isRequestClosed = requestStatus.startsWith('Closed');
    const queuePosition = get(request, ['position'], '-');
    const positionLink = request ?
      <div>
        <span>
          {queuePosition}
          &nbsp;
          &nbsp;
        </span>
        <Link to={`/requests?filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&query=${request.item.barcode}&sort=Request%20Date`}>
          <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
        </Link>
      </div> : '-';

    const detailMenu = (
      <PaneMenu>
        {!isRequestClosed &&
          <IconButton
            icon="edit"
            id="clickable-edit-request"
            style={{ visibility: !request ? 'hidden' : 'visible' }}
            href={editLink}
            onClick={onEdit}
          />
        }
      </PaneMenu>
    );

    let deliveryAddressDetail;
    let selectedDelivery = false;

    if (get(request, ['fulfilmentPreference'], '') === 'Delivery') {
      selectedDelivery = true;
      const deliveryAddressType = get(request, ['deliveryAddressTypeId'], null);
      if (deliveryAddressType) {
        const addresses = get(request, ['requester', 'personal', 'addresses'], []);
        const deliveryLocations = keyBy(addresses, 'addressTypeId');
        deliveryAddressDetail = toUserAddress(deliveryLocations[deliveryAddressType]);
      }
    }

    const holdShelfExpireDate = (get(request, ['status'], '') === 'Open - Awaiting pickup')
      ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
      : '-';

    const expirationDate = (get(request, ['requestExpirationDate', '']))
      ? <FormattedDate value={request.requestExpirationDate} />
      : '-';

    if (!request) {
      return (
        <Pane
          defaultWidth={this.props.paneWidth}
          paneTitle={<FormattedMessage id="ui-requests.requestMeta.detailLabel" />}
          lastMenu={detailMenu}
          dismissible
          onClose={this.props.onClose}
        >
          <div style={{ paddingTop: '1rem' }}>
            <Icon icon="spinner-ellipsis" width="100px" />
          </div>
        </Pane>
      );
    }

    const actionMenu = ({ onToggle }) => {
      if (isRequestClosed) {
        return undefined;
      }

      return (
        <Fragment>
          <Button
            buttonStyle="dropdownItem"
            id="clickable-edit-request"
            href={this.props.editLink}
            onClick={() => {
              this.props.onEdit();
              onToggle();
            }}
          >
            <Icon icon="edit">
              <FormattedMessage id="ui-requests.actions.edit" />
            </Icon>
          </Button>
          <Button
            buttonStyle="dropdownItem"
            id="clickable-cancel-request"
            onClick={() => {
              this.setState({ isCancellingRequest: true });
              onToggle();
            }}
          >
            <Icon icon="times-circle">
              <FormattedMessage id="ui-requests.cancel.cancelRequest" />
            </Icon>
          </Button>
        </Fragment>
      );
    };

    return (
      <Pane
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.requestMeta.detailLabel" />}
        lastMenu={detailMenu}
        actionMenu={actionMenu}
        dismissible
        onClose={this.props.onClose}
      >
        <TitleManager record={get(request, ['item', 'title'])} />
        <AccordionSet accordionStatus={this.state.accordions} onToggle={this.onToggleSection}>
          <Accordion
            id="request-info"
            label={<FormattedMessage id="ui-requests.requestMeta.information" />}
          >
            <Row>
              <Col xs={12}>
                <this.cViewMetaData metadata={request.metadata} />
              </Col>
            </Row>
            <Row>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  value={get(request, ['requestType'], '-')}
                />
              </Col>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.status" />}
                  value={get(request, ['status'], '-')}
                />
              </Col>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                  value={expirationDate}
                />
              </Col>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                  value={holdShelfExpireDate}
                />
              </Col>
            </Row>
            <Row>
              <Col xs={5}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.position" />}
                  value={positionLink}
                />
              </Col>
            </Row>
          </Accordion>
          <Accordion
            id="item-info"
            label={
              <FormattedMessage
                id="ui-requests.item.information"
                values={{ required: '' }}
              />
            }
          >
            <ItemDetail
              item={request.item}
              loan={request.loan}
              requestCount={request.requestCount}
            />
          </Accordion>
          <Accordion
            id="requester-info"
            label={
              <FormattedMessage id="ui-requests.requester.information">
                {message => message}
              </FormattedMessage>
            }
          >
            <UserDetail
              user={request.requester}
              proxy={request.proxy}
              stripes={stripes}
              patronGroup={patronGroupName}
              request={request}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddressDetail}
              pickupServicePoint={getPickupServicePointName}
            />
          </Accordion>
        </AccordionSet>

        <Layer
          isOpen={query.layer ? query.layer === 'edit' : false}
          label={<FormattedMessage id="ui-requests.actions.editRequestLink" />}
        >
          <RequestForm
            stripes={stripes}
            initialValues={request}
            fullRequest={request}
            metadataDisplay={this.cViewMetaData}
            onSubmit={(record) => { this.update(record); }}
            onCancel={this.props.onCloseEdit}
            onCancelRequest={this.cancelRequest}
            optionLists={optionLists}
            patronGroups={patronGroups}
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
    );
  }
}

export default ViewRequest;
