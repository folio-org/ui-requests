import _ from 'lodash';
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
  KeyValue,
  Pane,
  PaneMenu,
  Paneset,
  Row,
  Select,
  TextField
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

import CancelRequestDialog from './CancelRequestDialog';
import UserForm from './UserForm';
import ItemDetail from './ItemDetail';
import { toUserAddress } from './constants';

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
    findResource: PropTypes.func,
    fullRequest: PropTypes.object,
    metadataDisplay: PropTypes.func,
    initialValues: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    onCancelRequest: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      addressTypes: PropTypes.arrayOf(PropTypes.object),
      requestTypes: PropTypes.arrayOf(PropTypes.object),
      fulfilmentTypes: PropTypes.arrayOf(PropTypes.object),
      servicePoints: PropTypes.arrayOf(PropTypes.object),
    }),
    patronGroups: PropTypes.arrayOf(PropTypes.object),
    intl: intlShape
  }

  static defaultProps = {
    findResource: () => {},
    fullRequest: null,
    initialValues: {},
    metadataDisplay: () => {},
    optionLists: {},
    pristine: true,
    submitting: false,
  }

  constructor(props) {
    super(props);

    const { fullRequest, initialValues } = props;
    const { requester, item, loan } = (fullRequest || {});
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
    };

    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeFulfilment = this.onChangeFulfilment.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSelectUser = this.onSelectUser.bind(this);
    this.onToggleSection = this.onToggleSection.bind(this);
    this.onUserClick = this.onUserClick.bind(this);

    this.itemBarcodeRef = React.createRef();
    this.requesterBarcodeRef = React.createRef();
  }

  componentDidUpdate(prevProps) {
    const initials = this.props.initialValues;
    const fullRequest = this.props.fullRequest;
    const oldInitials = prevProps.initialValues;
    const oldRecord = prevProps.fullRequest;

    if ((initials && initials.fulfilmentPreference &&
        oldInitials && !oldInitials.fulfilmentPreference) ||
        (fullRequest && !oldRecord)) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedAddressTypeId: initials.deliveryAddressTypeId,
        selectedDelivery: initials.fulfilmentPreference === 'Delivery',
        selectedItem: fullRequest.item,
        selectedLoan: fullRequest.loan,
        selectedUser: fullRequest.user,
      });
    }
  }

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = _.cloneDeep(curState);
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
      // Set the new value in the redux-form barcode field
      this.props.change('requester.barcode', user.barcode);
      setTimeout(() => this.onUserClick());
    }
  }

  onUserClick(proxyUser = null) {
    this.setState({ selectedUser: null, proxy: null });
    const barcode = this.requesterBarcodeRef.current.getRenderedComponent().getInput().value;

    this.props.findResource('user', barcode, 'barcode').then((result) => {
      if (result.totalRecords === 1) {
        const user = result.users[0];
        if (proxyUser && proxyUser.id) {
          // the ProxyManager has been used to select a role for this user,
          // so figure out if user is a proxy or not
          if (proxyUser.id === user.id) {
            // Selected user is acting as self, so there is no proxy
            this.setState({
              selectedUser: user,
              proxy: user,
            });
            this.props.change('requesterId', user.id);
          } else {
            this.setState({
              selectedUser: proxyUser,
              proxy: user,
            });
            this.props.change('requesterId', proxyUser.id);
            this.props.change('proxyUserId', user.id);
          }
        } else {
          this.setState({
            selectedUser: user,
          });
          this.props.change('requesterId', user.id);
        }
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
    this.setState({ selectedItem: null });
    const barcode = this.itemBarcodeRef.current.getRenderedComponent().getInput().value;
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

  requireItem = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectItem" />);
  requireUser = value => (value ? undefined : <FormattedMessage id="ui-requests.errors.selectUser" />);

  render() {
    const {
      handleSubmit,
      fullRequest,
      onCancel,
      optionLists: {
        servicePoints,
        addressTypes,
        requestTypes = [],
        fulfilmentTypes = [],
      },
      patronGroups,
      pristine,
      submitting,
      intl: {
        formatMessage,
      },
    } = this.props;


    const { selectedUser, selectedItem, selectedLoan, requestCount } = this.state;
    const { item, requestType, fulfilmentPreference } = (fullRequest || {});
    const isEditForm = (item && item.barcode);
    const submittingButtonIsDisabled = pristine || submitting;

    const addRequestFirstMenu = (
      <PaneMenu>
        <FormattedMessage id="ui-requests.actions.closeNewRequest">
          {title => (
            <IconButton
              onClick={onCancel}
              ariaLabel={title}
              icon="closeX"
            />
          )}
        </FormattedMessage>
      </PaneMenu>
    );
    const addRequestLastMenu = (
      <PaneMenu>
        <Button
          id="clickable-create-request"
          type="button"
          disabled={submittingButtonIsDisabled}
          onClick={handleSubmit}
          marginBottom0
          buttonStyle="primary paneHeaderNewButton"
        >
          <FormattedMessage id="ui-requests.actions.newRequest" />
        </Button>
      </PaneMenu>
    );
    const editRequestLastMenu = (
      <PaneMenu>
        <Button
          id="clickable-update-request"
          type="button"
          disabled={submittingButtonIsDisabled}
          onClick={handleSubmit}
          marginBottom0
          buttonStyle="primary paneHeaderNewButton"
        >
          <FormattedMessage id="ui-requests.actions.updateRequest" />
        </Button>
      </PaneMenu>
    );
    const sortedRequestTypes = _.sortBy(requestTypes, ['label']);
    const sortedFulfilmentTypes = _.sortBy(fulfilmentTypes, ['label']);

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

    const labelAsterisk = isEditForm ? '' : ' *';
    const disableRecordCreation = true;

    let deliveryLocations;
    let deliveryLocationsDetail = [];
    let addressDetail;
    if (selectedUser && selectedUser.personal && selectedUser.personal.addresses) {
      deliveryLocations = selectedUser.personal.addresses.map((a) => {
        const typeName = _.find(addressTypes, { id: a.addressTypeId }).addressType;
        return { label: typeName, value: a.addressTypeId };
      });
      deliveryLocations = _.sortBy(deliveryLocations, ['label']);
      deliveryLocationsDetail = _.keyBy(selectedUser.personal.addresses, a => a.addressTypeId);
    }
    if (this.state.selectedAddressTypeId) {
      addressDetail = toUserAddress(deliveryLocationsDetail[this.state.selectedAddressTypeId]);
    }

    let patronGroupName;
    if (patronGroups && this.state.selectedUser) {
      const group = patronGroups.find(g => g.id === this.state.selectedUser.patronGroup);
      if (group) { patronGroupName = group.desc; }
    }

    const holdShelfExpireDate = (_.get(fullRequest, ['status'], '') === 'Open - Awaiting pickup')
      ? <FormattedDate value={_.get(fullRequest, ['holdShelfExpirationDate'], '')} />
      : '-';

    // map column-IDs to table-header-values
    const columnMapping = {
      name: formatMessage({ id: 'ui-requests.requester.name' }),
      patronGroup: formatMessage({ id: 'ui-requests.requester.patronGroup.group' }),
      username: formatMessage({ id: 'ui-requests.requester.username' }),
      barcode: formatMessage({ id: 'ui-requests.barcode' }),
    };

    const queuePosition = _.get(fullRequest, ['position'], '');
    const positionLink = fullRequest ?
      <div>
        <span>
          {queuePosition}
          &nbsp;
          &nbsp;
        </span>
        <Link to={`/requests?filters=requestStatus.open%20-%20not%20yet%20filled%2CrequestStatus.open%20-%20awaiting%20pickup&query=${fullRequest.item.barcode}&sort=Request%20Date`}>
          <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
        </Link>
      </div> : '-';

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane
            defaultWidth="100%"
            height="100%"
            firstMenu={addRequestFirstMenu}
            lastMenu={isEditForm ? editRequestLastMenu : addRequestLastMenu}
            actionMenuItems={isEditForm ? [{
              id: 'clickable-cancel-request',
              label: <FormattedMessage id="ui-requests.cancel.cancelRequest" />,
              onClick: () => this.setState({ isCancellingRequest: true }),
              icon: 'cancel',
            }] : undefined}
            paneTitle={
              isEditForm
                ? <FormattedMessage id="ui-requests.actions.editRequest" />
                : <FormattedMessage id="ui-requests.actions.newRequest" />
            }
          >
            <AccordionSet accordionStatus={this.state.accordions} onToggle={this.onToggleSection}>
              <Accordion
                id="request-info"
                label={<FormattedMessage id="ui-requests.requestMeta.information" />}
              >
                { isEditForm && fullRequest && fullRequest.metadata &&
                  <Col xs={12}>
                    <this.props.metadataDisplay metadata={fullRequest.metadata} />
                  </Col>
                }
                <Row>
                  <Col xs={8}>
                    <Row>
                      <Col xs={3}>
                        { !isEditForm &&
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
                            value={fullRequest.requestType}
                          />
                        }
                      </Col>
                      <Col xs={3}>
                        {isEditForm &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.status" />}
                            value={fullRequest.status}
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
                        />
                      </Col>
                      { isEditForm && fullRequest.status === 'Open - Awaiting pickup' &&
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
                      { isEditForm && fullRequest.status !== 'Open - Awaiting pickup' &&
                        <Col xs={3}>
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            value={holdShelfExpireDate}
                          />
                        </Col>
                      }
                    </Row>
                    { isEditForm &&
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
                                  onInput={this.onItemClick}
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
                              Enter
                            </Button>
                          </Col>
                        </Row>
                      }
                      { selectedItem &&
                        <ItemDetail
                          item={fullRequest ? fullRequest.item : selectedItem}
                          loan={fullRequest ? fullRequest.loan : selectedLoan}
                          requestCount={fullRequest ? fullRequest.requestCount : requestCount}
                        />
                      }
                    </Col>
                  </Row>
                </div>
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
                                  onInput={this.onUserClick}
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
                              Enter
                            </Button>
                          </Col>
                        </Row>
                      }
                      { this.state.selectedUser &&
                        <UserForm
                          user={fullRequest ? fullRequest.requester : this.state.selectedUser}
                          stripes={this.props.stripes}
                          request={fullRequest}
                          patronGroup={patronGroupName}
                          selectedDelivery={this.state.selectedDelivery}
                          deliveryAddress={addressDetail}
                          deliveryLocations={deliveryLocations}
                          fulfilmentTypeOptions={fulfilmentTypeOptions}
                          onChangeAddress={this.onChangeAddress}
                          onChangeFulfilment={this.onChangeFulfilment}
                          proxy={fullRequest ? fullRequest.proxy : this.state.proxy}
                          servicePoints={servicePoints}
                          onSelectProxy={this.onUserClick}
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
            open={this.state.isCancellingRequest}
            onCancelRequest={this.onCancelRequest}
            onClose={() => this.setState({ isCancellingRequest: false })}
            request={fullRequest}
            stripes={this.props.stripes}
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
