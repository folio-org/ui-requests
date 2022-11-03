import React from 'react';
import PropTypes from 'prop-types';
import {
  Field,
} from 'react-final-form';

import {
  FormattedMessage,
} from 'react-intl';

import {
  sortBy,
  find,
  get,
  isEqual,
  isEmpty,
  keyBy,
  defer,
  pick,
  isBoolean,
  isNil,
  isNull,
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
  NoValue,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

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

import {
  requestStatuses,
  iconTypes,
  fulfilmentTypeMap,
  createModes,
  REQUEST_LEVEL_TYPES,
  requestTypesTranslations,
  requestStatusesTranslations,
  itemStatusesTranslations,
  RESOURCE_TYPES,
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
  getInstanceRequestTypeOptions,
  memoizeValidation,
} from './utils';

import css from './requests.css';

const INSTANCE_SEGMENT_FOR_PLUGIN = 'instances';
const ENTER_EVENT_KEY = 'Enter';

class RequestForm extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
      store: PropTypes.shape({
        getState: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    errorMessage: PropTypes.string,
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
    selectedItem: PropTypes.object,
    selectedInstance: PropTypes.object,
    selectedUser: PropTypes.object,
    values: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    blocked: PropTypes.bool.isRequired,
    instanceId: PropTypes.string.isRequired,
    isErrorModalOpen: PropTypes.bool.isRequired,
    isPatronBlocksOverridden: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func,
    parentMutator: PropTypes.shape({
      proxy: PropTypes.shape({
        reset: PropTypes.func.isRequired,
        GET: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    isTlrEnabledOnEditPage: PropTypes.bool,
    onGetAutomatedPatronBlocks: PropTypes.func.isRequired,
    onGetPatronManualBlocks: PropTypes.func.isRequired,
    onHideErrorModal: PropTypes.func.isRequired,
    onSetSelectedItem: PropTypes.func.isRequired,
    onSetSelectedUser: PropTypes.func.isRequired,
    onSetSelectedInstance: PropTypes.func.isRequired,
    onSetBlocked: PropTypes.func.isRequired,
    onSetIsPatronBlocksOverridden: PropTypes.func.isRequired,
    onSetInstanceId: PropTypes.func.isRequired,
    onShowErrorModal: PropTypes.func.isRequired,
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
      loan,
    } = (request || {});

    const { titleLevelRequestsFeatureEnabled } = this.getTlrSettings();

    this.state = {
      proxy: {},
      selectedLoan: loan,
      ...this.getDefaultRequestPreferences(),
      isAwaitingForProxySelection: false,
      titleLevelRequestsFeatureEnabled,
      isItemOrInstanceLoading: false,
      isItemsDialogOpen: false,
      isItemBarcodeClicked: false,
      isItemBarcodeBlur: false,
      shouldValidateItemBarcode: false,
      validatedItemBarcode: null,
      isUserBarcodeClicked: false,
      isUserBarcodeBlur: false,
      validatedUserBarcode: null,
      shouldValidateUserBarcode: false,
      isInstanceIdClicked: false,
      shouldValidateInstanceId: false,
      isInstanceIdBlur: false,
      validatedInstanceId: null,
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
    const {
      initialValues,
      request,
      parentResources,
      query,
      selectedItem,
      selectedUser,
      onGetAutomatedPatronBlocks,
      onGetPatronManualBlocks,
      onSetBlocked,
      onSetSelectedItem,
      onSetSelectedUser,
    } = this.props;

    const {
      initialValues: prevInitialValues,
      request: prevRequest,
      parentResources: prevParentResources,
      query: prevQuery,
    } = prevProps;

    const prevBlocks = onGetPatronManualBlocks(prevParentResources);
    const blocks = onGetPatronManualBlocks(parentResources);
    const prevAutomatedPatronBlocks = onGetAutomatedPatronBlocks(prevParentResources);
    const automatedPatronBlocks = onGetAutomatedPatronBlocks(parentResources);
    const { item } = initialValues;

    if (
      (initialValues &&
        initialValues.fulfilmentPreference &&
        prevInitialValues &&
        !prevInitialValues.fulfilmentPreference) ||
      !isEqual(request, prevRequest)
    ) {
      onSetSelectedItem(request.item);
      onSetSelectedUser(request.requester);
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedAddressTypeId: initialValues.deliveryAddressTypeId,
        deliverySelected: isDelivery(initialValues),
        selectedLoan: request.loan,
      });
    }

    // When in duplicate mode there are cases when selectedItem from state
    // is missing or not set. In this case just set it to initial item.
    if (query?.mode === createModes.DUPLICATE &&
      item && !selectedItem) {
      onSetSelectedItem(item);
      this.triggerItemBarcodeValidation();
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
      const user = selectedUser || {};
      if (user.id === blocks[0].userId) {
        onSetBlocked(true);
      }
    }

    if (!isEqual(prevAutomatedPatronBlocks, automatedPatronBlocks) && !isEmpty(automatedPatronBlocks)) {
      if (selectedUser.id) {
        onSetBlocked(true);
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
    const {
      form,
    } = this.props;

    if (this.state.titleLevelRequestsFeatureEnabled === false) {
      form.change('createTitleLevelRequest', false);
      return;
    }

    if (this.props.query.itemId || this.props.query.itemBarcode) {
      form.change('createTitleLevelRequest', false);
    } else if (this.props.query.instanceId) {
      form.change('createTitleLevelRequest', true);
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
      onSetSelectedUser,
    } = this.props;
    const {
      id,
      barcode,
    } = user;

    onSetSelectedUser(null);
    if (barcode) {
      this.findUser('barcode', barcode);
    } else {
      this.findUser('id', id);
    }
  }

  // Executed when a user is selected from the proxy dialog,
  // regardless of whether the selection is "self" or an actual proxy
  onSelectProxy(proxy) {
    const {
      form,
      selectedUser,
      onSetSelectedUser,
    } = this.props;

    if (selectedUser.id === proxy.id) {
      onSetSelectedUser(selectedUser);
      this.setState({
        proxy: selectedUser,
      });
      form.change('requesterId', selectedUser.id);
    } else {
      onSetSelectedUser(selectedUser);
      this.setState({
        proxy,
      });
      form.change('requesterId', proxy.id);
      form.change('proxyUserId', selectedUser.id);
      this.findRequestPreferences(proxy.id);
    }

    this.setState({ isAwaitingForProxySelection: false });
  }

  onUserClick(eventKey) {
    const {
      values,
      onSetSelectedUser,
    } = this.props;
    const barcode = values.requester?.barcode;

    this.resetPatronIsBlocked();

    if (barcode) {
      onSetSelectedUser(null);
      this.setState({
        isUserBarcodeClicked: true,
      });
      this.findUser('barcode', barcode);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateUserBarcode: true,
        }, this.triggerUserBarcodeValidation);
      }
    }
  }

  async hasProxies(user) {
    if (!user) {
      this.setState({ isAwaitingForProxySelection: false });

      return null;
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

    return user;
  }

  findUser(fieldName, value, isValidation = false) {
    const {
      form,
      findResource,
      parentResources,
      onChangePatron,
      onGetPatronManualBlocks,
      onGetAutomatedPatronBlocks,
      onSetIsPatronBlocksOverridden,
      onSetSelectedUser,
      onSetBlocked,
    } = this.props;

    this.setState({
      isUserLoading: true,
    });

    if (isValidation) {
      return findResource(RESOURCE_TYPES.USER, value, fieldName)
        .then((result) => {
          return result.totalRecords;
        })
        .finally(() => {
          this.setState({ isUserLoading: false });
        });
    } else {
      this.setState({
        proxy: null,
      });
      form.change('pickupServicePointId', undefined);
      form.change('deliveryAddressTypeId', undefined);

      return findResource(RESOURCE_TYPES.USER, value, fieldName)
        .then((result) => {
          this.setState({ isAwaitingForProxySelection: true });

          if (result.totalRecords === 1) {
            const blocks = onGetPatronManualBlocks(parentResources);
            const automatedPatronBlocks = onGetAutomatedPatronBlocks(parentResources);
            const isAutomatedPatronBlocksRequestInPendingState = parentResources.automatedPatronBlocks.isPending;
            const selectedUser = result.users[0];
            onChangePatron(selectedUser);
            form.change('requesterId', selectedUser.id);
            form.change('requester', selectedUser);
            onSetSelectedUser(selectedUser);
            this.findRequestPreferences(selectedUser.id);

            if ((blocks.length && blocks[0].userId === selectedUser.id) || (!isEmpty(automatedPatronBlocks) && !isAutomatedPatronBlocksRequestInPendingState)) {
              onSetBlocked(true);
              onSetIsPatronBlocksOverridden(false);
            }

            return selectedUser;
          }

          return null;
        })
        .then(user => this.hasProxies(user))
        .finally(() => {
          this.setState({ isUserLoading: false });
        });
    }
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
      form,
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
        form.change('fulfilmentPreference', fulfillmentPreference);

        this.updateRequestPreferencesFields();
      });
    } catch (e) {
      this.setState({
        ...this.getDefaultRequestPreferences(),
        deliverySelected: false,
      }, () => {
        form.change('fulfilmentPreference', fulfilmentTypeMap.HOLD_SHELF);
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
    const {
      initialValues: {
        requesterId,
      },
      form,
      selectedUser,
    } = this.props;

    if (deliverySelected) {
      const deliveryAddressTypeId = selectedAddressTypeId || defaultDeliveryAddressTypeId;

      form.change('deliveryAddressTypeId', deliveryAddressTypeId);
      form.change('pickupServicePointId', '');
    } else {
      // Only change pickupServicePointId to defaultServicePointId
      // if selected user has changed (by choosing a different user manually)
      // or if the request form is not in a DUPLICATE mode.
      // In DUPLICATE mode the pickupServicePointId from a duplicated request record will be used instead.
      if (requesterId !== selectedUser?.id || this.props?.query?.mode !== createModes.DUPLICATE) {
        form.change('pickupServicePointId', defaultServicePointId);
      }
      form.change('deliveryAddressTypeId', '');
    }
  }

  isDeliverySelected(fulfillmentPreference) {
    return fulfillmentPreference === fulfilmentTypeMap.DELIVERY;
  }

  getSelectedAddressTypeId(deliverySelected, defaultDeliveryAddressTypeId) {
    return deliverySelected ? defaultDeliveryAddressTypeId : '';
  }

  findItemRelatedResources(item) {
    const {
      findResource,
      onSetInstanceId,
    } = this.props;
    if (!item) return null;

    return Promise.all(
      [
        findResource('loan', item.id),
        findResource('requestsForItem', item.id),
        findResource(RESOURCE_TYPES.HOLDING, item.holdingsRecordId),
      ],
    ).then((results) => {
      const selectedLoan = results[0]?.loans?.[0];
      const itemRequestCount = results[1]?.requests?.length;
      const holdingsRecord = results[2]?.holdingsRecords?.[0];

      onSetInstanceId(holdingsRecord?.instanceId);
      this.setState({
        itemRequestCount,
        selectedLoan,
      });

      return item;
    });
  }

  findItem(key, value, isValidation = false) {
    const {
      findResource,
      form,
      onSetSelectedItem,
      onShowErrorModal,
    } = this.props;

    this.setState({
      isItemOrInstanceLoading: true,
    });

    if (isValidation) {
      return findResource(RESOURCE_TYPES.ITEM, value, key)
        .then((result) => {
          return result.totalRecords;
        })
        .finally(() => {
          this.setState({ isItemOrInstanceLoading: false });
        });
    } else {
      this.setState({
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

          form.change('itemId', item.id);
          form.change('item.barcode', item.barcode);
          if (options.length >= 1) {
            form.change('requestType', options[0].value);
          }

          // Setting state here is redundant with what follows, but it lets us
          // display the matched item as quickly as possible, without waiting for
          // the slow loan and request lookups
          onSetSelectedItem(item);
          this.setState({
            requestTypeOptions: options,
            isItemOrInstanceLoading: false,
          });

          if (hasNonRequestableStatus(item)) {
            onShowErrorModal();
          }

          return item;
        })
        .then(item => this.findItemRelatedResources(item));
    }
  }

  findInstanceRelatedResources(instance) {
    if (!instance) {
      return null;
    }

    const { findResource } = this.props;

    return findResource('requestsForInstance', instance.id)
      .then((result) => {
        const instanceRequestCount = result.requests.filter(r => r.requestLevel === REQUEST_LEVEL_TYPES.TITLE).length || 0;

        this.setState({ instanceRequestCount });

        return instance;
      });
  }

  findInstance = async (instanceId, holdingsRecordId, isValidation = false) => {
    const {
      findResource,
      form,
      onSetSelectedInstance,
    } = this.props;

    this.setState({
      isItemOrInstanceLoading: true,
    });

    const resultInstanceId = isNil(instanceId)
      ? await findResource(RESOURCE_TYPES.HOLDING, holdingsRecordId).then((holding) => holding.holdingsRecords[0].instanceId)
      : instanceId;

    if (isValidation) {
      return findResource(RESOURCE_TYPES.INSTANCE, resultInstanceId)
        .then((result) => {
          return result.totalRecords;
        })
        .finally(() => {
          this.setState({ isItemOrInstanceLoading: false });
        });
    } else {
      this.setState({
        requestTypeOptions: [],
      });

      return findResource(RESOURCE_TYPES.INSTANCE, resultInstanceId)
        .then((result) => {
          if (!result || result.totalRecords === 0) {
            this.setState({
              isItemOrInstanceLoading: false,
            });

            return null;
          }

          const instance = result.instances[0];

          form.change('instanceId', instance.id);
          form.change('instance.hrid', instance.hrid);

          onSetSelectedInstance(instance);
          this.setState({
            isItemOrInstanceLoading: false,
          });

          return instance;
        })
        .then(instance => {
          this.findInstanceRelatedResources(instance);
          return instance;
        })
        .then(instance => this.setInstanceRequestTypeOptions(instance));
    }
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
    const {
      form,
    } = this.props;

    if (!instance) {
      return undefined;
    }

    const requestTypeOptions = getInstanceRequestTypeOptions();

    form.change('requestType', requestTypeOptions[0].value);

    this.setState({ requestTypeOptions });

    return instance;
  }

  triggerItemBarcodeValidation = () => {
    const {
      form,
      values,
    } = this.props;

    form.change('keyOfItemBarcodeField', values.keyOfItemBarcodeField ? 0 : 1);
  };

  triggerUserBarcodeValidation = () => {
    const {
      form,
      values,
    } = this.props;

    form.change('keyOfUserBarcodeField', values.keyOfUserBarcodeField ? 0 : 1);
  };

  triggerInstanceIdValidation = () => {
    const {
      form,
      values,
    } = this.props;

    form.change('keyOfInstanceIdField', values.keyOfInstanceIdField ? 0 : 1);
  };

  onItemClick(eventKey) {
    const {
      values,
      onSetSelectedItem,
    } = this.props;
    const barcode = values.item?.barcode;

    if (barcode) {
      onSetSelectedItem(null);
      this.setState(({
        isItemBarcodeClicked: true,
      }));
      this.findItem('barcode', barcode);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateItemBarcode: true,
        }, this.triggerItemBarcodeValidation);
      }
    }
  }

  onInstanceClick(eventKey) {
    const {
      values,
      onSetSelectedInstance,
    } = this.props;
    const instanceId = values.instance?.hrid;

    if (instanceId) {
      onSetSelectedInstance(null);
      this.setState(({
        isInstanceIdClicked: true,
      }));
      this.findInstance(instanceId);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateInstanceId: true,
        }, this.triggerInstanceIdValidation);
      }
    }
  }

  // This function only exists to enable 'do lookup on enter' for item and
  // user search
  onKeyDown(e, element) {
    if (e.key === ENTER_EVENT_KEY && !e.shiftKey) {
      e.preventDefault();

      switch (element) {
        case RESOURCE_TYPES.ITEM:
          this.onItemClick(e.key);
          break;
        case RESOURCE_TYPES.INSTANCE:
          this.onInstanceClick(e.key);
          break;
        default:
          this.onUserClick(e.key);
      }
    }
  }

  onCancelRequest = (cancellationInfo) => {
    this.setState({ isCancellingRequest: false });
    this.props.onCancelRequest(cancellationInfo);
  }

  onCloseBlockedModal = () => {
    const {
      onSetBlocked,
    } = this.props;

    onSetBlocked(false);
  }

  onViewUserPath(selectedUser, patronGroup) {
    // reinitialize form (mark it as pristine)
    this.props.form.reset();
    // wait for the form to be reinitialized
    defer(() => {
      this.setState({ isCancellingRequest: false });
      const viewUserPath = `/users/view/${(selectedUser || {}).id}?filters=pg.${patronGroup.group}`;
      this.props.history.push(viewUserPath);
    });
  }

  validateItemBarcode = memoizeValidation(async (barcode) => {
    const {
      selectedItem,
    } = this.props;
    const {
      shouldValidateItemBarcode,
    } = this.state;

    if (!barcode || (!barcode && !selectedItem?.id)) {
      return <FormattedMessage id="ui-requests.errors.selectItemRequired" />;
    }

    if (barcode && shouldValidateItemBarcode) {
      this.setState({ shouldValidateItemBarcode: false });

      const item = await this.findItem('barcode', barcode, true);

      return !item
        ? <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" />
        : undefined;
    }
    return undefined;
  });

  validateRequesterBarcode = memoizeValidation(async (barcode) => {
    const {
      selectedUser,
    } = this.props;
    const {
      shouldValidateUserBarcode,
    } = this.state;

    if (!barcode || (!barcode && !selectedUser?.id)) {
      return <FormattedMessage id="ui-requests.errors.selectUser" />;
    }
    if (barcode && shouldValidateUserBarcode) {
      this.setState({ shouldValidateUserBarcode: false });

      const user = await this.findUser('barcode', barcode, true);

      return !user
        ? <FormattedMessage id="ui-requests.errors.userBarcodeDoesNotExist" />
        : undefined;
    }

    return undefined;
  });

  validateInstanceId = memoizeValidation(async (instanceId) => {
    const {
      selectedInstance,
    } = this.props;
    const {
      shouldValidateInstanceId,
    } = this.state;

    if (!instanceId || (!instanceId && !selectedInstance?.id)) {
      return <FormattedMessage id="ui-requests.errors.selectInstanceRequired" />;
    }

    if (instanceId && shouldValidateInstanceId) {
      this.setState({ shouldValidateInstanceId: false });

      const instance = await this.findInstance(instanceId, null, true);

      return !instance
        ? <FormattedMessage id="ui-requests.errors.instanceUuidOrHridDoesNotExist" />
        : undefined;
    }
    return undefined;
  })

  handleChangeItemBarcode = (event) => {
    const {
      form,
      onSetSelectedItem,
    } = this.props;
    const {
      isItemBarcodeClicked,
      isItemBarcodeBlur,
      validatedItemBarcode,
    } = this.state;
    const barcode = event.target.value;

    if (isItemBarcodeClicked || isItemBarcodeBlur) {
      this.setState({
        isItemBarcodeClicked: false,
        isItemBarcodeBlur: false,
      });
    }
    if (!isNull(validatedItemBarcode)) {
      this.setState({ validatedItemBarcode: null });
    }

    //ToDo: Should be removed? Not a clear behavior.
    if (!barcode) {
      onSetSelectedItem(undefined);
    }
    form.change('item.barcode', barcode);
  };

  handleChangeUserBarcode = (event) => {
    const {
      form,
      onSetSelectedUser,
    } = this.props;
    const {
      isUserBarcodeClicked,
      isUserBarcodeBlur,
      validatedUserBarcode,
    } = this.state;
    const barcode = event.target.value;

    if (isUserBarcodeClicked || isUserBarcodeBlur) {
      this.setState({
        isUserBarcodeClicked: false,
        isUserBarcodeBlur: false,
      });
    }
    if (!isNull(validatedUserBarcode)) {
      this.setState({ validatedUserBarcode: null });
    }

    //ToDo: Should be removed? Not a clear behavior.
    if (!barcode) {
      onSetSelectedUser(undefined);
    }
    form.change('requester.barcode', barcode);
  };

  handleChangeInstanceId = (event) => {
    const {
      form,
      onSetSelectedInstance,
    } = this.props;
    const {
      isInstanceIdClicked,
      isInstanceIdBlur,
      validatedInstanceId,
    } = this.state;
    const instanceId = event.target.value;

    if (isInstanceIdClicked || isInstanceIdBlur) {
      this.setState({
        isInstanceIdClicked: false,
        isInstanceIdBlur: false,
      });
    }
    if (!isNull(validatedInstanceId)) {
      this.setState({ validatedInstanceId: null });
    }

    //ToDo: Should be removed? Not a clear behavior.
    if (!instanceId) {
      onSetSelectedInstance(undefined);
    }
    form.change('instance.hrid', instanceId);
  }

  handleBlurUserBarcode = (input) => () => {
    const {
      validatedUserBarcode,
    } = this.state;

    if (input.value && input.value !== validatedUserBarcode) {
      this.setState({
        shouldValidateUserBarcode: true,
        isUserBarcodeBlur: true,
        validatedUserBarcode: input.value,
      }, () => {
        input.onBlur();
        this.triggerUserBarcodeValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
  }

  handleBlurItemBarcode = (input) => () => {
    const {
      validatedItemBarcode,
    } = this.state;

    if (input.value && input.value !== validatedItemBarcode) {
      this.setState({
        shouldValidateItemBarcode: true,
        isItemBarcodeBlur: true,
        validatedItemBarcode: input.value,
      }, () => {
        input.onBlur();
        this.triggerItemBarcodeValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
  }

  handleBlurInstanceId = (input) => () => {
    const {
      validatedInstanceId,
    } = this.state;

    if (input.value && input.value !== validatedInstanceId) {
      this.setState({
        shouldValidateInstanceId: true,
        isInstanceIdBlur: true,
        validatedInstanceId: input.value,
      }, () => {
        input.onBlur();
        this.triggerInstanceIdValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
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
    const {
      onSetIsPatronBlocksOverridden,
    } = this.props;

    onSetIsPatronBlocksOverridden(true);
  };

  resetPatronIsBlocked = () => {
    const {
      onSetIsPatronBlocksOverridden,
      onSetBlocked,
    } = this.props;

    onSetIsPatronBlocksOverridden(false);
    onSetBlocked(false);
  }

  handleTlrCheckboxChange = (event) => {
    const isCreateTlr = event.target.checked;
    const {
      form,
      selectedItem,
      selectedInstance,
      onSetSelectedItem,
      onSetSelectedInstance,
    } = this.props;

    form.change('createTitleLevelRequest', isCreateTlr);
    form.change('item.barcode', null);
    form.change('instance.hrid', null);
    form.change('instanceId', null);

    if (isCreateTlr) {
      onSetSelectedItem(undefined);
      this.setState({
        requestTypeOptions: [],
      });

      if (selectedItem) {
        this.findInstance(null, selectedItem.holdingsRecordId);
      }
    } else if (selectedInstance) {
      this.setState({
        isItemsDialogOpen: true,
      });
    } else {
      onSetSelectedInstance(undefined);
      this.setState({
        requestTypeOptions: [],
      });
    }
  };

  handleItemsDialogClose = () => {
    const {
      onSetSelectedInstance,
    } = this.props;

    onSetSelectedInstance(undefined);
    this.setState({
      isItemsDialogOpen: false,
      requestTypeOptions: [],
    });
  }

  handleInstanceItemClick = (event, item) => {
    const {
      onSetSelectedInstance,
    } = this.props;

    onSetSelectedInstance(undefined);
    this.setState({
      isItemsDialogOpen: false,
      requestTypeOptions: [],
    });

    this.findItem('id', item.id);
  }

  handleCloseProxy = () => {
    const {
      onSetSelectedUser,
    } = this.props;

    onSetSelectedUser(null);
    this.setState({
      proxy: null,
    });
  };

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
      selectedItem,
      selectedUser,
      selectedInstance,
      isPatronBlocksOverridden,
      isErrorModalOpen,
      instanceId,
      blocked,
      values,
      onCancel,
      onGetAutomatedPatronBlocks,
      onGetPatronManualBlocks,
      onHideErrorModal,
      isTlrEnabledOnEditPage,
    } = this.props;

    const {
      selectedLoan,
      itemRequestCount,
      instanceRequestCount,
      selectedAddressTypeId,
      deliverySelected,
      isCancellingRequest,
      isUserLoading,
      isItemOrInstanceLoading,
      isAwaitingForProxySelection,
      isItemsDialogOpen,
      proxy,
      requestTypeOptions,
      isItemBarcodeClicked,
      isUserBarcodeClicked,
      isInstanceIdClicked,
      isUserBarcodeBlur,
      isItemBarcodeBlur,
      isInstanceIdBlur,
    } = this.state;
    const {
      createTitleLevelRequest,
      keyOfItemBarcodeField,
      keyOfUserBarcodeField,
      keyOfInstanceIdField,
      deliveryAddressTypeId,
      pickupServicePointId,
    } = values;
    const patronBlocks = onGetPatronManualBlocks(parentResources);
    const automatedPatronBlocks = onGetAutomatedPatronBlocks(parentResources);
    const {
      fulfilmentPreference,
    } = request || {};

    const isEditForm = this.isEditForm();

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
    const itemStatusMessage = <FormattedMessage id={itemStatusesTranslations[itemStatus]} />;
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
          onSubmit={handleSubmit}
          onCancel={handleCancelAndClose}
          accordionStatusRef={this.accordionStatusRef}
          isSubmittingDisabled={this.isSubmittingButtonDisabled()}
        >
          <form
            id="form-requests"
            noValidate
            className={css.requestForm}
            onSubmit={handleSubmit}
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
                          label={<FormattedMessage id="ui-requests.instance.information" />}
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
                                          {placeholder => {
                                            const name = 'instance.hrid';
                                            const key = keyOfInstanceIdField ?? 0;

                                            return (
                                              <Field
                                                key={key}
                                                name={name}
                                                validate={this.validateInstanceId(name, key)}
                                                validateFields={[]}
                                              >
                                                {({ input, meta }) => {
                                                  const selectInstanceError = meta.touched && meta.error;
                                                  const instanceDoesntExistError = (isInstanceIdClicked || isInstanceIdBlur) && meta.error;
                                                  const error = selectInstanceError || instanceDoesntExistError || null;

                                                  return (
                                                    <TextField
                                                      {...input}
                                                      required
                                                      placeholder={placeholder}
                                                      label={<FormattedMessage id="ui-requests.instance.value" />}
                                                      error={error}
                                                      onChange={this.handleChangeInstanceId}
                                                      onBlur={this.handleBlurInstanceId(input)}
                                                      onKeyDown={e => this.onKeyDown(e, RESOURCE_TYPES.INSTANCE)}
                                                    />
                                                  );
                                                }}
                                              </Field>
                                            );
                                          }}
                                        </FormattedMessage>
                                      </Col>
                                      <Col xs={3}>
                                        <Button
                                          buttonStyle="primary noRadius"
                                          buttonClass={css.enterButton}
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
                          label={<FormattedMessage id="ui-requests.item.information" />}
                        >
                          <div id="section-item-info">
                            <Row>
                              <Col xs={12}>
                                {
                                  !isEditForm &&
                                  <Row>
                                    <Col xs={9}>
                                      <FormattedMessage id="ui-requests.item.scanOrEnterBarcode">
                                        {placeholder => {
                                          const name = 'item.barcode';
                                          const key = keyOfItemBarcodeField ?? 0;

                                          return (
                                            <Field
                                              data-testid="itemBarcodeField"
                                              key={key}
                                              name={name}
                                              validate={this.validateItemBarcode(name, key)}
                                              validateFields={[]}
                                            >
                                              {({ input, meta }) => {
                                                const selectItemError = meta.touched && meta.error;
                                                const itemDoesntExistError = (isItemBarcodeClicked || isItemBarcodeBlur) && meta.error;
                                                const error = meta.submitError || selectItemError || itemDoesntExistError || null;

                                                return (
                                                  <TextField
                                                    {...input}
                                                    required
                                                    placeholder={placeholder}
                                                    label={<FormattedMessage id="ui-requests.item.barcode" />}
                                                    error={error}
                                                    onChange={this.handleChangeItemBarcode}
                                                    onBlur={this.handleBlurItemBarcode(input)}
                                                    onKeyDown={e => this.onKeyDown(e, RESOURCE_TYPES.ITEM)}
                                                  />
                                                );
                                              }}
                                            </Field>
                                          );
                                        }}
                                      </FormattedMessage>
                                    </Col>
                                    <Col xs={3}>
                                      <Button
                                        id="clickable-select-item"
                                        buttonStyle="primary noRadius"
                                        buttonClass={css.enterButton}
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
                      </Col>}
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
                              </span>}
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
                              </Field>}
                            {singleRequestTypeVisible &&
                              <KeyValue
                                label={<FormattedMessage id="ui-requests.requestType" />}
                                value={
                                  <span data-test-request-type-text>
                                    <FormattedMessage id={requestTypeOptions[0].id} />
                                  </span>
                                }
                              />}
                            {isEditForm &&
                              <KeyValue
                                label={<FormattedMessage id="ui-requests.requestType" />}
                                value={<FormattedMessage id={requestTypesTranslations[request.requestType]} />}
                              />}
                            {requestTypeError &&
                              <KeyValue
                                label={<FormattedMessage id="ui-requests.requestType" />}
                                value={<FormattedMessage id="ui-requests.noRequestTypesAvailable" />}
                              />}
                          </Col>
                          <Col xs={2}>
                            {isEditForm &&
                              <KeyValue
                                label={<FormattedMessage id="ui-requests.status" />}
                                value={(requestStatusesTranslations[request.status]
                                  ? <FormattedMessage id={requestStatusesTranslations[request.status]} />
                                  : <NoValue />)}
                              />}
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
                            </Col>}
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
                          </Row>}
                      </Col>
                    </Row>
                  </Accordion>
                  <Accordion
                    id="new-requester-info"
                    label={<FormattedMessage id="ui-requests.requester.information" />}
                  >
                    <div id="section-requester-info">
                      <Row>
                        <Col xs={12}>
                          {!isEditForm &&
                            <Row>
                              <Col xs={9}>
                                <FormattedMessage id="ui-requests.requester.scanOrEnterBarcode">
                                  {placeholder => {
                                    const name = 'requester.barcode';
                                    const key = keyOfUserBarcodeField ?? 0;

                                    return (
                                      <Field
                                        key={key}
                                        name={name}
                                        validate={this.validateRequesterBarcode(name, key)}
                                        validateFields={[]}
                                      >
                                        {({ input, meta }) => {
                                          const selectUserError = meta.touched && meta.error;
                                          const userDoesntExistError = (isUserBarcodeClicked || isUserBarcodeBlur) && meta.error;
                                          const error = selectUserError || userDoesntExistError || null;

                                          return (
                                            <TextField
                                              {...input}
                                              required
                                              placeholder={placeholder}
                                              label={<FormattedMessage id="ui-requests.requester.barcode" />}
                                              error={error}
                                              onChange={this.handleChangeUserBarcode}
                                              onBlur={this.handleBlurUserBarcode(input)}
                                              onKeyDown={e => this.onKeyDown(e, 'requester')}
                                            />
                                          );
                                        }}
                                      </Field>
                                    );
                                  }}
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
                                  buttonClass={css.enterButton}
                                  fullWidth
                                  onClick={this.onUserClick}
                                  disabled={submitting}
                                >
                                  <FormattedMessage id="ui-requests.enter" />
                                </Button>
                              </Col>
                            </Row>}
                          {(selectedUser?.id || request?.requester) &&
                            (deliveryAddressTypeId !== undefined || pickupServicePointId !== undefined) &&
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
                              onCloseProxy={this.handleCloseProxy}
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
                onClose={onHideErrorModal}
                label={<FormattedMessage id="ui-requests.errorModal.title" />}
                errorMessage={
                  <FormattedMessage
                    id="ui-requests.errorModal.message"
                    values={{
                      title: selectedItem?.title,
                      barcode: selectedItem.barcode,
                      materialType: get(selectedItem, 'materialType.name', ''),
                      itemStatus: itemStatusMessage,
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

export default stripesFinalForm({
  navigationCheck: true,
  subscription: {
    values: true,
  },
})(RequestForm);
