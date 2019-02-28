import {
  sortBy,
  find,
  get,
  isEqual,
  keyBy,
  cloneDeep,
  debounce,
  defer,
  unset,
} from 'lodash';

import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from 'react-intl';

import { Link } from 'react-router-dom';
import { Pluggable } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  Datepicker,
  Icon,
  IconButton,
  KeyValue,
  Pane,
  PaneMenu,
  Paneset,
  Row,
  Select,
  TextField
} from '@folio/stripes/components';

import stripesForm from '@folio/stripes/form';
import moment from 'moment-timezone';

import CancelRequestDialog from './CancelRequestDialog';
import UserForm from './UserForm';
import ItemDetail from './ItemDetail';
import PatronBlockModal from './PatronBlockModal';
import { toUserAddress } from './constants';

import css from './requests.css';

/**
 * on-blur validation checks that the requested item is checked out
 * and that the requesting user exists.
 *
 * redux-form requires that the rejected Promises have the form
 * { field: "error message" }
 * hence the eslint-disable-next-line comments since ESLint is picky
 * about the format of rejected promises.
 *
 * @see https://redux-form.com/7.3.0/examples/asyncchangevalidation/
 */
function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'item.barcode' && values.item.barcode !== undefined) {
    return new Promise((resolve, reject) => {
      const uv = props.uniquenessValidator.itemUniquenessValidator;
      const query = `(barcode="${values.item.barcode}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((items) => {
        if (items.length < 1) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ item: { barcode: <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" /> } });
        } else if (items[0].status.name !== 'Checked out') {
          if (values.requestType === 'Recall') {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ item: { barcode: <FormattedMessage id="ui-requests.errors.onlyCheckedOutForRecall" /> } });
          } else if (values.requestType === 'Hold') {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ item: { barcode: <FormattedMessage id="ui-requests.errors.onlyCheckedOutForHold" /> } });
          }
        } else {
          resolve();
        }
      });
    });
  } else if (blurredField === 'requester.barcode' && values.requester.barcode !== undefined) {
    return new Promise((resolve, reject) => {
      const uv = props.uniquenessValidator.userUniquenessValidator;
      const query = `(barcode="${values.requester.barcode}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((users) => {
        if (users.length < 1) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ requester: { barcode: <FormattedMessage id="ui-requests.errors.userBarcodeDoesNotExist" /> } });
        } else {
          resolve();
        }
      });
    });
  }

  return new Promise(resolve => resolve());
}

class RequestForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired
    }).isRequired,
    change: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    findResource: PropTypes.func.isRequired,
    request: PropTypes.object,
    metadataDisplay: PropTypes.func,
    initialValues: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    onCancelRequest: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
    submitting: PropTypes.bool,
    //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      addressTypes: PropTypes.arrayOf(PropTypes.object),
      requestTypes: PropTypes.arrayOf(PropTypes.object),
      fulfilmentTypes: PropTypes.arrayOf(PropTypes.object),
      servicePoints: PropTypes.arrayOf(PropTypes.object),
    }),
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    parentResources: PropTypes.object,
    history: PropTypes.shape({
      push: PropTypes.func,
    }),
    intl: intlShape,
    onChangePatron: PropTypes.func,
    query: PropTypes.object,
  };

  static defaultProps = {
    request: null,
    initialValues: {},
    metadataDisplay: () => {},
    optionLists: {},
    pristine: true,
    submitting: false,
  };

  constructor(props) {
    super(props);

    const { request, initialValues } = props;
    const { requester, item, loan } = (request || {});
    const { fulfilmentPreference, deliveryAddressTypeId } = initialValues;

    this.state = {
      accordions: {
        'request-info': true,
        'item-info': true,
        'requester-info': true,
      },
      proxy: {},
      selectedDelivery: fulfilmentPreference === 'Delivery',
      selectedAddressTypeId: deliveryAddressTypeId,
      selectedItem: item,
      selectedUser: requester,
      selectedLoan: loan,
      blocked: false,
    };

    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeFulfilment = this.onChangeFulfilment.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSelectUser = this.onSelectUser.bind(this);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.onSelectProxy = this.onSelectProxy.bind(this);
    this.onUserClick = this.onUserClick.bind(this);
    this.onUserClickDebounce = debounce(this.onUserClick, 300, { leading: false, trailing: true });
    this.onItemClickDebounce = debounce(this.onItemClick, 300, { leading: false, trailing: true });
    this.itemBarcodeRef = React.createRef();
    this.requesterBarcodeRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.query.userBarcode) {
      this.findUser(this.props.query.userBarcode);
    }

    if (this.props.query.itemBarcode) {
      this.findItem(this.props.query.itemBarcode);
    }
  }

  componentDidUpdate(prevProps) {
    const initials = this.props.initialValues;
    const request = this.props.request;
    const oldInitials = prevProps.initialValues;
    const oldRecord = prevProps.request;
    const prevBlocks = this.getPatronBlocks(prevProps.parentResources);
    const blocks = this.getPatronBlocks(this.props.parentResources);

    if ((initials && initials.fulfilmentPreference &&
        oldInitials && !oldInitials.fulfilmentPreference) ||
        (request && !oldRecord)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedAddressTypeId: initials.deliveryAddressTypeId,
        selectedDelivery: initials.fulfilmentPreference === 'Delivery',
        selectedItem: request.item,
        selectedLoan: request.loan,
        selectedUser: request.user,
      });
    }

    if (prevProps.query.userBarcode !== this.props.query.userBarcode) {
      this.findUser(this.props.query.userBarcode);
    }

    if (prevProps.query.itemBarcode !== this.props.query.itemBarcode) {
      this.findItem(this.props.query.itemBarcode);
    }

    if (!isEqual(blocks, prevBlocks) && blocks.length > 0) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ blocked: true });
    }
  }

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
    });
  }

  onChangeFulfilment(e) {
    this.setState({
      selectedDelivery: e.target.value === 'Delivery',
    });
  }

  onChangeAddress(e) {
    this.setState({
      selectedAddressTypeId: e.target.value,
    });
  }

  // This function is called from the "search and select user" widget when
  // a user has been selected from the list
  onSelectUser(user) {
    if (user) {
      this.findUser(user.barcode);
    }
  }

  // Executed when user is selected from the proxy dialog
  onSelectProxy(proxy) {
    const { selectedUser } = this.state;

    if (selectedUser.id === proxy.id) {
      this.setState({ selectedUser, proxy: selectedUser });
      this.props.change('requesterId', selectedUser.id);
    } else {
      this.setState({ selectedUser, proxy });
      this.props.change('requesterId', proxy.id);
      this.props.change('proxyUserId', selectedUser.id);
    }
  }

  onUserClick() {
    const barcode = this.requesterBarcodeRef.current.value;
    if (!barcode) return;
    this.findUser(barcode);
  }

  findUser(barcode) {
    const blocks = this.getPatronBlocks(this.props.parentResources);
    // Set the new value in the redux-form barcode field
    this.props.change('requester.barcode', barcode);
    this.setState({ selectedUser: null, proxy: null });

    this.props.findResource('user', barcode, 'barcode').then((result) => {
      if (result.totalRecords === 1) {
        const selectedUser = result.users[0];
        if (blocks.length > 0 && blocks[0].userId === selectedUser.id) {
          this.setState({ blocked: true });
        }
        this.props.onChangePatron(selectedUser);
        this.setState({ selectedUser });
        this.props.change('requesterId', selectedUser.id);
      }
    });
  }

  findLoan(item) {
    const { findResource } = this.props;

    return Promise.all(
      [
        findResource('loan', item.id),
        findResource('requestsForItem', item.id),
      ],
    ).then((results) => {
      const selectedLoan = results[0].loans[0];
      const requestCount = results[1].requests.length;

      this.setState({ requestCount });

      if (selectedLoan) {
        this.setState({ selectedLoan });
      }

      return item;
    });
  }

  findItem(barcode) {
    const { findResource } = this.props;
    findResource('item', barcode, 'barcode')
      .then((result) => {
        if (!result || result.totalRecords === 0) return result;

        const item = result.items[0];
        this.props.change('itemId', item.id);
        this.props.change('item.barcode', barcode);

        // Setting state here is redundant with what follows, but it lets us
        // display the matched item as quickly as possible, without waiting for
        // the slow loan and request lookups
        this.setState({
          selectedItem: item,
        });

        return item;
      })
      .then(item => this.findLoan(item));
  }

  onItemClick() {
    const blocks = this.getPatronBlocks(this.props.parentResources);
    if (blocks.length > 0 && this.state.selectedUser) {
      this.setState({ blocked: true });
    }

    this.setState({ selectedItem: null });
    const barcode = this.itemBarcodeRef.current.value;
    this.findItem(barcode);
  }

  // This function only exists to enable 'do lookup on enter' for item and
  // user search
  onKeyDown(e, element) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      if (element === 'item') {
        this.onItemClick();
      } else {
        this.onUserClick();
      }
    }
  }

  onCancelRequest = (cancellationInfo) => {
    this.setState({ isCancellingRequest: false });
    this.props.onCancelRequest(cancellationInfo);
  }

  onCloseBlockedModal = () => {
    this.setState({ blocked: false });
  }

  onViewUserPath(selectedUser, patronGroup) {
    // reinitialize form (mark it as pristine)
    this.props.reset();
    // wait for the form to be reinitialized
    defer(() => {
      this.setState({ isCancellingRequest: false });
      const viewUserPath = `/users/view/${(selectedUser || {}).id}?filters=pg.${patronGroup}`;
      this.props.history.push(viewUserPath);
    });
  }

  requireItem = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectItem" />);
  requireUser = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectUser" />);


  getProxy() {
    const { request } = this.props;
    const { proxy } = this.state;
    const userProxy = request ? request.proxy : proxy;
    if (!userProxy) return null;

    const id = proxy.id || request.proxyUserId;
    return Object.assign({}, userProxy, { id });
  }

  getPatronBlocks = (resources) => {
    let patronBlocks = get(resources, ['patronBlocks', 'records'], []).filter(b => b.requests === true);
    patronBlocks = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    return patronBlocks;
  }

  isEditForm() {
    const { request } = this.props;

    return !!get(request, 'item.barcode');
  }

  isSubmittingButtonDisabled() {
    const {
      pristine,
      submitting,
    } = this.props;

    return pristine || submitting;
  }

  onSave = (data) => {
    const { intl: { timeZone } } = this.props;
    const { requestExpirationDate, holdShelfExpirationDate } = data;

    if (requestExpirationDate) {
      data.requestExpirationDate = moment(requestExpirationDate).utc().format();
    } else {
      unset(data, 'requestExpirationDate');
    }

    if (holdShelfExpirationDate && !holdShelfExpirationDate.match('T')) {
      const time = moment.tz(timeZone).format('HH:mm:ss');
      data.holdShelfExpirationDate = moment.tz(`${holdShelfExpirationDate} ${time}`, timeZone).utc().format();
    } else {
      unset(data, 'holdShelfExpirationDate');
    }

    this.props.onSubmit(data);
  }

  renderActionMenu = ({ onToggle }) => {
    const { onCancel } = this.props;

    if (!this.isEditForm()) {
      return (
        <Button
          buttonStyle="dropdownItem"
          id="clickable-cancel-new-request"
          data-test-cancel-new-request-action
          onClick={() => {
            onCancel();
            onToggle();
          }}
        >
          <Icon icon="times-circle">
            <FormattedMessage id="ui-requests.newRequest.cancel" />
          </Icon>
        </Button>
      );
    }

    return (
      <React.Fragment>
        <Button
          onClick={onCancel}
          buttonStyle="dropdownItem"
          data-test-cancel-editing
        >
          <Icon icon="times-circle">
            <FormattedMessage id="ui-requests.edit.cancelEditing" />
          </Icon>
        </Button>
        <Button
          buttonStyle="dropdownItem"
          id="clickable-cancel-request"
          data-test-delete-request
          onClick={() => {
            this.setState({ isCancellingRequest: true });
            onToggle();
          }}
        >
          <Icon icon="trash">
            <FormattedMessage id="ui-requests.edit.deleteRequest" />
          </Icon>
        </Button>
      </React.Fragment>
    );
  };

  renderLastMenu() {
    return this.isEditForm()
      ? this.renderEditRequestLastMenu()
      : this.renderAddRequestLastMenu();
  }

  renderAddRequestFirstMenu = () => (
    <PaneMenu>
      <FormattedMessage id="ui-requests.actions.closeNewRequest">
        {title => (
          <IconButton
            onClick={this.props.onCancel}
            ariaLabel={title}
            icon="times"
          />
        )}
      </FormattedMessage>
    </PaneMenu>
  );

  renderAddRequestLastMenu = () => {
    return (
      <PaneMenu>
        <Button
          id="clickable-create-request"
          type="submit"
          disabled={this.isSubmittingButtonDisabled()}
          marginBottom0
          buttonStyle="primary paneHeaderNewButton"
        >
          <FormattedMessage id="ui-requests.actions.newRequest" />
        </Button>
      </PaneMenu>
    );
  }

  renderEditRequestLastMenu = () => {
    return (
      <PaneMenu>
        <Button
          id="clickable-update-request"
          type="submit"
          disabled={this.isSubmittingButtonDisabled()}
          marginBottom0
          buttonStyle="primary paneHeaderNewButton"
        >
          <FormattedMessage id="ui-requests.actions.updateRequest" />
        </Button>
      </PaneMenu>
    );
  }

  render() {
    const {
      handleSubmit,
      request,
      optionLists: {
        servicePoints,
        addressTypes,
        requestTypes = [],
        fulfilmentTypes = [],
      },
      patronGroups,
      parentResources,
      submitting,
      intl: {
        formatMessage,
      },
    } = this.props;

    const {
      accordions,
      blocked,
      selectedUser,
      selectedItem,
      selectedLoan,
      requestCount,
      selectedAddressTypeId,
      selectedDelivery,
      isCancellingRequest,
    } = this.state;

    const patronBlocks = this.getPatronBlocks(parentResources);
    const {
      requestType,
      fulfilmentPreference
    } = (request || {});

    const isEditForm = this.isEditForm();
    const sortedRequestTypes = sortBy(requestTypes, ['label']);
    const sortedFulfilmentTypes = sortBy(fulfilmentTypes, ['label']);

    const requestTypeOptions = sortedRequestTypes.map(({ label, id }) => ({
      labelTranslationPath: label,
      value: id,
      selected: requestType === id
    }));

    const fulfilmentTypeOptions = sortedFulfilmentTypes.map(({ label, id }) => ({
      labelTranslationPath: label,
      value: id,
      selected: id === fulfilmentPreference
    }));

    const labelAsterisk = isEditForm
      ? ''
      : ' *';

    const disableRecordCreation = true;

    let deliveryLocations;
    let deliveryLocationsDetail = [];
    let addressDetail;
    if (selectedUser && selectedUser.personal && selectedUser.personal.addresses) {
      deliveryLocations = selectedUser.personal.addresses.map((a) => {
        const typeName = find(addressTypes, { id: a.addressTypeId }).addressType;
        return { label: typeName, value: a.addressTypeId };
      });
      deliveryLocations = sortBy(deliveryLocations, ['label']);
      deliveryLocationsDetail = keyBy(selectedUser.personal.addresses, a => a.addressTypeId);
    }

    if (selectedAddressTypeId) {
      addressDetail = toUserAddress(deliveryLocationsDetail[selectedAddressTypeId]);
    }

    let patronGroupName;
    let patronGroupGroup;
    if (patronGroups && selectedUser) {
      const group = patronGroups.find(g => g.id === selectedUser.patronGroup);
      if (group) {
        patronGroupName = group.desc;
        patronGroupGroup = group.group;
      }
    }

    const holdShelfExpireDate = (get(request, ['status'], '') === 'Open - Awaiting pickup')
      ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
      : '-';

    // map column-IDs to table-header-values
    const columnMapping = {
      name: formatMessage({ id: 'ui-requests.requester.name' }),
      patronGroup: formatMessage({ id: 'ui-requests.requester.patronGroup.group' }),
      username: formatMessage({ id: 'ui-requests.requester.username' }),
      barcode: formatMessage({ id: 'ui-requests.barcode' }),
    };

    const queuePosition = get(request, ['position'], '');
    const positionLink = request ?
      <div>
        <span>
          {queuePosition}
          &nbsp;
          &nbsp;
        </span>
        <Link to={`/requests?filters=requestStatus.Open%20-%20Awaiting%20pickup%2CrequestStatus.Open%20-%20In%20transit%2CrequestStatus.Open%20-%20Not%20yet%20filled&query=${request.item.barcode}&sort=Request%20Date`}>
          <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
        </Link>
      </div> : '-';

    return (
      <form
        id="form-requests"
        className={css.requestForm}
        onSubmit={handleSubmit(this.onSave)}
        data-test-requests-form
      >
        <Paneset isRoot>
          <Pane
            defaultWidth="100%"
            height="100%"
            firstMenu={this.renderAddRequestFirstMenu()}
            lastMenu={this.renderLastMenu()}
            actionMenu={this.renderActionMenu}
            paneTitle={
              isEditForm
                ? <FormattedMessage id="ui-requests.actions.editRequest" />
                : <FormattedMessage id="ui-requests.actions.newRequest" />
            }
          >
            <AccordionSet accordionStatus={accordions} onToggle={this.onToggleSection}>
              <Accordion
                id="item-info"
                label={
                  <FormattedMessage id="ui-requests.item.information">
                    {message => message + labelAsterisk}
                  </FormattedMessage>
                }
              >
                <div id="section-item-info">
                  <Row>
                    <Col xs={12}>
                      {!isEditForm &&
                        <Row>
                          <Col xs={9}>
                            <FormattedMessage id="ui-requests.item.scanOrEnterBarcode">
                              {placeholder => (
                                <Field
                                  name="item.barcode"
                                  placeholder={placeholder}
                                  aria-label={<FormattedMessage id="ui-requests.item.barcode" />}
                                  fullWidth
                                  component={TextField}
                                  withRef
                                  ref={this.itemBarcodeRef}
                                  onInput={this.onItemClickDebounce}
                                  onKeyDown={e => this.onKeyDown(e, 'item')}
                                  validate={this.requireItem}
                                />
                              )}
                            </FormattedMessage>
                          </Col>
                          <Col xs={3}>
                            <Button
                              id="clickable-select-item"
                              buttonStyle="primary noRadius"
                              fullWidth
                              onClick={this.onItemClick}
                              disabled={submitting}
                            >
                              <FormattedMessage id="ui-requests.enter" />
                            </Button>
                          </Col>
                        </Row>
                      }
                      { selectedItem &&
                        <ItemDetail
                          item={request ? request.item : selectedItem}
                          loan={request ? request.loan : selectedLoan}
                          requestCount={request ? request.requestCount : requestCount}
                        />
                      }
                    </Col>
                  </Row>
                </div>
              </Accordion>
              <Accordion
                id="request-info"
                label={<FormattedMessage id="ui-requests.requestMeta.information" />}
              >
                { isEditForm && request && request.metadata &&
                  <Col xs={12}>
                    <this.props.metadataDisplay metadata={request.metadata} />
                  </Col>
                }
                <Row>
                  <Col xs={8}>
                    <Row>
                      <Col xs={4}>
                        { !isEditForm && !selectedItem &&
                          <span data-test-request-type-message>
                            <KeyValue
                              label={<FormattedMessage id="ui-requests.requestType" />}
                              value={<FormattedMessage id="ui-requests.requestType.message" />}
                            />
                          </span>
                        }
                        { !isEditForm && selectedItem &&
                          <Field
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            name="requestType"
                            component={Select}
                            fullWidth
                            disabled={isEditForm}
                          >
                            {requestTypeOptions.map(({ labelTranslationPath, value, selected }) => (
                              <FormattedMessage id={labelTranslationPath}>
                                {translatedLabel => (
                                  <option
                                    value={value}
                                    selected={selected}
                                  >
                                    {translatedLabel}
                                  </option>
                                )}
                              </FormattedMessage>
                            ))}
                          </Field>
                        }
                        {isEditForm &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            value={request.requestType}
                          />
                        }
                      </Col>
                      <Col xs={3}>
                        {isEditForm &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.status" />}
                            value={request.status}
                          />
                        }
                      </Col>
                      <Col xs={3}>
                        <Field
                          name="requestExpirationDate"
                          label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                          aria-label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                          backendDateStandard="YYYY-MM-DD"
                          component={Datepicker}
                          dateFormat="YYYY-MM-DD"
                          id="requestExpirationDate"
                        />
                      </Col>
                      {isEditForm && request.status === 'Open - Awaiting pickup' &&
                        <Col xs={3}>
                          <Field
                            name="holdShelfExpirationDate"
                            label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            backendDateStandard="YYYY-MM-DD"
                            component={Datepicker}
                            dateFormat="YYYY-MM-DD"
                          />
                        </Col>
                      }
                      {isEditForm && request.status !== 'Open - Awaiting pickup' &&
                        <Col xs={3}>
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            value={holdShelfExpireDate}
                          />
                        </Col>
                      }
                    </Row>
                    {isEditForm &&
                      <Row>
                        <Col xs={3}>
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.position" />}
                            value={positionLink}
                          />
                        </Col>
                      </Row>
                    }
                  </Col>
                </Row>
              </Accordion>
              <Accordion
                id="requester-info"
                label={
                  <FormattedMessage id="ui-requests.requester.information">
                    {message => message + labelAsterisk}
                  </FormattedMessage>
                }
              >
                <div id="section-requester-info">
                  <Row>
                    <Col xs={12}>
                      {!isEditForm &&
                        <Row>
                          <Col xs={9}>
                            <FormattedMessage id="ui-requests.requester.scanOrEnterBarcode">
                              {placeholder => (
                                <Field
                                  name="requester.barcode"
                                  placeholder={placeholder}
                                  aria-label={<FormattedMessage id="ui-requests.requester.barcode" />}
                                  fullWidth
                                  component={TextField}
                                  withRef
                                  ref={this.requesterBarcodeRef}
                                  onInput={this.onUserClickDebounce}
                                  onKeyDown={e => this.onKeyDown(e, 'requester')}
                                  validate={this.requireUser}
                                />
                              )}
                            </FormattedMessage>
                            <Pluggable
                              aria-haspopup="true"
                              type="find-user"
                              searchLabel={<FormattedMessage id="ui-requests.requester.findUserPluginLabel" />}
                              marginTop0
                              searchButtonStyle="link"
                              {...this.props}
                              dataKey="users"
                              selectUser={this.onSelectUser}
                              disableRecordCreation={disableRecordCreation}
                              visibleColumns={['active', 'name', 'patronGroup', 'username', 'barcode']}
                              columnMapping={columnMapping}
                            />

                          </Col>
                          <Col xs={3}>
                            <Button
                              id="clickable-select-requester"
                              buttonStyle="primary noRadius"
                              fullWidth
                              onClick={this.onUserClick}
                              disabled={submitting}
                            >
                              <FormattedMessage id="ui-requests.enter" />
                            </Button>
                          </Col>
                        </Row>
                      }
                      {selectedUser &&
                        <UserForm
                          user={request ? request.requester : selectedUser}
                          stripes={this.props.stripes}
                          request={request}
                          patronGroup={patronGroupName}
                          selectedDelivery={selectedDelivery}
                          deliveryAddress={addressDetail}
                          deliveryLocations={deliveryLocations}
                          fulfilmentTypeOptions={fulfilmentTypeOptions}
                          onChangeAddress={this.onChangeAddress}
                          onChangeFulfilment={this.onChangeFulfilment}
                          proxy={this.getProxy()}
                          servicePoints={servicePoints}
                          onSelectProxy={this.onSelectProxy}
                          onCloseProxy={() => { this.setState({ selectedUser: null, proxy: null }); }}
                        />
                      }
                    </Col>
                  </Row>
                </div>
              </Accordion>
            </AccordionSet>
          </Pane>
          <this.connectedCancelRequestDialog
            open={isCancellingRequest}
            onCancelRequest={this.onCancelRequest}
            onClose={() => this.setState({ isCancellingRequest: false })}
            request={request}
            stripes={this.props.stripes}
          />
          <PatronBlockModal
            open={blocked}
            onClose={this.onCloseBlockedModal}
            viewUserPath={() => this.onViewUserPath(selectedUser, patronGroupGroup)}
            patronBlocks={patronBlocks[0] || {}}
          />
          <br />
          <br />
          <br />
          <br />
          <br />
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'requestForm',
  asyncValidate,
  asyncBlurFields: ['item.barcode', 'requester.barcode'],
  navigationCheck: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(injectIntl(RequestForm));
