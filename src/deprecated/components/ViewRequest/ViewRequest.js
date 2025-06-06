import {
  get,
  isEqual,
  keyBy,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
  injectIntl,
} from 'react-intl';

import {
  IfPermission,
  IntlConsumer,
  TitleManager,
} from '@folio/stripes/core';
import {
  Button,
  Accordion,
  AccordionSet,
  AccordionStatus,
  Col,
  Callout,
  Icon,
  PaneHeaderIconButton,
  KeyValue,
  Layer,
  Pane,
  PaneMenu,
  Row,
  NoValue,
  dayjs,
} from '@folio/stripes/components';
import {
  ViewMetaData,
  withTags,
  NotesSmartAccordion,
} from '@folio/stripes/smart-components';

import ViewRequestShortcutsWrapper from '../../../components/ViewRequestShortcutsWrapper';
import CancelRequestDialog from '../../../CancelRequestDialog';
import ItemDetail from '../../../ItemDetail';
import TitleInformation from '../../../components/TitleInformation';
import UserDetail from '../../../UserDetail';
import RequestFormContainer from '../RequestFormContainer/RequestFormContainer';
import PositionLink from '../../../PositionLink';
import MoveRequestManager from '../MoveRequestManager/MoveRequestManager';
import {
  requestStatuses,
  REQUEST_LEVEL_TYPES,
  requestTypesTranslations,
  requestStatusesTranslations,
  REQUEST_LAYERS,
} from '../../../constants';
import {
  toUserAddress,
  isDelivery,
  getFullName,
  generateUserName,
  isValidRequest,
  isVirtualItem,
  isVirtualPatron,
  getRequestErrorMessage,
} from '../../../utils';
import { getTlrSettings } from '../../utils';
import urls from '../../../routes/urls';

const CREATE_SUCCESS = 'CREATE_SUCCESS';

class ViewRequest extends React.Component {
  static manifest = {
    selectedRequest: {
      type: 'okapi',
      path: 'circulation/requests/:{id}',
      shouldRefresh: (resource, action, refresh) => {
        const {
          path,
          originatingActionType,
        } = action.meta;

        if (originatingActionType.includes(CREATE_SUCCESS)) {
          return false;
        }

        return refresh || (path && path.match(/link/));
      },
      throwErrors: false,
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
    buildRecordsForHoldsShelfReport: PropTypes.func.isRequired,
    optionLists: PropTypes.shape({
      servicePoints: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        })
      ),
      cancellationReasons: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
        })
      ),
    }),
    tagsToggle: PropTypes.func,
    paneWidth: PropTypes.string,
    patronGroups: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
      })
    ),
    parentMutator: PropTypes.shape({
      proxy: PropTypes.shape({
        reset: PropTypes.func,
        GET: PropTypes.func,
      }),
    }),
    parentResources: PropTypes.shape({
      configs: PropTypes.shape({
        records: PropTypes.arrayOf(
          PropTypes.shape({
            value: PropTypes.shape({
              titleLevelRequestsFeatureEnabled: PropTypes.bool,
            }),
          })
        )
      }).isRequired,
    }).isRequired,
    resources: PropTypes.shape({
      selectedRequest: PropTypes.shape({
        hasLoaded: PropTypes.bool.isRequired,
        other: PropTypes.shape({
          totalRecords: PropTypes.number,
        }),
        records: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string,
          })
        ),
      }),
    }),
    query: PropTypes.shape({
      mode: PropTypes.string,
    }),
    stripes: PropTypes.shape({
      hasPerm: PropTypes.func.isRequired,
      connect: PropTypes.func.isRequired,
      logger: PropTypes.shape({
        log: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    intl: PropTypes.shape({
      formatMessage: PropTypes.func,
    }),
    tagsEnabled: PropTypes.bool,
    match: PropTypes.shape({
      params: PropTypes.shape({
        id: PropTypes.string,
      })
    }),
  };

  static defaultProps = {
    editLink: '',
    paneWidth: '50%',
    onEdit: () => { },
  };

  constructor(props) {
    super(props);

    const { titleLevelRequestsFeatureEnabled } = getTlrSettings(props.parentResources.configs.records[0]?.value);

    this.state = {
      request: {},
      moveRequest: false,
      titleLevelRequestsFeatureEnabled,
    };

    const { stripes: { connect } } = props;

    this.cViewMetaData = connect(ViewMetaData);
    this.connectedCancelRequestDialog = connect(CancelRequestDialog);
    this.cancelRequest = this.cancelRequest.bind(this);
    this.update = this.update.bind(this);
    this.callout = React.createRef();
    this.accordionStatusRef = React.createRef();
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
    const prevSettings = prevProps.parentResources.configs.records[0]?.value;
    const currentSettings = this.props.parentResources.configs.records[0]?.value;

    // Only update if actually needed (otherwise, this gets called way too often)
    if (prevRQ && currentRQ && currentRQ.hasLoaded) {
      if ((!isEqual(prevRQ.records[0], currentRQ.records[0]))) {
        this.loadFullRequest(currentRQ.records[0]);
      }
    }

    if (prevSettings !== currentSettings) {
      const { titleLevelRequestsFeatureEnabled } = getTlrSettings(currentSettings);

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ titleLevelRequestsFeatureEnabled });
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
    const requestFromProps = this.getRequestFromProps() || {};
    const updatedRecord = {
      ...requestFromProps,
      ...record,
    };

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
    delete updatedRecord.titleRequestCount;
    delete updatedRecord.itemRequestCount;
    delete updatedRecord.numberOfReorderableRequests;
    delete updatedRecord.holdShelfExpirationTime;

    this.props.mutator.selectedRequest.PUT(updatedRecord).then(() => {
      this.props.onCloseEdit();
      this.callout.current.sendCallout({
        message: (
          <FormattedMessage
            id="ui-requests.editRequest.success"
            values={{ requester: generateUserName(record.requester.personal) }}
          />
        ),
      });
    }).catch(() => {
      this.callout.current.sendCallout({
        message: <FormattedMessage id="ui-requests.editRequest.fail" />,
        type: 'error',
      });
    });
  }

  cancelRequest(cancellationInfo) {
    const {
      resources,
      mutator,
      onCloseEdit,
      buildRecordsForHoldsShelfReport,
      intl,
    } = this.props;

    // Get the initial request data, mix in the cancellation info, PUT,
    // and then close cancel/edit modes since cancelled requests can't be edited.
    const request = get(resources, ['selectedRequest', 'records', 0], {});
    const cancelledRequest = {
      ...request,
      ...cancellationInfo,
    };


    mutator.selectedRequest.PUT(cancelledRequest)
      .catch(resp => {
        resp.json()
          .then(res => {
            res.errors.forEach(error => {
              this.callout.current.sendCallout({
                message: getRequestErrorMessage(error, intl),
                type: 'error',
              });
            });
          });
      })
      .finally(() => {
        this.setState({ isCancellingRequest: false });
        onCloseEdit();
        buildRecordsForHoldsShelfReport();
      });
  }

  onMove = async (request) => {
    const {
      history,
      location: { search },
    } = this.props;
    const { titleLevelRequestsFeatureEnabled } = this.state;
    const id = titleLevelRequestsFeatureEnabled ? request.instanceId : request.itemId;

    this.loadFullRequest(request);

    history.push(`${urls.requestQueueView(request.id, id)}${search}`, { afterMove: true });
  }

  closeMoveRequest = () => {
    this.setState({ moveRequest: false });
  }

  openMoveRequest = () => {
    this.setState({ moveRequest: true });
  }

  onReorderRequest = (request) => {
    const {
      location: { search },
      history,
    } = this.props;
    const { titleLevelRequestsFeatureEnabled } = this.state;
    const idForHistory = titleLevelRequestsFeatureEnabled ? request.instanceId : request.itemId;

    history.push(`${urls.requestQueueView(request.id, idForHistory)}${search}`, { request });
  }

  getRequestFromProps = () => {
    const {
      resources: {
        selectedRequest,
      },
      match: {
        params: {
          id,
        },
      },
    } = this.props;
    const currentRequest = selectedRequest?.records || [];

    if (!id || currentRequest.length === 0) return null;

    return currentRequest.find(r => r.id === id);
  }

  getRequest() {
    const curRequest = this.getRequestFromProps();

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
    const {
      titleLevelRequestsFeatureEnabled,
    } = this.state;

    const query = location.search ? queryString.parse(location.search) : {};

    if (query.layer === REQUEST_LAYERS.EDIT) {
      // The hold shelf expiration date is stored as a single value (e.g., 20201101T23:59:00-0400),
      // but it's exposed in the UI as separate date- and time-picker components.
      let date;

      if (request.holdShelfExpirationDate) {
        date = dayjs.tz(request.holdShelfExpirationDate, this.props.intl.timeZone);
      } else {
        date = dayjs();
      }

      return (
        <IntlConsumer>
          {intl => (
            <Layer
              isOpen
              contentLabel={intl.formatMessage({ id: 'ui-requests.actions.editRequestLink' })}
            >
              <RequestFormContainer
                stripes={stripes}
                initialValues={{
                  requestExpirationDate: null,
                  holdShelfExpirationDate: request.holdShelfExpirationDate,
                  holdShelfExpirationTime: date.format('HH:mm'),
                  createTitleLevelRequest: false,
                  ...request,
                }}
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
                isTlrEnabledOnEditPage={titleLevelRequestsFeatureEnabled}
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

    const requestStatus = get(request, ['status'], '-');
    const closedStatuses = [requestStatuses.CANCELLED, requestStatuses.FILLED, requestStatuses.PICKUP_EXPIRED, requestStatuses.UNFILLED];
    const isRequestClosed = closedStatuses.includes(requestStatus);

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
                disabled={isRequestClosed}
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
      optionLists: { cancellationReasons },
    } = this.props;
    const {
      isCancellingRequest,
      moveRequest,
      titleLevelRequestsFeatureEnabled,
    } = this.state;
    const {
      requestLevel,
      item,
      requester
    } = request;

    const getPickupServicePointName = this.getPickupServicePointName(request);
    const requestStatus = get(request, ['status'], '-');
    const isRequestClosed = requestStatus.startsWith('Closed');
    const isRequestNotFilled = requestStatus === requestStatuses.NOT_YET_FILLED;
    const isRequestOpen = requestStatus.startsWith('Open');
    const cancellationReasonMap = keyBy(cancellationReasons, 'id');
    const isRequestValid = isValidRequest(request);
    const isDCBTransaction = isVirtualPatron(requester?.personal?.lastName) || isVirtualItem(request?.instanceId, request?.holdingsRecordId);

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
      || stripes.hasPerm('ui-requests.moveRequest.execute')
      || stripes.hasPerm('ui-requests.reorderQueue.execute') || !isDCBTransaction;

    const actionMenu = ({ onToggle }) => {
      if (isRequestClosed) {
        if (!isRequestValid || (requestLevel === REQUEST_LEVEL_TYPES.TITLE && !titleLevelRequestsFeatureEnabled) || isDCBTransaction) {
          return null;
        }

        return (
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
        );
      }

      return (
        <>
          <IfPermission perm="ui-requests.edit">
            {
              isRequestValid && !isDCBTransaction &&
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
            }
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
          {
            isRequestValid && !isDCBTransaction &&
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
          }
          {item && isRequestNotFilled && isRequestValid && !isDCBTransaction &&
            <IfPermission perm="ui-requests.moveRequest.execute">
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
          {isRequestOpen && isRequestValid && !isDCBTransaction &&
            <IfPermission perm="ui-requests.reorderQueue.execute">
              <Button
                id="reorder-queue"
                onClick={() => {
                  onToggle();
                  this.onReorderRequest(request);
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

    const referredRecordData = {
      instanceTitle: request.instance.title,
      instanceId: request.instanceId,
      itemBarcode: request.item?.barcode,
      itemId: request.itemId,
      holdingsRecordId: request.holdingsRecordId,
      requesterName: getFullName(request.requester),
      requesterId: request.requester?.id ?? request.requesterId,
      requestCreateDate: request.metadata.createdDate,
    };

    const isDuplicatingDisabled =
      isRequestClosed &&
      request.requestLevel === REQUEST_LEVEL_TYPES.TITLE &&
      !this.state.titleLevelRequestsFeatureEnabled;
    const requestTypeMessageKey = requestTypesTranslations[request.requestType];
    const requestTypeMessage = requestTypeMessageKey ? <FormattedMessage id={requestTypeMessageKey} /> : <NoValue />;
    const requestStatusMessageKey = requestStatusesTranslations[request.status];
    const requestStatusMessage = requestStatusMessageKey ? <FormattedMessage id={requestStatusMessageKey} /> : <NoValue />;

    return (
      <Pane
        id="instance-details"
        data-test-instance-details
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.request.detail.title" />}
        lastMenu={this.renderDetailMenu(request)}
        dismissible
        {... (showActionMenu ? { actionMenu } : {})}
        onClose={this.props.onClose}
      >
        <ViewRequestShortcutsWrapper
          onDuplicate={() => this.props.onDuplicate(request)}
          onEdit={this.props.onEdit}
          accordionStatusRef={this.accordionStatusRef}
          isDuplicatingDisabled={isDuplicatingDisabled}
          isEditingDisabled={isRequestClosed}
          stripes={stripes}
        >
          <TitleManager record={get(request, ['instance', 'title'])} />
          <AccordionStatus ref={this.accordionStatusRef}>
            <AccordionSet>
              <Accordion
                id="title-info"
                label={
                  <FormattedMessage
                    id="ui-requests.title.information"
                  />
            }
              >
                <TitleInformation
                  instanceId={request.instanceId}
                  holdingsRecordId={request.holdingsRecordId}
                  titleLevelRequestsCount={request.titleRequestCount}
                  title={request.instance.title}
                  contributors={request.instance.contributorNames}
                  publications={request.instance.publication}
                  editions={request.instance.editions}
                  identifiers={request.instance.identifiers}
                  titleLevelRequestsLink={false}
                />
              </Accordion>
              <Accordion
                id="item-info"
                label={
                  <FormattedMessage
                    id="ui-requests.item.information"
                  />
            }
              >
                { item
                  ? (
                    <ItemDetail
                      request={request}
                      item={request.item}
                      loan={request.loan}
                      requestCount={request.requestCount}
                    />
                  )
                  : (
                    <FormattedMessage
                      id="ui-requests.item.noInformation"
                    />
                  )
            }
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
                      value={requestTypeMessage}
                    />
                  </Col>
                  <Col xs={3}>
                    <KeyValue
                      label={<FormattedMessage id="ui-requests.status" />}
                      value={requestStatusMessage}
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
                      value={
                        <PositionLink
                          request={request}
                          isTlrEnabled={titleLevelRequestsFeatureEnabled}
                        />
                  }
                    />
                  </Col>
                  <Col xs={3}>
                    <KeyValue
                      label={<FormattedMessage id="ui-requests.requestLevel" />}
                      value={<FormattedMessage id={`ui-requests.${requestLevel.toLowerCase()}Level`} />}
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
                  <Col
                    data-test-request-patron-comments
                    xsOffset={3}
                    xs={6}
                  >
                    <KeyValue
                      label={<FormattedMessage id="ui-requests.patronComments" />}
                      value={request.patronComments}
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
                  patronGroups={patronGroups}
                  request={request}
                  selectedDelivery={selectedDelivery}
                  deliveryAddress={deliveryAddressDetail}
                  pickupServicePoint={getPickupServicePointName}
                />
              </Accordion>
              <NotesSmartAccordion
                domainName="requests"
                entityId={request.id}
                entityName={request.instance.title}
                entityType="request"
                referredRecordData={referredRecordData}
                id="staff-notes"
                label={<FormattedMessage id="ui-requests.notes.staffNotes" />}
                pathToNoteCreate="/requests/notes/new"
                pathToNoteDetails="/requests/notes"
              />
            </AccordionSet>
          </AccordionStatus>
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
        </ViewRequestShortcutsWrapper>
      </Pane>
    );
  }

  renderSpinner() {
    return (
      <Pane
        id="request-details"
        defaultWidth={this.props.paneWidth}
        paneTitle={<FormattedMessage id="ui-requests.request.detail.title" />}
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

    const content = request
      ? this.renderLayer(request) || this.renderRequest(request)
      : this.renderSpinner();

    return (
      <>
        {content}
        <Callout ref={this.callout} />
      </>
    );
  }
}

export default withTags(injectIntl(ViewRequest));
