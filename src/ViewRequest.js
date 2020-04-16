import {
  get,
  isEqual,
  cloneDeep,
  keyBy,
} from 'lodash';
import React from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
} from 'react-intl';

import {
  IntlConsumer,
  TitleManager
} from '@folio/stripes/core';
import {
  Button,
  Accordion,
  AccordionSet,
  Col,
  Callout,
  Icon,
  PaneHeaderIconButton,
  KeyValue,
  Layer,
  Pane,
  PaneMenu,
  Row
} from '@folio/stripes/components';
import { ViewMetaData, withTags } from '@folio/stripes/smart-components';
import { IfPermission } from '@folio/stripes-core';

import CancelRequestDialog from './CancelRequestDialog';
import ItemDetail from './ItemDetail';
import UserDetail from './UserDetail';
import RequestForm from './RequestForm';
import PositionLink from './PositionLink';
import MoveRequestManager from './MoveRequestManager';
import { requestStatuses } from './constants';
import {
  toUserAddress,
  isDelivery,
} from './utils';
import urls from './routes/urls';

class ViewRequest extends React.Component {
  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{id}',
      shouldRefresh: (resource, action, refresh) => {
        const { path } = action.meta;
        return refresh || (path && path.match(/link/));
      },
    },
  };

  static propTypes = {
    editLink: PropTypes.string,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
    joinRequest: PropTypes.func.isRequired,
    findResource: PropTypes.func.isRequired,
    mutator: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        PUT: PropTypes.func,
      }),
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    onCloseEdit: PropTypes.func.isRequired,
    onEdit: PropTypes.func,
    onDuplicate: PropTypes.func,
    optionLists: PropTypes.object,
    tagsToggle: PropTypes.func,
    paneWidth: PropTypes.string,
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    parentMutator: PropTypes.object,
    resources: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
        records: PropTypes.arrayOf(PropTypes.object),
      }),
    }),
    query: PropTypes.object,
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    tagsEnabled: PropTypes.bool,
    match: PropTypes.object,
  };

  static defaultProps = {
    editLink: '',
    paneWidth: '50%',
    onEdit: () => { }
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
      moveRequest: false,
    };

    const { stripes: { connect } } = props;

    this.cViewMetaData = connect(ViewMetaData);
    this.connectedCancelRequestDialog = connect(CancelRequestDialog);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.update = this.update.bind(this);
    this.callout = React.createRef();
  }

  componentDidMount() {
    const requests = this.props.resources.selectedRequest;

    this._isMounted = true;
    if (requests && requests.hasLoaded) {
      this.loadFullRequest(requests.records[0]);
    }
  }

  // Use componentDidUpdate to pull in metadata from the related user and item records
  componentDidUpdate(prevProps) {
    const prevRQ = prevProps.resources.selectedRequest;
    const currentRQ = this.props.resources.selectedRequest;

    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && currentRQ && currentRQ.hasLoaded) {
      if ((!isEqual(prevRQ.records[0], currentRQ.records[0]))) {
        this.loadFullRequest(currentRQ.records[0]);
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadFullRequest(basicRequest) {
    return this.props.joinRequest(basicRequest).then(request => {
      if (this._isMounted) {
        this.setState({ request });
      }
    });
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

  onMove = async (request) => {
    const {
      history,
      location: { search },
    } = this.props;

    this.loadFullRequest(request);

    history.push(`${urls.requestQueueView(request.id, request.itemId)}${search}`, { afterMove: true });
  }

  closeMoveRequest = () => {
    this.setState({ moveRequest: false });
  }

  openMoveRequest = () => {
    this.setState({ moveRequest: true });
  }

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
    });
  }

  getRequest() {
    const { resources, match: { params: { id } } } = this.props;
    const selRequest = (resources.selectedRequest || {}).records || [];
    if (!id || selRequest.length === 0) return null;
    const curRequest = selRequest.find(r => r.id === id);

    if (!curRequest) return null;

    return (curRequest.id === this.state.request.id) ? this.state.request : curRequest;
  }

  getPickupServicePointName(request) {
    if (!request) return '';
    const { optionLists: { servicePoints } } = this.props;
    const servicePoint = servicePoints.find(sp => (sp.id === request.pickupServicePointId));

    return get(servicePoint, ['name'], '');
  }

  renderLayer(request) {
    const {
      optionLists,
      location,
      stripes,
      onCloseEdit,
      findResource,
      patronGroups,
      parentMutator,
    } = this.props;

    const query = location.search ? queryString.parse(location.search) : {};

    if (query.layer === 'edit') {
      return (
        <IntlConsumer>
          {intl => (
            <Layer
              isOpen
              contentLabel={intl.formatMessage({ id: 'ui-requests.actions.editRequestLink' })}
            >
              <RequestForm
                stripes={stripes}
                initialValues={{ requestExpirationDate: null, ...request }}
                request={request}
                metadataDisplay={this.cViewMetaData}
                onSubmit={(record) => { this.update(record); }}
                onCancel={onCloseEdit}
                onCancelRequest={this.cancelRequest}
                optionLists={optionLists}
                patronGroups={patronGroups}
                query={this.props.query}
                parentMutator={parentMutator}
                findResource={findResource}
              />
            </Layer>
          ) }
        </IntlConsumer>
      );
    }

    return null;
  }

  renderDetailMenu(request) {
    const {
      tagsEnabled,
      tagsToggle,
    } = this.props;

    const tags = ((request && request.tags) || {}).tagList || [];

    return (
      <PaneMenu>
        {
          tagsEnabled &&
          <FormattedMessage id="ui-requests.showTags">
            {ariaLabel => (
              <PaneHeaderIconButton
                icon="tag"
                id="clickable-show-tags"
                onClick={tagsToggle}
                badgeCount={tags.length}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        }
      </PaneMenu>
    );
  }

  renderRequest(request) {
    const {
      stripes,
      patronGroups,
      history,
      optionLists: { cancellationReasons },
      location: { search },
    } = this.props;
    const {
      accordions,
      isCancellingRequest,
      moveRequest,
    } = this.state;

    const getPickupServicePointName = this.getPickupServicePointName(request);
    const requestStatus = get(request, ['status'], '-');
    const isRequestClosed = requestStatus.startsWith('Closed');
    const isRequestNotFilled = requestStatus === requestStatuses.NOT_YET_FILLED;
    const isRequestOpen = requestStatus.startsWith('Open');
    const cancellationReasonMap = keyBy(cancellationReasons, 'id');

    let deliveryAddressDetail;
    let selectedDelivery = false;

    if (isDelivery(request)) {
      selectedDelivery = true;
      const deliveryAddressType = get(request, 'deliveryAddressTypeId', null);

      if (deliveryAddressType) {
        const addresses = get(request, 'requester.personal.addresses', []);
        const deliveryLocations = keyBy(addresses, 'addressTypeId');
        deliveryAddressDetail = toUserAddress(deliveryLocations[deliveryAddressType]);
      }
    }

    const holdShelfExpireDate = get(request, 'holdShelfExpirationDate', '') &&
      [requestStatuses.AWAITING_PICKUP, requestStatuses.PICKUP_EXPIRED].includes(get(request, ['status'], ''))
      ? <FormattedTime value={request.holdShelfExpirationDate} day="numeric" month="numeric" year="numeric" />
      : '-';

    const expirationDate = (get(request, 'requestExpirationDate', ''))
      ? <FormattedDate value={request.requestExpirationDate} />
      : '-';

    const showActionMenu = stripes.hasPerm('ui-requests.create')
      || stripes.hasPerm('ui-requests.edit')
      || stripes.hasPerm('ui-requests.moveRequest')
      || stripes.hasPerm('ui-requests.reorderQueue');

    const actionMenu = ({ onToggle }) => {
      if (isRequestClosed) {
        return undefined;
      }

      return (
        <>
          <IfPermission perm="ui-requests.edit">
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
          </IfPermission>
          <IfPermission perm="ui-requests.create">
            <Button
              id="duplicate-request"
              onClick={() => {
                onToggle();
                this.props.onDuplicate(request);
              }}
              buttonStyle="dropdownItem"
            >
              <Icon icon="duplicate">
                <FormattedMessage id="ui-requests.actions.duplicateRequest" />
              </Icon>
            </Button>
          </IfPermission>
          {isRequestNotFilled &&
            <IfPermission perm="ui-requests.moveRequest">
              <Button
                id="move-request"
                onClick={() => {
                  onToggle();
                  this.openMoveRequest();
                }}
                buttonStyle="dropdownItem"
              >
                <Icon icon="arrow-right">
                  <FormattedMessage id="ui-requests.actions.moveRequest" />
                </Icon>
              </Button>
            </IfPermission> }
          {isRequestOpen &&
            <IfPermission perm="ui-requests.reorderQueue">
              <Button
                id="reorder-queue"
                onClick={() => {
                  onToggle();
                  history.push(`${urls.requestQueueView(request.id, request.itemId)}${search}`, { request });
                }}
                buttonStyle="dropdownItem"
              >
                <Icon icon="replace">
                  <FormattedMessage id="ui-requests.actions.reorderQueue" />
                </Icon>
              </Button>
            </IfPermission> }
        </>
      );
    };

    return (
      <Pane
        data-test-instance-details
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.requestMeta.detailLabel" />}
        lastMenu={this.renderDetailMenu(request)}
        dismissible
        {... (showActionMenu ? { actionMenu } : {})}
        onClose={this.props.onClose}
      >
        <TitleManager record={get(request, ['item', 'title'])} />
        <AccordionSet accordionStatus={accordions} onToggle={this.onToggleSection}>
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
              item={{ ...request.item, id: request.itemId }}
              loan={request.loan}
              requestCount={request.requestCount}
            />
          </Accordion>
          <Accordion
            id="request-info"
            label={<FormattedMessage id="ui-requests.requestMeta.information" />}
          >
            <Row>
              <Col xs={12}>
                {request.metadata && <this.cViewMetaData metadata={request.metadata} />}
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
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.position" />}
                  value={<PositionLink request={request} />}
                />
              </Col>
              {request.cancellationReasonId &&
                <Col xs={3}>
                  <KeyValue
                    label={<FormattedMessage id="ui-requests.cancellationReason" />}
                    value={get(cancellationReasonMap[request.cancellationReasonId], 'name', '-')}
                  />
                </Col> }
              {request.cancellationAdditionalInformation &&
                <Col xs={6}>
                  <KeyValue
                    label={<FormattedMessage id="ui-requests.cancellationAdditionalInformation" />}
                    value={request.cancellationAdditionalInformation}
                  />
                </Col> }
            </Row>
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
              patronGroups={patronGroups}
              request={request}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddressDetail}
              pickupServicePoint={getPickupServicePointName}
            />
          </Accordion>
        </AccordionSet>

        <this.connectedCancelRequestDialog
          open={isCancellingRequest}
          onCancelRequest={this.cancelRequest}
          onClose={() => this.setState({ isCancellingRequest: false })}
          request={request}
          stripes={stripes}
        />

        {moveRequest &&
          <MoveRequestManager
            onMove={this.onMove}
            onCancelMove={this.closeMoveRequest}
            request={request}
          /> }
        <Callout ref={this.callout} />
      </Pane>
    );
  }

  renderSpinner() {
    return (
      <Pane
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.requestMeta.detailLabel" />}
        lastMenu={this.renderDetailMenu()}
        dismissible
        onClose={this.props.onClose}
      >
        <div style={{ paddingTop: '1rem' }}>
          <Icon icon="spinner-ellipsis" width="100px" />
        </div>
      </Pane>
    );
  }

  render() {
    const request = this.getRequest();

    if (!request) {
      return this.renderSpinner();
    }

    return this.renderLayer(request) || this.renderRequest(request);
  }
}

export default compose(
  withTags,
)(ViewRequest);
