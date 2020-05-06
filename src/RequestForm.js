import React from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  getFormValues,
} from 'redux-form';
import {
  FormattedMessage,
  FormattedDate,
  injectIntl,
  intlShape,
} from 'react-intl';

import moment from 'moment-timezone';
import {
  sortBy,
  find,
  get,
  isEqual,
  keyBy,
  cloneDeep,
  defer,
  unset,
  pick,
  isBoolean,
  isString,
} from 'lodash';

import { Pluggable } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  Datepicker,
  PaneHeaderIconButton,
  KeyValue,
  Pane,
  PaneMenu,
  Paneset,
  Row,
  Select,
  TextField,
  PaneFooter,
} from '@folio/stripes/components';

import stripesForm from '@folio/stripes/form';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import CancelRequestDialog from './CancelRequestDialog';
import UserForm from './UserForm';
import ItemDetail from './ItemDetail';
import PatronBlockModal from './PatronBlockModal';
import PositionLink from './PositionLink';

import asyncValidate from './asyncValidate';
import {
  requestStatuses,
  iconTypes,
  fulfilmentTypeMap,
} from './constants';
import ErrorModal from './components/ErrorModal';
import {
  toUserAddress,
  getPatronGroup,
  getRequestTypeOptions,
  isDelivery,
  isDeclaredLostItem,
} from './utils';

import css from './requests.css';

class RequestForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      store: PropTypes.shape({
        getState: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    change: PropTypes.func.isRequired,
    errorMessage: PropTypes.string,
    handleSubmit: PropTypes.func.isRequired,
    asyncValidate: PropTypes.func.isRequired,
    findResource: PropTypes.func.isRequired,
    request: PropTypes.object,
    metadataDisplay: PropTypes.func,
    initialValues: PropTypes.object,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired,
      search: PropTypes.string,
    }).isRequired,
    onCancel: PropTypes.func.isRequired,
    onCancelRequest: PropTypes.func,
    pristine: PropTypes.bool,
    resources: PropTypes.shape({
      query: PropTypes.object,
    }),
    submitting: PropTypes.bool,
    toggleModal: PropTypes.func,
    //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      addressTypes: PropTypes.arrayOf(PropTypes.object),
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
    onSubmit: PropTypes.func,
    reset: PropTypes.func,
  };

  static defaultProps = {
    request: null,
    metadataDisplay: () => { },
    optionLists: {},
    pristine: true,
    submitting: false,
  };

  constructor(props) {
    super(props);

    const { request } = props;
    const { requester, requesterId, item, loan } = (request || {});

    this.state = {
      accordions: {
        'new-request-info': true,
        'new-item-info': true,
        'new-requester-info': true,
      },
      proxy: {},
      selectedItem: item,
      selectedUser: { ...requester, id: requesterId },
      selectedLoan: loan,
      blocked: false,
      ...this.getDefaultRequestPreferences(),
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
    this.onClose = this.onClose.bind(this);
    this.itemBarcodeRef = React.createRef();
    this.requesterBarcodeRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.query.userBarcode) {
      this.findUser('barcode', this.props.query.userBarcode);
    }

    if (this.props.query.itemBarcode) {
      this.findItem('barcode', this.props.query.itemBarcode);
    }

    if (this.props.query.itemId) {
      this.findItem('id', this.props.query.itemId);
    }

    if (this.isEditForm()) {
      this.findRequestPreferences(this.props.initialValues.requesterId);
    }
  }

  componentDidUpdate(prevProps) {
    const { initialValues, request, parentResources, query } = this.props;

    const {
      initialValues: prevInitialValues,
      request: prevRequest,
      parentResources: prevParentResources,
      query: prevQuery,
    } = prevProps;

    const prevBlocks = this.getPatronBlocks(prevParentResources);
    const blocks = this.getPatronBlocks(parentResources);

    if (
      (initialValues &&
        initialValues.fulfilmentPreference &&
        prevInitialValues &&
        !prevInitialValues.fulfilmentPreference) ||
      !isEqual(request, prevRequest)
    ) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedAddressTypeId: initialValues.deliveryAddressTypeId,
        deliverySelected: isDelivery(initialValues),
        selectedItem: request.item,
        selectedLoan: request.loan,
        selectedUser: request.requester,
      });
    }

    if (prevQuery.userBarcode !== query.userBarcode) {
      this.findUser('barcode', query.userBarcode);
    }

    if (prevQuery.itemBarcode !== query.itemBarcode) {
      this.findItem('barcode', query.itemBarcode);
    }

    if (prevQuery.itemId !== query.itemId) {
      this.findItem('id', query.itemId);
    }

    if (!isEqual(blocks, prevBlocks) && blocks.length > 0) {
      const user = this.state.selectedUser || {};
      if (user.id === blocks[0].userId) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ blocked: true });
      }
    }
  }

  getFulfilmentTypeOptions() {
    const { hasDelivery } = this.state;
    const {
      fulfilmentTypes = [],
    } = this.props.optionLists;

    const sortedFulfilmentTypes = sortBy(fulfilmentTypes, ['label']);

    const fulfilmentTypeOptions = sortedFulfilmentTypes.map(({ label, id }) => ({
      labelTranslationPath: label,
      value: id,
    }));

    return !hasDelivery && !this.isEditForm()
      ? fulfilmentTypeOptions.filter(option => option.value !== fulfilmentTypeMap.DELIVERY)
      : fulfilmentTypeOptions;
  }

  onToggleSection({ id }) {
    this.setState((curState) => {
      const newState = cloneDeep(curState);
      newState.accordions[id] = !curState.accordions[id];
      return newState;
    });
  }

  onClose() {
    this.props.toggleModal();
  }

  onChangeFulfilment(e) {
    const selectedFullfillmentPreference = e.target.value;
    const { defaultDeliveryAddressTypeId } = this.state;

    const deliverySelected = this.isDeliverySelected(selectedFullfillmentPreference);
    const selectedAddressTypeId = this.getSelectedAddressTypeId(deliverySelected, defaultDeliveryAddressTypeId);

    this.setState({
      deliverySelected,
      selectedAddressTypeId,
    }, () => {
      this.updateRequestPreferencesFields();
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
    if (!user) return;

    const {
      id,
      barcode,
    } = user;

    if (barcode) {
      this.findUser('barcode', barcode);
    } else {
      this.findUser('id', id);
    }
  }

  // Executed when a user is selected from the proxy dialog,
  // regardless of whether the selection is "self" or an actual proxy
  onSelectProxy(proxy) {
    const { selectedUser } = this.state;

    if (selectedUser.id === proxy.id) {
      this.setState({ selectedUser, proxy: selectedUser });
      this.props.change('requesterId', selectedUser.id);
    } else {
      this.setState({ selectedUser, proxy });
      this.props.change('requesterId', proxy.id);
      this.props.change('proxyUserId', selectedUser.id);
      this.findRequestPreferences(proxy.id);
    }
  }

  onUserClick() {
    const barcode = get(this.requesterBarcodeRef, 'current.value');

    if (!barcode) return;

    this.findUser('barcode', barcode);
  }

  findUser(fieldName, value) {
    const blocks = this.getPatronBlocks(this.props.parentResources);
    // Set the new value in the redux-form barcode field

    if (fieldName === 'barcode') {
      this.props.change('requester.barcode', value);
    }

    this.setState({ selectedUser: null, proxy: null });

    this.props.findResource('user', value, fieldName).then((result) => {
      if (result.totalRecords === 1) {
        const selectedUser = result.users[0];
        if (blocks.length > 0 && blocks[0].userId === selectedUser.id) {
          this.setState({ blocked: true });
        }
        this.props.onChangePatron(selectedUser);
        this.setState({ selectedUser });
        this.props.change('requesterId', selectedUser.id);
        this.findRequestPreferences(selectedUser.id);
      }
    }).then(_ => this.props.asyncValidate());
  }

  getDefaultRequestPreferences() {
    const {
      request,
      initialValues,
    } = this.props;

    return {
      hasDelivery: false,
      requestPreferencesLoaded: false,
      defaultDeliveryAddressTypeId: '',
      defaultServicePointId: request?.pickupServicePointId || '',
      deliverySelected: isDelivery(initialValues),
      selectedAddressTypeId: initialValues.deliveryAddressTypeId || '',
    };
  }

  async findRequestPreferences(userId) {
    const {
      findResource,
      change,
    } = this.props;

    try {
      const { requestPreferences } = await findResource('requestPreferences', userId, 'userId');
      const preferences = requestPreferences[0];
      const requestPreference = {
        ...this.getDefaultRequestPreferences(),
        ...pick(preferences, ['defaultDeliveryAddressTypeId', 'defaultServicePointId']),
        requestPreferencesLoaded: true,
      };

      const deliveryIsPredefined = get(preferences, 'delivery');

      if (isBoolean(deliveryIsPredefined)) {
        requestPreference.hasDelivery = deliveryIsPredefined;
      }

      const fulfillmentPreference = this.getFullfillmentPreference(preferences);
      const deliverySelected = this.isDeliverySelected(fulfillmentPreference);

      const selectedAddress = requestPreference.selectedAddressTypeId || requestPreference.defaultDeliveryAddressTypeId;

      const selectedAddressTypeId = this.getSelectedAddressTypeId(deliverySelected, selectedAddress);

      this.setState({
        ...requestPreference,
        deliverySelected,
        selectedAddressTypeId,
      }, () => {
        change('fulfilmentPreference', fulfillmentPreference);

        this.updateRequestPreferencesFields();
      });
    } catch (e) {
      this.setState({
        ...this.getDefaultRequestPreferences(),
        requestPreferencesLoaded: true,
        deliverySelected: false,
      }, () => {
        change('fulfilmentPreference', fulfilmentTypeMap.HOLD_SHELF);
      });
    }
  }

  getFullfillmentPreference(preferences) {
    const { initialValues } = this.props;

    const requesterId = get(initialValues, 'requesterId');
    const userId = get(preferences, 'userId');

    if (requesterId === userId) {
      return get(initialValues, 'fulfilmentPreference');
    } else {
      return get(preferences, 'fulfillment', fulfilmentTypeMap.HOLD_SHELF);
    }
  }

  updateRequestPreferencesFields() {
    const {
      defaultDeliveryAddressTypeId,
      defaultServicePointId,
      deliverySelected,
      selectedAddressTypeId,
    } = this.state;
    const { change } = this.props;

    if (deliverySelected) {
      const deliveryAddressTypeId = selectedAddressTypeId || defaultDeliveryAddressTypeId;

      change('deliveryAddressTypeId', deliveryAddressTypeId);
      change('pickupServicePointId', '');
    } else {
      change('pickupServicePointId', defaultServicePointId);
      change('deliveryAddressTypeId', '');
    }
  }

  isDeliverySelected(fulfillmentPreference) {
    return fulfillmentPreference === fulfilmentTypeMap.DELIVERY;
  }

  getSelectedAddressTypeId(deliverySelected, defaultDeliveryAddressTypeId) {
    return deliverySelected ? defaultDeliveryAddressTypeId : '';
  }

  findRelatedResources(item) {
    const { findResource } = this.props;
    if (!item) return null;

    return Promise.all(
      [
        findResource('loan', item.id),
        findResource('requestsForItem', item.id),
        findResource('holding', item.holdingsRecordId),
      ],
    ).then((results) => {
      const selectedLoan = results[0].loans[0];
      const requestCount = results[1].requests.length;
      const holdingsRecord = results[2].holdingsRecords[0];

      this.setState({
        requestCount,
        instanceId: holdingsRecord && holdingsRecord.instanceId,
        selectedLoan
      });

      return item;
    });
  }

  findItem(key, value) {
    const { findResource } = this.props;
    return findResource('item', value, key)
      .then((result) => {
        if (!result || result.totalRecords === 0) return null;

        const item = result.items[0];
        const options = getRequestTypeOptions(item);

        this.props.change('itemId', item.id);
        this.props.change('item.barcode', item.barcode);
        if (options.length === 1) {
          this.props.change('requestType', options[0].value);
        }

        // Setting state here is redundant with what follows, but it lets us
        // display the matched item as quickly as possible, without waiting for
        // the slow loan and request lookups
        this.setState({ selectedItem: item });

        if (isDeclaredLostItem(item)) {
          this.showDeclaredLostModal();
        }

        return item;
      })
      .then(item => this.findRelatedResources(item))
      .then(_ => this.props.asyncValidate());
  }

  onItemClick() {
    const { parentResources } = this.props;

    const blocks = this.getPatronBlocks(parentResources);
    if (blocks.length > 0 && this.state.selectedUser) {
      this.setState({ blocked: true });
    }

    const barcode = get(this.itemBarcodeRef, 'current.value');

    if (barcode) {
      this.setState({ selectedItem: null });
      this.findItem('barcode', barcode);
    }
  }

  // This function only exists to enable 'do lookup on enter' for item and
  // user search
  onKeyDown(e, element) {
    if (e.key === 'Enter' && !e.shiftKey) {
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

  hideDeclaredLostModal = () => {
    this.setState({ showDeclaredLostError: false });
  }

  showDeclaredLostModal = () => {
    this.setState({ showDeclaredLostError: true });
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
      const viewUserPath = `/users/view/${(selectedUser || {}).id}?filters=pg.${patronGroup.group}`;
      this.props.history.push(viewUserPath);
    });
  }

  requireUser = (value) => {
    const values = this.getCurrentFormValues();

    if (!value && !values.requesterId) {
      return <FormattedMessage id="ui-requests.errors.selectUser" />;
    }

    return undefined;
  }

  getProxy() {
    const { request } = this.props;
    const { proxy } = this.state;
    const userProxy = request ? request.proxy : proxy;
    if (!userProxy) return null;

    const id = proxy.id || request.proxyUserId;
    return {
      ...userProxy,
      id,
    };
  }

  getPatronBlocks = (resources) => {
    let patronBlocks = get(resources, ['patronBlocks', 'records'], []).filter(b => b.requests === true);
    patronBlocks = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    return patronBlocks;
  }

  isEditForm() {
    const { request } = this.props;

    return !!get(request, 'id');
  }

  isSubmittingButtonDisabled() {
    const {
      pristine,
      submitting,
    } = this.props;

    return pristine || submitting;
  }

  onSave = (data) => {
    const {
      intl: {
        timeZone,
      },
      parentResources,
    } = this.props;

    const {
      requestExpirationDate,
      holdShelfExpirationDate,
      fulfilmentPreference,
      deliveryAddressTypeId,
      pickupServicePointId,
    } = data;

    const { selectedItem } = this.state;

    if (isDeclaredLostItem(selectedItem)) {
      return this.showDeclaredLostModal();
    }

    const [block = {}] = this.getPatronBlocks(parentResources);

    if (get(block, 'userId') === this.state.selectedUser.id) {
      return this.setState({ blocked: true });
    }

    if (!requestExpirationDate) unset(data, 'requestExpirationDate');
    if (holdShelfExpirationDate && !holdShelfExpirationDate.match('T')) {
      const time = moment.tz(timeZone).format('HH:mm:ss');
      data.holdShelfExpirationDate = moment.tz(`${holdShelfExpirationDate} ${time}`, timeZone).utc().format();
    } else if (!holdShelfExpirationDate) {
      unset(data, 'holdShelfExpirationDate');
    }
    if (fulfilmentPreference === fulfilmentTypeMap.HOLD_SHELF && isString(deliveryAddressTypeId)) {
      unset(data, 'deliveryAddressTypeId');
    }
    if (fulfilmentPreference === fulfilmentTypeMap.DELIVERY && isString(pickupServicePointId)) {
      unset(data, 'pickupServicePointId');
    }

    return this.props.onSubmit(data);
  };

  getCurrentFormValues = () => {
    return getFormValues('requestForm')(this.props.stripes.store.getState());
  };

  renderAddRequestFirstMenu = () => (
    <PaneMenu>
      <FormattedMessage id="ui-requests.actions.closeNewRequest">
        {title => (
          <PaneHeaderIconButton
            onClick={this.props.onCancel}
            ariaLabel={title}
            icon={iconTypes.times}
          />
        )}
      </FormattedMessage>
    </PaneMenu>
  );

  render() {
    const {
      handleSubmit,
      request,
      optionLists: {
        servicePoints,
        addressTypes,
      },
      patronGroups,
      parentResources,
      submitting,
      intl: {
        formatMessage,
      },
      errorMessage,
      onCancel,
    } = this.props;

    const {
      accordions,
      blocked,
      selectedUser,
      selectedItem,
      selectedLoan,
      requestCount,
      selectedAddressTypeId,
      deliverySelected,
      isCancellingRequest,
      instanceId,
      requestPreferencesLoaded,
      showDeclaredLostError,
    } = this.state;

    const patronBlocks = this.getPatronBlocks(parentResources);
    const {
      fulfilmentPreference
    } = request || {};

    const isEditForm = this.isEditForm();
    const requestTypeOptions = getRequestTypeOptions(selectedItem);


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

    const holdShelfExpireDate = get(request, ['status'], '') === requestStatuses.AWAITING_PICKUP
      ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
      : '-';

    // map column-IDs to table-header-values
    const columnMapping = {
      name: formatMessage({ id: 'ui-requests.requester.name' }),
      patronGroup: formatMessage({ id: 'ui-requests.requester.patronGroup.group' }),
      username: formatMessage({ id: 'ui-requests.requester.username' }),
      barcode: formatMessage({ id: 'ui-requests.barcode' }),
    };

    const multiRequestTypesVisible = !isEditForm && selectedItem && requestTypeOptions.length > 1;
    const singleRequestTypeVisible = !isEditForm && selectedItem && requestTypeOptions.length === 1;
    const patronGroup = getPatronGroup(selectedUser, patronGroups);
    const isDeclaredLost = isDeclaredLostItem(selectedItem);

    return (
      <Paneset isRoot>
        <form
          id="form-requests"
          className={css.requestForm}
          onSubmit={handleSubmit(this.onSave)}
          data-test-requests-form
        >
          <Pane
            defaultWidth="100%"
            height="100%"
            firstMenu={this.renderAddRequestFirstMenu()}
            paneTitle={
              isEditForm
                ? <FormattedMessage id="ui-requests.actions.editRequest" />
                : <FormattedMessage id="ui-requests.actions.newRequest" />
            }
            footer={
              <PaneFooter>
                <div className={css.footerContent}>
                  <Button
                    id="clickable-cancel-request-changes"
                    marginBottom0
                    buttonStyle="default mega"
                    onClick={onCancel}
                  >
                    <FormattedMessage id="ui-requests.common.cancel" />
                  </Button>
                  <Button
                    id="clickable-save-request"
                    type="submit"
                    marginBottom0
                    buttonStyle="primary mega"
                    disabled={this.isSubmittingButtonDisabled()}
                  >
                    <FormattedMessage id="ui-requests.common.saveAndClose" />
                  </Button>
                </div>
              </PaneFooter>
            }
          >
            {
              errorMessage &&
              <ErrorModal
                onClose={this.onClose}
                label={<FormattedMessage id="ui-requests.requestNotAllowed" />}
                errorMessage={errorMessage}
              />
            }
            <AccordionSet accordionStatus={accordions} onToggle={this.onToggleSection}>
              <Accordion
                id="new-item-info"
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
                                  onKeyDown={e => this.onKeyDown(e, 'item')}
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
                        </Row> }
                      {selectedItem &&
                        <ItemDetail
                          item={{ id: get(request, 'itemId'), instanceId, ...selectedItem }}
                          loan={selectedLoan}
                          requestCount={request ? request.requestCount : requestCount}
                        /> }
                    </Col>
                  </Row>
                </div>
              </Accordion>
              <Accordion
                id="new-request-info"
                label={<FormattedMessage id="ui-requests.requestMeta.information" />}
              >
                {isEditForm && request && request.metadata &&
                  <Col xs={12}>
                    <this.props.metadataDisplay metadata={request.metadata} />
                  </Col> }
                <Row>
                  <Col xs={8}>
                    <Row>
                      <Col xs={4}>
                        {!isEditForm && !selectedItem &&
                          <span data-test-request-type-message>
                            <KeyValue
                              label={<FormattedMessage id="ui-requests.requestType" />}
                              value={<FormattedMessage id="ui-requests.requestType.message" />}
                            />
                          </span> }
                        {multiRequestTypesVisible &&
                          <Field
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            name="requestType"
                            component={Select}
                            fullWidth
                            disabled={isEditForm}
                          >
                            {requestTypeOptions.map(({ id, value }) => (
                              <FormattedMessage id={id} key={id}>
                                {translatedLabel => (
                                  <option
                                    value={value}
                                  >
                                    {translatedLabel}
                                  </option>
                                )}
                              </FormattedMessage>
                            ))}
                          </Field> }
                        {singleRequestTypeVisible &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            value={
                              <span data-test-request-type-text>
                                <FormattedMessage id={requestTypeOptions[0].id} />
                              </span>
                            }
                          /> }
                        {isEditForm &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            value={request.requestType}
                          /> }
                        {isDeclaredLost &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.requestType" />}
                            value={<FormattedMessage id="ui-requests.noRequestTypesAvailable" />}
                          /> }
                      </Col>
                      <Col xs={3}>
                        {isEditForm &&
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.status" />}
                            value={request.status}
                          /> }
                      </Col>
                      <Col xs={3}>
                        <Field
                          name="requestExpirationDate"
                          label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                          aria-label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                          component={Datepicker}
                          dateFormat="YYYY-MM-DD"
                          id="requestExpirationDate"
                        />
                      </Col>
                      {isEditForm && request.status === requestStatuses.AWAITING_PICKUP &&
                        <Col xs={3}>
                          <Field
                            name="holdShelfExpirationDate"
                            label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            backendDateStandard="YYYY-MM-DD"
                            component={Datepicker}
                            dateFormat="YYYY-MM-DD"
                          />
                        </Col> }
                      {isEditForm && request.status !== requestStatuses.AWAITING_PICKUP &&
                        <Col xs={3}>
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                            value={holdShelfExpireDate}
                          />
                        </Col> }
                    </Row>
                    {isEditForm &&
                      <Row>
                        <Col xs={3}>
                          <KeyValue
                            label={<FormattedMessage id="ui-requests.position" />}
                            value={<PositionLink request={request} />}
                          />
                        </Col>
                      </Row> }
                  </Col>
                </Row>
              </Accordion>
              <Accordion
                id="new-requester-info"
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
                        </Row> }
                      {selectedUser && (requestPreferencesLoaded || this.isEditForm()) &&
                        <UserForm
                          user={request ? request.requester : selectedUser}
                          stripes={this.props.stripes}
                          request={request}
                          patronGroup={get(patronGroup, 'desc')}
                          deliverySelected={deliverySelected}
                          fulfilmentPreference={fulfilmentPreference}
                          deliveryAddress={addressDetail}
                          deliveryLocations={deliveryLocations}
                          fulfilmentTypeOptions={this.getFulfilmentTypeOptions()}
                          onChangeAddress={this.onChangeAddress}
                          onChangeFulfilment={this.onChangeFulfilment}
                          proxy={this.getProxy()}
                          servicePoints={servicePoints}
                          onSelectProxy={this.onSelectProxy}
                          onCloseProxy={() => { this.setState({ selectedUser: null, proxy: null }); }}
                        /> }
                    </Col>
                  </Row>
                </div>
              </Accordion>
            </AccordionSet>
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
              viewUserPath={() => this.onViewUserPath(selectedUser, patronGroup)}
              patronBlocks={patronBlocks || []}
            />
            {showDeclaredLostError &&
              <ErrorModal
                id="declared-lost-modal"
                data-test-declared-lost-modal
                onClose={this.hideDeclaredLostModal}
                label={<FormattedMessage id="ui-requests.declaredLost.title" />}
                errorMessage={
                  <SafeHTMLMessage
                    id="ui-requests.declaredLost.message"
                    values={{
                      title: selectedItem.title,
                      barcode: selectedItem.barcode,
                      materialType: get(selectedItem, 'materialType.name', ''),
                    }}
                  />
                }
              /> }
          </Pane>
        </form>
      </Paneset>
    );
  }
}

export default stripesForm({
  form: 'requestForm',
  asyncValidate,
  asyncBlurFields: ['item.barcode', 'requester.barcode'],
  navigationCheck: true,
  enableReinitialize: true,
})(injectIntl(RequestForm));
