import React from 'react';
import PropTypes from 'prop-types';
import {
  Field,
  getFormValues,
} from 'redux-form';
import {
  FormattedMessage,
  injectIntl,
} from 'react-intl';

import moment from 'moment-timezone';
import {
  sortBy,
  find,
  get,
  isEqual,
  isEmpty,
  keyBy,
  cloneDeep,
  defer,
  unset,
  pick,
  isBoolean,
  isString,
  isUndefined,
  isNil,
} from 'lodash';

import { Pluggable } from '@folio/stripes/core';
import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  Datepicker,
  FormattedDate,
  Icon,
  KeyValue,
  Pane,
  PaneFooter,
  PaneHeaderIconButton,
  PaneMenu,
  Paneset,
  Row,
  Select,
  TextArea,
  TextField,
  Timepicker,
  Checkbox,
  AccordionStatus,
} from '@folio/stripes/components';
import stripesForm from '@folio/stripes/form';

import RequestFormShortcutsWrapper from './components/RequestFormShortcutsWrapper';
import CancelRequestDialog from './CancelRequestDialog';
import UserForm from './UserForm';
import ItemDetail from './ItemDetail';
import PatronBlockModal from './PatronBlockModal';
import PositionLink from './PositionLink';
import {
  ErrorModal,
  TitleInformation,
} from './components';
import ItemsDialog from './ItemsDialog';

import asyncValidate from './asyncValidate';
import {
  requestStatuses,
  iconTypes,
  fulfilmentTypeMap,
  createModes,
  REQUEST_LEVEL_TYPES,
  requestTypesTranslations,
  requestStatusesTranslations,
} from './constants';
import {
  handleKeyCommand,
  toUserAddress,
  getPatronGroup,
  getRequestTypeOptions,
  isDelivery,
  hasNonRequestableStatus,
  parseErrorMessage,
  getTlrSettings,
  getRequestLevelValue,
  getInstanceRequestTypeOptions,
} from './utils';

import css from './requests.css';

const RESOURCE_TYPES = {
  ITEM: 'item',
  INSTANCE: 'instance',
  USER: 'user',
  HOLDING: 'holding',
};
const INSTANCE_SEGMENT_FOR_PLUGIN = 'instances';

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
    intl: PropTypes.object,
    onChangePatron: PropTypes.func,
    query: PropTypes.object,
    onSubmit: PropTypes.func,
    reset: PropTypes.func,
    parentMutator: PropTypes.shape({
      proxy: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    isTlrEnabledOnEditPage: PropTypes.bool,
  };

  static defaultProps = {
    request: null,
    metadataDisplay: () => { },
    optionLists: {},
    pristine: true,
    submitting: false,
    isTlrEnabledOnEditPage: false,
  };

  constructor(props) {
    super(props);

    const { request } = props;
    const {
      requester,
      requesterId,
      item,
      loan,
      instance,
    } = (request || {});

    const { titleLevelRequestsFeatureEnabled } = this.getTlrSettings();

    this.state = {
      proxy: {},
      selectedInstance: instance,
      selectedItem: item,
      selectedUser: { ...requester, id: requesterId },
      selectedLoan: loan,
      blocked: false,
      ...this.getDefaultRequestPreferences(),
      isPatronBlocksOverridden: false,
      isAwaitingForProxySelection: false,
      titleLevelRequestsFeatureEnabled,
      isItemOrInstanceLoading: false,
      isItemsDialogOpen: false,
    };

    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeFulfilment = this.onChangeFulfilment.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onInstanceClick = this.onInstanceClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSelectUser = this.onSelectUser.bind(this);
    this.onSelectProxy = this.onSelectProxy.bind(this);
    this.onUserClick = this.onUserClick.bind(this);
    this.onClose = this.onClose.bind(this);
    this.itemBarcodeRef = React.createRef();
    this.instanceValueRef = React.createRef();
    this.requesterBarcodeRef = React.createRef();
    this.accordionStatusRef = React.createRef();
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

    if (this.props.query.instanceId && !this.props.query.itemBarcode && !this.props.query.itemId) {
      this.findInstance(this.props.query.instanceId);
    }

    if (this.isEditForm()) {
      this.findRequestPreferences(this.props.initialValues.requesterId);
    }

    this.setTlrCheckboxInitialState();
  }

  componentDidUpdate(prevProps) {
    const { initialValues, request, parentResources, query } = this.props;

    const {
      initialValues: prevInitialValues,
      request: prevRequest,
      parentResources: prevParentResources,
      query: prevQuery,
    } = prevProps;

    const prevBlocks = this.getPatronManualBlocks(prevParentResources);
    const blocks = this.getPatronManualBlocks(parentResources);
    const prevAutomatedPatronBlocks = this.getAutomatedPatronBlocks(prevParentResources);
    const automatedPatronBlocks = this.getAutomatedPatronBlocks(parentResources);
    const { item } = initialValues;

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

    // When in duplicate mode there are cases when selectedItem from state
    // is missing or not set. In this case just set it to initial item.
    if (query?.mode === createModes.DUPLICATE &&
      item && !this.state.selectedItem) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedItem: item,
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

    if (!isEqual(prevAutomatedPatronBlocks, automatedPatronBlocks) && !isEmpty(automatedPatronBlocks)) {
      if (this.state.selectedUser.id) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ blocked: true });
      }
    }

    if (prevParentResources?.configs?.records[0]?.value !== parentResources?.configs?.records[0]?.value) {
      const {
        titleLevelRequestsFeatureEnabled,
      } = this.getTlrSettings();

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(
        {
          titleLevelRequestsFeatureEnabled,
        },
        this.setTlrCheckboxInitialState(),
      );
    }
  }

  getTlrSettings() {
    return getTlrSettings(this.props.parentResources?.configs?.records[0]?.value);
  }

  setTlrCheckboxInitialState() {
    if (this.state.titleLevelRequestsFeatureEnabled === false) {
      this.props.change('createTitleLevelRequest', false);
      return;
    }

    if (this.props.query.itemId || this.props.query.itemBarcode) {
      this.props.change('createTitleLevelRequest', false);
    } else if (this.props.query.instanceId) {
      this.props.change('createTitleLevelRequest', true);
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

    return !hasDelivery
      ? fulfilmentTypeOptions.filter(option => option.value !== fulfilmentTypeMap.DELIVERY)
      : fulfilmentTypeOptions;
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

    this.setState({ isAwaitingForProxySelection: false });
  }

  onUserClick() {
    this.resetPatronIsBlocked();
    const barcode = get(this.requesterBarcodeRef, 'current.value');

    if (!barcode) return;

    this.findUser('barcode', barcode);
  }

  async hasProxies(user) {
    if (!user) {
      this.setState({ isAwaitingForProxySelection: false });

      return;
    }

    const { parentMutator: mutator } = this.props;
    const query = `query=(proxyUserId==${user.id})`;

    mutator.proxy.reset();

    const userProxies = await mutator.proxy.GET({ params: { query } });

    if (userProxies.length) {
      this.setState({ isAwaitingForProxySelection: true });
    } else {
      this.setState({ isAwaitingForProxySelection: false });
    }
  }

  findUser(fieldName, value) {
    const {
      change,
      findResource,
      onChangePatron,
      asyncValidate: validate,
    } = this.props;

    // Set the new value in the redux-form barcode field
    if (fieldName === 'barcode') {
      change('requester.barcode', value);
    }

    this.setState({
      selectedUser: null,
      proxy: null,
      isUserLoading: true,
    });

    findResource(RESOURCE_TYPES.USER, value, fieldName)
      .then((result) => {
        this.setState({ isAwaitingForProxySelection: true });

        if (result.totalRecords === 1) {
          const { parentResources } = this.props;
          const blocks = this.getPatronManualBlocks(parentResources);
          const automatedPatronBlocks = this.getAutomatedPatronBlocks(parentResources);
          const isAutomatedPatronBlocksRequestInPendingState = parentResources.automatedPatronBlocks.isPending;
          const selectedUser = result.users[0];
          const state = { selectedUser };
          onChangePatron(selectedUser);
          change('requesterId', selectedUser.id);
          change('requester', selectedUser);

          this.setState(state);
          this.findRequestPreferences(selectedUser.id);

          if ((blocks.length && blocks[0].userId === selectedUser.id) || (!isEmpty(automatedPatronBlocks) && !isAutomatedPatronBlocksRequestInPendingState)) {
            this.setState({
              blocked: true,
              isPatronBlocksOverridden: false,
            });
          }

          return selectedUser;
        }

        return null;
      })
      .then(user => (!user ? validate() : user))
      .then(user => this.hasProxies(user))
      .finally(() => {
        this.setState({ isUserLoading: false });
      });
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

      const defaultPreferences = this.getDefaultRequestPreferences();
      const requestPreference = {
        ...defaultPreferences,
        ...pick(preferences, ['defaultDeliveryAddressTypeId', 'defaultServicePointId']),
        requestPreferencesLoaded: true,
      };

      // when in edit mode (editing existing request) and defaultServicePointId is present (it was
      // set during creation) just keep it instead of choosing the preferred one.
      // https://issues.folio.org/browse/UIREQ-544
      if (this.isEditForm() && defaultPreferences.defaultServicePointId) {
        requestPreference.defaultServicePointId = defaultPreferences.defaultServicePointId;
      }

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
      selectedUser,
    } = this.state;
    const {
      change,
      initialValues: {
        requesterId,
      },
    } = this.props;

    if (deliverySelected) {
      const deliveryAddressTypeId = selectedAddressTypeId || defaultDeliveryAddressTypeId;

      change('deliveryAddressTypeId', deliveryAddressTypeId);
      change('pickupServicePointId', '');
    } else {
      // Only change pickupServicePointId to defaultServicePointId
      // if selected user has changed (by choosing a different user manually)
      // or if the request form is not in a DUPLICATE mode.
      // In DUPLICATE mode the pickupServicePointId from a duplicated request record will be used instead.
      if (requesterId !== selectedUser?.id || this.props?.query?.mode !== createModes.DUPLICATE) {
        change('pickupServicePointId', defaultServicePointId);
      }
      change('deliveryAddressTypeId', '');
    }
  }

  isDeliverySelected(fulfillmentPreference) {
    return fulfillmentPreference === fulfilmentTypeMap.DELIVERY;
  }

  getSelectedAddressTypeId(deliverySelected, defaultDeliveryAddressTypeId) {
    return deliverySelected ? defaultDeliveryAddressTypeId : '';
  }

  findItemRelatedResources(item) {
    const { findResource } = this.props;
    if (!item) return null;

    return Promise.all(
      [
        findResource('loan', item.id),
        findResource('requestsForItem', item.id),
        findResource(RESOURCE_TYPES.HOLDING, item.holdingsRecordId),
      ],
    ).then((results) => {
      const selectedLoan = results[0].loans[0];
      const itemRequestCount = results[1].requests.length;
      const holdingsRecord = results[2].holdingsRecords[0];

      this.setState({
        itemRequestCount,
        instanceId: holdingsRecord?.instanceId,
        selectedLoan,
      });

      return item;
    });
  }

  findItem(key, value) {
    const { findResource } = this.props;

    this.setState({
      isItemOrInstanceLoading: true,
      requestTypeOptions: [],
    });

    return findResource(RESOURCE_TYPES.ITEM, value, key)
      .then((result) => {
        if (!result || result.totalRecords === 0) {
          this.setState({
            isItemOrInstanceLoading: false,
          });

          return null;
        }

        const item = result.items[0];
        const options = getRequestTypeOptions(item);

        this.props.change('itemId', item.id);
        this.props.change('item.barcode', item.barcode);
        if (options.length >= 1) {
          this.props.change('requestType', options[0].value);
        }

        // Setting state here is redundant with what follows, but it lets us
        // display the matched item as quickly as possible, without waiting for
        // the slow loan and request lookups
        this.setState({
          selectedItem: item,
          requestTypeOptions: options,
          isItemOrInstanceLoading: false,
        });

        if (hasNonRequestableStatus(item)) {
          this.showErrorModal();
        }

        return item;
      })
      .then(item => this.findItemRelatedResources(item))
      .then(_ => this.props.asyncValidate());
  }

  findInstanceRelatedResources(instance) {
    if (!instance) {
      return null;
    }

    const { findResource } = this.props;

    return findResource('requestsForInstance', instance.id)
      .then((result) => {
        const instanceRequestCount = result.requests.length;

        this.setState({ instanceRequestCount });

        return instance;
      });
  }

  findInstance = async (instanceId, holdingsRecordId) => {
    const { findResource } = this.props;

    this.setState({
      isItemOrInstanceLoading: true,
      requestTypeOptions: [],
    });

    const resultInstanceId = isNil(instanceId)
      ? await findResource(RESOURCE_TYPES.HOLDING, holdingsRecordId).then((holding) => holding.holdingsRecords[0].instanceId)
      : instanceId;

    return findResource(RESOURCE_TYPES.INSTANCE, resultInstanceId)
      .then((result) => {
        if (!result || result.totalRecords === 0) {
          this.setState({
            isItemOrInstanceLoading: false,
          });

          return null;
        }

        const instance = result.instances[0];

        this.props.change('instanceId', instance.id);
        this.props.change('instance.hrid', instance.hrid);

        this.setState({
          selectedInstance: instance,
          isItemOrInstanceLoading: false,
        });

        return instance;
      })
      .then(instance => {
        this.findInstanceRelatedResources(instance);
        return instance;
      })
      .then(instance => this.setInstanceRequestTypeOptions(instance))
      .then(_ => this.props.asyncValidate());
  }

  getInstanceItems = async (instanceId) => {
    const { findResource } = this.props;

    const { items } = await findResource(RESOURCE_TYPES.HOLDING, instanceId, 'instanceId')
      .then(responce => {
        const holdingRecordIds = responce.holdingsRecords.map(({ id }) => id);

        return findResource(RESOURCE_TYPES.ITEM, holdingRecordIds, 'holdingsRecordId');
      });

    return items;
  }

  setInstanceRequestTypeOptions = async (instance) => {
    if (!instance) {
      return;
    }

    const instanceItems = await this.getInstanceItems(instance.id);
    const requestTypeOptions = getInstanceRequestTypeOptions(instanceItems);

    if (requestTypeOptions.length) {
      this.props.change('requestType', requestTypeOptions[0].value);
    }

    this.setState({ requestTypeOptions });
  }

  onItemClick() {
    const barcode = get(this.itemBarcodeRef, 'current.value');

    if (barcode) {
      this.setState({ selectedItem: null });
      this.findItem('barcode', barcode);
    }
  }

  onInstanceClick() {
    const instanceId = get(this.instanceValueRef, 'current.value');

    if (instanceId) {
      this.setState({ selectedInstance: null });
      this.findInstance(instanceId);
    }
  }

  // This function only exists to enable 'do lookup on enter' for item and
  // user search
  onKeyDown(e, element) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      switch (element) {
        case RESOURCE_TYPES.ITEM:
          this.onItemClick();
          break;
        case RESOURCE_TYPES.INSTANCE:
          this.onInstanceClick();
          break;
        default:
          this.onUserClick();
      }
    }
  }

  onCancelRequest = (cancellationInfo) => {
    this.setState({ isCancellingRequest: false });
    this.props.onCancelRequest(cancellationInfo);
  }

  hideErrorModal = () => {
    this.setState({ isErrorModalOpen: false });
  }

  showErrorModal = () => {
    this.setState({ isErrorModalOpen: true });
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

    if (!value && !values?.requesterId) {
      return <FormattedMessage id="ui-requests.errors.selectUser" />;
    }

    return undefined;
  }

  requireEnterItem = () => {
    if (this.state.selectedItem === undefined) {
      return <FormattedMessage id="ui-requests.errors.selectItemRequired" />;
    }

    return undefined;
  }

  requireEnterInstance = () => {
    if (isUndefined(this.state.selectedInstance)) {
      return <FormattedMessage id="ui-requests.errors.selectInstanceRequired" />;
    }

    return undefined;
  }

  getProxy() {
    const { request } = this.props;
    const { proxy } = this.state;
    const userProxy = request ? request.proxy : proxy;
    if (!userProxy) return null;

    const id = proxy?.id || request?.proxyUserId;
    return {
      ...userProxy,
      id,
    };
  }

  getPatronManualBlocks = (resources) => {
    let patronBlocks = get(resources, ['patronBlocks', 'records'], []).filter(b => b.requests === true);
    patronBlocks = patronBlocks.filter(p => moment(moment(p.expirationDate).format()).isSameOrAfter(moment().format()));
    return patronBlocks;
  }

  getAutomatedPatronBlocks = (resources) => {
    const automatedPatronBlocks = resources?.automatedPatronBlocks?.records || [];
    return automatedPatronBlocks.reduce((blocks, block) => {
      if (block.blockRequests) {
        blocks.push(block.message);
      }

      return blocks;
    }, []);
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
      request,
    } = this.props;

    const requestData = cloneDeep(data);

    const {
      requestExpirationDate,
      holdShelfExpirationDate,
      holdShelfExpirationTime,
      fulfilmentPreference,
      deliveryAddressTypeId,
      pickupServicePointId,
    } = requestData;

    const {
      selectedItem,
      isPatronBlocksOverridden,
      instanceId,
      selectedInstance,
    } = this.state;

    if (hasNonRequestableStatus(selectedItem)) {
      return this.showErrorModal();
    }

    const [block = {}] = this.getPatronManualBlocks(parentResources);
    const automatedPatronBlocks = this.getAutomatedPatronBlocks(parentResources);

    if ((get(block, 'userId') === this.state.selectedUser.id || !isEmpty(automatedPatronBlocks)) && !isPatronBlocksOverridden) {
      return this.setState({ blocked: true });
    }

    if (!requestExpirationDate) {
      unset(requestData, 'requestExpirationDate');
    }
    if (holdShelfExpirationDate) {
      // Recombine the values from datepicker and timepicker into a single date/time
      const date = moment.tz(holdShelfExpirationDate, timeZone).format('YYYY-MM-DD');
      const time = holdShelfExpirationTime.replace('Z', '');
      const combinedDateTime = moment.tz(`${date} ${time}`, timeZone);
      requestData.holdShelfExpirationDate = combinedDateTime.utc().format();
    } else {
      unset(requestData, 'holdShelfExpirationDate');
    }
    if (fulfilmentPreference === fulfilmentTypeMap.HOLD_SHELF && isString(deliveryAddressTypeId)) {
      unset(requestData, 'deliveryAddressTypeId');
    }
    if (fulfilmentPreference === fulfilmentTypeMap.DELIVERY && isString(pickupServicePointId)) {
      unset(requestData, 'pickupServicePointId');
    }

    if (isPatronBlocksOverridden) {
      requestData.requestProcessingParameters = {
        overrideBlocks: {
          patronBlock: {},
        },
      };
    }

    requestData.instanceId = request?.instanceId || instanceId || selectedInstance?.id;
    requestData.requestLevel = request?.requestLevel || getRequestLevelValue(requestData.createTitleLevelRequest);

    if (requestData.requestLevel === REQUEST_LEVEL_TYPES.ITEM) {
      requestData.holdingsRecordId = request?.holdingsRecordId || selectedItem?.holdingsRecordId;
    }

    if (requestData.requestLevel === REQUEST_LEVEL_TYPES.TITLE) {
      unset(requestData, 'itemId');
      unset(requestData, 'holdingsRecordId');
      unset(requestData, RESOURCE_TYPES.ITEM);
    }

    unset(requestData, 'itemRequestCount');
    unset(requestData, 'titleRequestCount');
    unset(requestData, 'createTitleLevelRequest');
    unset(requestData, 'numberOfReorderableRequests');
    unset(requestData, RESOURCE_TYPES.INSTANCE);

    return this.props.onSubmit(requestData);
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

  overridePatronBlocks = () => {
    this.setState({ isPatronBlocksOverridden: true });
  };

  resetPatronIsBlocked = () => {
    this.setState({
      blocked: false,
      isPatronBlocksOverridden: false,
    });
  }

  handleTlrCheckboxChange = (event, newValue) => {
    const {
      selectedInstance,
      selectedItem,
    } = this.state;

    this.props.change('item.barcode', null);
    this.props.change('instance.hrid', null);
    this.props.change('instanceId', null);

    if (newValue) {
      this.setState({
        requestTypeOptions: [],
        selectedItem: undefined,
      });

      if (selectedItem) {
        this.findInstance(null, selectedItem.holdingsRecordId);
      }
    } else if (selectedInstance) {
      this.setState({
        isItemsDialogOpen: true,
      });
    } else {
      this.setState({
        requestTypeOptions: [],
        selectedInstance: undefined,
      });
    }
  };

  handleItemsDialogClose = () => {
    this.setState({
      isItemsDialogOpen: false,
      requestTypeOptions: [],
      selectedInstance: undefined,
    });
  }

  handleInstanceItemClick = (event, item) => {
    this.setState({
      isItemsDialogOpen: false,
      requestTypeOptions: [],
      selectedInstance: undefined,
    });

    this.findItem('id', item.id);
  }

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
      isTlrEnabledOnEditPage,
    } = this.props;

    const {
      blocked,
      selectedUser,
      selectedItem,
      selectedInstance,
      selectedLoan,
      itemRequestCount,
      instanceRequestCount,
      selectedAddressTypeId,
      deliverySelected,
      isCancellingRequest,
      instanceId,
      isUserLoading,
      isItemOrInstanceLoading,
      isErrorModalOpen,
      isPatronBlocksOverridden,
      isAwaitingForProxySelection,
      isItemsDialogOpen,
      proxy,
      requestTypeOptions,
    } = this.state;

    const { createTitleLevelRequest } = this.getCurrentFormValues();
    const patronBlocks = this.getPatronManualBlocks(parentResources);
    const automatedPatronBlocks = this.getAutomatedPatronBlocks(parentResources);
    const {
      fulfilmentPreference,
      instance,
    } = request || {};

    const isEditForm = this.isEditForm();

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

    const multiRequestTypesVisible = !isEditForm && (selectedItem || selectedInstance) && requestTypeOptions?.length > 1;
    const singleRequestTypeVisible = !isEditForm && (selectedItem || selectedInstance) && requestTypeOptions?.length === 1;
    const patronGroup = getPatronGroup(selectedUser, patronGroups);
    const requestTypeError = hasNonRequestableStatus(selectedItem);
    const itemStatus = selectedItem?.status?.name;
    const getPatronBlockModalOpenStatus = () => {
      if (isAwaitingForProxySelection) {
        return false;
      }

      const isBlockedAndOverriden = blocked && !isPatronBlocksOverridden;

      return proxy?.id
        ? isBlockedAndOverriden && (proxy.id === selectedUser?.id)
        : isBlockedAndOverriden;
    };

    const handleCancelAndClose = () => {
      const keepEditBtn = document.getElementById('clickable-cancel-editing-confirmation-confirm');
      if (isItemsDialogOpen) handleKeyCommand(this.handleItemsDialogClose);
      else if (errorMessage) this.onClose();
      else if (keepEditBtn) keepEditBtn.click();
      else onCancel();
    };

    return (
      <Paneset isRoot>
        <RequestFormShortcutsWrapper
          onSubmit={handleSubmit(this.onSave)}
          onCancel={handleCancelAndClose}
          accordionStatusRef={this.accordionStatusRef}
          isSubmittingDisabled={this.isSubmittingButtonDisabled()}
        >
          <form
            id="form-requests"
            className={css.requestForm}
            onSubmit={handleSubmit(this.onSave)}
            data-test-requests-form
          >
            <Pane
              id="request"
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
                errorMessage={parseErrorMessage(errorMessage)}
              />
            }
              {
              this.state.titleLevelRequestsFeatureEnabled && !isEditForm &&
              <div
                className={css.tlrCheckbox}
              >
                <Row>
                  <Col xs={12}>
                    <Field
                      data-testid="tlrCheckbox"
                      name="createTitleLevelRequest"
                      type="checkbox"
                      label={formatMessage({ id: 'ui-requests.requests.createTitleLevelRequest' })}
                      component={Checkbox}
                      disabled={!this.state.titleLevelRequestsFeatureEnabled || isItemOrInstanceLoading}
                      onChange={this.handleTlrCheckboxChange}
                    />
                  </Col>
                </Row>
              </div>
            }
              <AccordionStatus ref={this.accordionStatusRef}>
                <AccordionSet>
                  {
                createTitleLevelRequest || (request?.requestLevel === REQUEST_LEVEL_TYPES.TITLE)
                  ? (
                    <Accordion
                      id="new-instance-info"
                      label={
                        <FormattedMessage id="ui-requests.instance.information">
                          {message => message + labelAsterisk}
                        </FormattedMessage>
                      }
                    >
                      <div
                        data-testid="instanceInfoSection"
                        id="section-instance-info"
                      >
                        <Row>
                          <Col xs={12}>
                            {
                              !isEditForm &&
                              <>
                                <Row>
                                  <Col xs={9}>
                                    <FormattedMessage id="ui-requests.instance.scanOrEnterBarcode">
                                      {placeholder => (
                                        <Field
                                          name="instance.hrid"
                                          placeholder={placeholder}
                                          aria-label={<FormattedMessage id="ui-requests.instance.value" />}
                                          fullWidth
                                          component={TextField}
                                          forwardRef
                                          ref={this.instanceValueRef}
                                          onKeyDown={e => this.onKeyDown(e, RESOURCE_TYPES.INSTANCE)}
                                          validate={this.requireEnterInstance}
                                        />
                                      )}
                                    </FormattedMessage>
                                  </Col>
                                  <Col xs={3}>
                                    <Button
                                      buttonStyle="primary noRadius"
                                      fullWidth
                                      onClick={this.onInstanceClick}
                                      disabled={submitting}
                                    >
                                      <FormattedMessage id="ui-requests.enter" />
                                    </Button>
                                  </Col>
                                </Row>
                                <Row>
                                  <Pluggable
                                    searchButtonStyle="link"
                                    type="find-instance"
                                    searchLabel={formatMessage({ id: 'ui-requests.titleLookupPlugin' })}
                                    selectInstance={(instanceFromPlugin) => this.findInstance(instanceFromPlugin.hrid)}
                                    config={{
                                      availableSegments: [{
                                        name: INSTANCE_SEGMENT_FOR_PLUGIN,
                                      }],
                                    }}
                                  />
                                </Row>
                              </>
                            }
                            {
                              isItemOrInstanceLoading && <Icon icon="spinner-ellipsis" width="10px" />
                            }
                            {
                              selectedInstance && !isItemOrInstanceLoading &&
                              <TitleInformation
                                instanceId={request?.instanceId || selectedInstance.id || instanceId}
                                titleLevelRequestsCount={request?.titleRequestCount || instanceRequestCount}
                                title={selectedInstance.title}
                                contributors={selectedInstance.contributors || selectedInstance.contributorNames}
                                publications={selectedInstance.publication}
                                editions={selectedInstance.editions}
                                identifiers={selectedInstance.identifiers}
                              />
                            }
                          </Col>
                        </Row>
                      </div>
                    </Accordion>
                  )
                  : (
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
                            {
                              !isEditForm &&
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
                                        forwardRef
                                        ref={this.itemBarcodeRef}
                                        onKeyDown={e => this.onKeyDown(e, RESOURCE_TYPES.ITEM)}
                                        validate={this.requireEnterItem}
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
                            {
                              isItemOrInstanceLoading && <Icon icon="spinner-ellipsis" width="10px" />
                            }
                            {
                            selectedItem &&
                              <ItemDetail
                                request={request}
                                currentInstanceId={instanceId}
                                item={selectedItem}
                                loan={selectedLoan}
                                requestCount={itemRequestCount}
                              />
                            }
                          </Col>
                        </Row>
                      </div>
                    </Accordion>
                  )
              }
                  <Accordion
                    id="new-request-info"
                    label={<FormattedMessage id="ui-requests.requestMeta.information" />}
                  >
                    {isEditForm && request && request.metadata &&
                    <Col xs={12}>
                      <this.props.metadataDisplay metadata={request.metadata} />
                    </Col> }
                    <Row>
                      <Col xs={12}>
                        <Row>
                          <Col
                            data-test-request-type
                            xs={3}
                          >
                            {!isEditForm && !requestTypeOptions?.length && !requestTypeError &&
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
                              value={<FormattedMessage id={requestTypesTranslations[request?.requestType]} />}
                            /> }
                            {requestTypeError &&
                            <KeyValue
                              label={<FormattedMessage id="ui-requests.requestType" />}
                              value={<FormattedMessage id="ui-requests.noRequestTypesAvailable" />}
                            /> }
                          </Col>
                          <Col xs={2}>
                            {isEditForm &&
                            <KeyValue
                              label={<FormattedMessage id="ui-requests.status" />}
                              value={<FormattedMessage id={requestStatusesTranslations[request?.status]} />}
                            /> }
                          </Col>
                          <Col xs={2}>
                            <Field
                              name="requestExpirationDate"
                              label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                              aria-label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                              component={Datepicker}
                              dateFormat="YYYY-MM-DD"
                              id="requestExpirationDate"
                            />
                          </Col>
                          <Col
                            data-test-request-patron-comments
                            xsOffset={1}
                            xs={4}
                          >
                            {isEditForm
                              ? (
                                <KeyValue
                                  label={<FormattedMessage id="ui-requests.patronComments" />}
                                  value={request.patronComments}
                                />
                              )
                              : (
                                <Field
                                  name="patronComments"
                                  label={<FormattedMessage id="ui-requests.patronComments" />}
                                  id="patronComments"
                                  component={TextArea}
                                />
                              )
                        }
                          </Col>
                        </Row>
                        <Row>
                          {isEditForm && request.status === requestStatuses.AWAITING_PICKUP &&
                          <>
                            <Col xs={3}>
                              <Field
                                name="holdShelfExpirationDate"
                                label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                                aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                                component={Datepicker}
                                dateFormat="YYYY-MM-DD"
                              />
                            </Col>
                            <Col xs={3}>
                              <Field
                                name="holdShelfExpirationTime"
                                label={<FormattedMessage id="ui-requests.holdShelfExpirationTime" />}
                                aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationTime" />}
                                component={Timepicker}
                                timeZone="UTC"
                              />
                            </Col>
                          </>
                      }
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
                              value={
                                <PositionLink
                                  request={request}
                                  isTlrEnabled={isTlrEnabledOnEditPage}
                                />
                          }
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
                                    forwardRef
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
                          {(selectedUser?.id || request?.requester) &&
                          <UserForm
                            user={request ? request.requester : selectedUser}
                            stripes={this.props.stripes}
                            request={request}
                            patronGroup={patronGroup?.group}
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
                          />
                      }
                          {isUserLoading && <Icon icon="spinner-ellipsis" width="10px" />}
                        </Col>
                      </Row>
                    </div>
                  </Accordion>
                </AccordionSet>
              </AccordionStatus>
              <this.connectedCancelRequestDialog
                open={isCancellingRequest}
                onCancelRequest={this.onCancelRequest}
                onClose={() => this.setState({ isCancellingRequest: false })}
                request={request}
                stripes={this.props.stripes}
              />
              <PatronBlockModal
                open={getPatronBlockModalOpenStatus()}
                onClose={this.onCloseBlockedModal}
                onOverride={this.overridePatronBlocks}
                viewUserPath={() => this.onViewUserPath(selectedUser, patronGroup)}
                patronBlocks={patronBlocks || []}
                automatedPatronBlocks={automatedPatronBlocks}
              />
              <ItemsDialog
                onClose={this.handleItemsDialogClose}
                onRowClick={this.handleInstanceItemClick}
                instanceId={selectedInstance?.id}
                title={selectedInstance?.title}
                open={isItemsDialogOpen}
              />
              {isErrorModalOpen &&
              <ErrorModal
                id={`${itemStatus}-modal`}
                onClose={this.hideErrorModal}
                label={<FormattedMessage id="ui-requests.errorModal.title" />}
                errorMessage={
                  <FormattedMessage
                    id="ui-requests.errorModal.message"
                    values={{
                      title: instance?.title,
                      barcode: selectedItem.barcode,
                      materialType: get(selectedItem, 'materialType.name', ''),
                      itemStatus,
                    }}
                  />
                }
              /> }
            </Pane>
          </form>
        </RequestFormShortcutsWrapper>
      </Paneset>
    );
  }
}

export default stripesForm({
  form: 'requestForm',
  asyncValidate,
  asyncBlurFields: ['item.barcode', 'requester.barcode', 'instance.hrid'],
  navigationCheck: true,
  enableReinitialize: true,
})(injectIntl(RequestForm));
