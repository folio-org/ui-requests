import {
  get,
  isEqual,
  cloneDeep,
  keyBy,
  isObject,
} from 'lodash';
import React, { Fragment } from 'react';
import { compose } from 'redux';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
} from 'react-intl';

import { TitleManager } from '@folio/stripes/core';
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
import { ViewMetaData, withTags } from '@folio/stripes/smart-components';

import CancelRequestDialog from './CancelRequestDialog';
import ItemDetail from './ItemDetail';
import UserDetail from './UserDetail';
import RequestForm from './RequestForm';
import PositionLink from './PositionLink';
import { requestStatuses } from './constants';

import { toUserAddress } from './utils';

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
    resources: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
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
    };

    this.cViewMetaData = props.stripes.connect(ViewMetaData);
    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    const requests = this.props.resources.selectedRequest;
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

  loadFullRequest(basicRequest) {
    this.props.joinRequest(basicRequest).then(request => {
      this.setState({ request });
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

  getPatronGroup(request) {
    const { patronGroups } = this.props;
    const group = get(request, 'requester.patronGroup');

    if (!group || !patronGroups.length) return undefined;

    const id = isObject(group) ? group.id : group;

    return patronGroups.find(g => (g.id === id));
  }

  getPickupServicePointName(request) {
    if (!request) return '';
    const { optionLists: { servicePoints } } = this.props;
    const servicePoint = servicePoints.find(sp => (sp.id === request.pickupServicePointId));

    return get(servicePoint, ['name'], '');
  }

  renderLayer(request, patronGroup) {
    const {
      optionLists,
      location,
      stripes,
      onCloseEdit,
      findResource,
    } = this.props;

    const query = location.search ? queryString.parse(location.search) : {};

    if (query.layer === 'edit') {
      return (
        <Layer
          isOpen
          label={<FormattedMessage id="ui-requests.actions.editRequestLink" />}
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
            patronGroup={patronGroup}
            query={this.props.query}
            findResource={findResource}
          />
        </Layer>
      );
    }

    return null;
  }

  renderDetailMenu(request) {
    const {
      editLink,
      onEdit,
      tagsEnabled,
      tagsToggle,
    } = this.props;

    const tags = ((request && request.tags) || {}).tagList || [];
    const requestStatus = get(request, ['status'], '-');
    const isRequestClosed = requestStatus.startsWith('Closed');

    return (
      <PaneMenu>
        {
          tagsEnabled &&
          <FormattedMessage id="ui-requests.showTags">
            {ariaLabel => (
              <IconButton
                icon="tag"
                id="clickable-show-tags"
                onClick={tagsToggle}
                badgeCount={tags.length}
                ariaLabel={ariaLabel}
              />
            )}
          </FormattedMessage>
        }
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
  }

  renderRequest(request, patronGroup = {}) {
    const { stripes } = this.props;
    const getPickupServicePointName = this.getPickupServicePointName(request);
    const requestStatus = get(request, ['status'], '-');
    const isRequestClosed = requestStatus.startsWith('Closed');
    let deliveryAddressDetail;
    let selectedDelivery = false;

    if (get(request, 'fulfilmentPreference') === 'Delivery') {
      selectedDelivery = true;
      const deliveryAddressType = get(request, 'deliveryAddressTypeId', null);

      if (deliveryAddressType) {
        const addresses = get(request, 'requester.personal.addresses', []);
        const deliveryLocations = keyBy(addresses, 'addressTypeId');
        deliveryAddressDetail = toUserAddress(deliveryLocations[deliveryAddressType]);
      }
    }

    const holdShelfExpireDate = (get(request, 'holdShelfExpirationDate', '') &&
      get(request, ['status'], '') === requestStatuses.AWAITING_PICKUP)
      ? <FormattedTime value={request.holdShelfExpirationDate} day="numeric" month="numeric" year="numeric" />
      : '-';

    const expirationDate = (get(request, 'requestExpirationDate', ''))
      ? <FormattedDate value={request.requestExpirationDate} />
      : '-';

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
        </Fragment>
      );
    };

    return (
      <Pane
        data-test-instance-details
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.requestMeta.detailLabel" />}
        lastMenu={this.renderDetailMenu(request)}
        actionMenu={actionMenu}
        dismissible
        onClose={this.props.onClose}
      >
        <TitleManager record={get(request, ['item', 'title'])} />
        <AccordionSet accordionStatus={this.state.accordions} onToggle={this.onToggleSection}>
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
              itemId={request.itemId}
              requestCount={request.requestCount}
            />
          </Accordion>
          <Accordion
            id="request-info"
            label={<FormattedMessage id="ui-requests.requestMeta.information" />}
          >
            <Row>
              <Col xs={12}>
                {request.metadata && <this.cViewMetaData metadata={request.metadata} /> }
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
                  value={<PositionLink request={request} />}
                />
              </Col>
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
              patronGroup={patronGroup}
              request={request}
              selectedDelivery={selectedDelivery}
              deliveryAddress={deliveryAddressDetail}
              pickupServicePoint={getPickupServicePointName}
            />
          </Accordion>
        </AccordionSet>

        <this.connectedCancelRequestDialog
          open={this.state.isCancellingRequest}
          onCancelRequest={this.cancelRequest}
          onClose={() => this.setState({ isCancellingRequest: false })}
          request={request}
          stripes={stripes}
        />
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

    const patronGroup = this.getPatronGroup(request);

    return this.renderLayer(request, patronGroup) ||
      this.renderRequest(request, patronGroup);
  }
}

export default compose(
  withTags,
)(ViewRequest);
