import React from 'react';
import PropTypes from 'prop-types';
import {
  Field,
} from 'react-final-form';
import {
  FormattedMessage,
} from 'react-intl';
import { parse } from 'query-string';

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
} from 'lodash';

import {
  Accordion,
  AccordionSet,
  Button,
  Col,
  Pane,
  PaneFooter,
  PaneHeaderIconButton,
  PaneMenu,
  Paneset,
  Row,
  Checkbox,
  AccordionStatus,
} from '@folio/stripes/components';
import stripesFinalForm from '@folio/stripes/final-form';

import RequestFormShortcutsWrapper from './components/RequestFormShortcutsWrapper';
import CancelRequestDialog from './CancelRequestDialog';
import PatronBlockModal from './PatronBlockModal';
import {
  ErrorModal,
  ItemInformation,
  InstanceInformation,
  RequestInformation,
  RequesterInformation,
  FulfilmentPreference,
} from './components';
import ItemsDialog from './ItemsDialog';
import {
  iconTypes,
  fulfillmentTypeMap,
  createModes,
  REQUEST_LEVEL_TYPES,
  RESOURCE_TYPES,
  RESOURCE_KEYS,
  REQUEST_FORM_FIELD_NAMES,
  DEFAULT_REQUEST_TYPE_VALUE,
  requestTypeOptionMap,
  REQUEST_LAYERS,
} from './constants';
import {
  handleKeyCommand,
  toUserAddress,
  getPatronGroup,
  isDelivery,
  parseErrorMessage,
  getTlrSettings,
  getFulfillmentTypeOptions,
  getDefaultRequestPreferences,
  getFulfillmentPreference,
  isDeliverySelected,
  getSelectedAddressTypeId,
  getProxy,
  isSubmittingButtonDisabled,
  isFormEditing,
  resetFieldState,
} from './utils';

import css from './requests.css';

export const ID_TYPE_MAP = {
  ITEM_ID: 'itemId',
  INSTANCE_ID: 'instanceId',
};
export const getResourceTypeId = (isTitleLevelRequest) => (isTitleLevelRequest ? ID_TYPE_MAP.INSTANCE_ID : ID_TYPE_MAP.ITEM_ID);
export const isTLR = (createTitleLevelRequest, requestLevel) => (createTitleLevelRequest || requestLevel === REQUEST_LEVEL_TYPES.TITLE);
export const getRequestInformation = (values, selectedInstance, selectedItem, request) => {
  const isTitleLevelRequest = isTLR(values.createTitleLevelRequest, request?.requestLevel);
  const selectedResource = isTitleLevelRequest ? selectedInstance : selectedItem;

  return {
    isTitleLevelRequest,
    selectedResource,
  };
};

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
    optionLists: PropTypes.shape({
      addressTypes: PropTypes.arrayOf(PropTypes.object),
      fulfillmentTypes: PropTypes.arrayOf(PropTypes.object),
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
    onSetSelectedItem: PropTypes.func.isRequired,
    onSetSelectedUser: PropTypes.func.isRequired,
    onSetSelectedInstance: PropTypes.func.isRequired,
    onSetBlocked: PropTypes.func.isRequired,
    onSetIsPatronBlocksOverridden: PropTypes.func.isRequired,
    onSetInstanceId: PropTypes.func.isRequired,
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

    const {
      request,
      initialValues,
    } = props;
    const {
      loan,
    } = (request || {});

    const { titleLevelRequestsFeatureEnabled } = this.getTlrSettings();

    this.state = {
      proxy: {},
      selectedLoan: loan,
      ...getDefaultRequestPreferences(request, initialValues),
      isAwaitingForProxySelection: false,
      titleLevelRequestsFeatureEnabled,
      isItemOrInstanceLoading: false,
      isItemsDialogOpen: false,
      isItemIdRequest: this.isItemIdProvided(),
      requestTypes: {},
      isRequestTypesReceived: false,
      isRequestTypeLoading: false,
      isRequestTypesForDuplicate: false,
      isRequestTypesForEditing: false,
    };

    this.connectedCancelRequestDialog = props.stripes.connect(CancelRequestDialog);
    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onSelectProxy = this.onSelectProxy.bind(this);
    this.onClose = this.onClose.bind(this);
    this.accordionStatusRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.query.userBarcode) {
      this.findUser(RESOURCE_KEYS.barcode, this.props.query.userBarcode);
    }

    if (this.props.query.itemBarcode) {
      this.findItem(RESOURCE_KEYS.barcode, this.props.query.itemBarcode);
    }

    if (this.props.query.itemId) {
      this.findItem(RESOURCE_KEYS.id, this.props.query.itemId);
    }

    if (this.props.query.instanceId && !this.props.query.itemBarcode && !this.props.query.itemId) {
      this.findInstance(this.props.query.instanceId);
    }

    if (isFormEditing(this.props.request)) {
      this.findRequestPreferences(this.props.initialValues.requesterId);
    }

    this.setTlrCheckboxInitialState();
  }

  componentDidUpdate(prevProps) {
    const {
      isRequestTypesForDuplicate,
      isRequestTypesForEditing,
    } = this.state;
    const {
      initialValues,
      request,
      values,
      parentResources,
      query,
      selectedItem,
      selectedUser,
      selectedInstance,
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
        initialValues.fulfillmentPreference &&
        prevInitialValues &&
        !prevInitialValues.fulfillmentPreference) ||
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

    if (query?.mode === createModes.DUPLICATE &&
      (selectedItem?.id || selectedInstance?.id) &&
      selectedUser?.id &&
      !isRequestTypesForDuplicate
    ) {
      this.setState({
        isRequestTypesForDuplicate: true,
      });
      this.getAvailableRequestTypes(selectedUser);
    }

    if (query?.layer === REQUEST_LAYERS.EDIT &&
      !isRequestTypesForEditing
    ) {
      this.setState({
        isRequestTypesForEditing: true,
      });

      const isTitleLevelRequest = isTLR(values.createTitleLevelRequest, request.requestLevel);
      const resourceTypeId = getResourceTypeId(isTitleLevelRequest);
      const resourceId = isTitleLevelRequest ? request.instanceId : request.itemId;

      this.findRequestTypes(resourceId, request.requester.id || request.requesterId, resourceTypeId);
    }

    if (prevQuery.userBarcode !== query.userBarcode) {
      this.findUser(RESOURCE_KEYS.barcode, query.userBarcode);
    }

    if (prevQuery.itemBarcode !== query.itemBarcode) {
      this.findItem(RESOURCE_KEYS.barcode, query.itemBarcode);
    }

    if (prevQuery.itemId !== query.itemId) {
      this.findItem(RESOURCE_KEYS.id, query.itemId);
    }

    if (prevQuery.instanceId !== query.instanceId) {
      this.findInstance(query.instanceId);
      this.setTlrCheckboxInitialState();
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

  isItemIdProvided = () => {
    const {
      query,
      location,
    } = this.props;
    const itemId = query?.itemId || parse(location.search)?.itemId;

    return Boolean(itemId);
  }

  getTlrSettings() {
    return getTlrSettings(this.props.parentResources?.configs?.records[0]?.value);
  }

  setTlrCheckboxInitialState() {
    const {
      form,
    } = this.props;

    if (this.state.titleLevelRequestsFeatureEnabled === false) {
      form.change(REQUEST_FORM_FIELD_NAMES.CREATE_TLR, false);
      return;
    }

    if (this.props.query.itemId || this.props.query.itemBarcode) {
      form.change(REQUEST_FORM_FIELD_NAMES.CREATE_TLR, false);
    } else if (this.props.query.instanceId) {
      form.change(REQUEST_FORM_FIELD_NAMES.CREATE_TLR, true);
    }
  }

  onClose() {
    this.props.toggleModal();
  }

  changeDeliveryAddress = (deliverySelected, selectedAddressTypeId) => {
    this.setState({
      deliverySelected,
      selectedAddressTypeId,
    }, () => {
      this.updateRequestPreferencesFields();
    });
  }

  onChangeAddress(e) {
    const { form } = this.props;
    const selectedAddressTypeId = e.target.value;

    form.change(REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, selectedAddressTypeId);
    this.setState({
      selectedAddressTypeId,
    });
  }

  getAvailableRequestTypes = (user) => {
    const {
      selectedItem,
      selectedInstance,
      request,
      values,
    } = this.props;
    const {
      selectedResource,
      isTitleLevelRequest,
    } = getRequestInformation(values, selectedInstance, selectedItem, request);

    if (selectedResource?.id && user?.id) {
      const resourceTypeId = getResourceTypeId(isTitleLevelRequest);

      this.findRequestTypes(selectedResource.id, user.id, resourceTypeId);
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
      form.change(REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, selectedUser.id);
    } else {
      onSetSelectedUser(selectedUser);
      this.setState({
        proxy,
        requestTypes: {},
        isRequestTypesReceived: false,
      });
      form.change(REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, proxy.id);
      form.change(REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, selectedUser.id);
      this.findRequestPreferences(proxy.id);
      this.getAvailableRequestTypes(proxy);
    }

    this.setState({ isAwaitingForProxySelection: false });
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

  shouldSetBlocked = (blocks, selectedUser) => {
    return blocks.length && blocks[0].userId === selectedUser.id;
  }

  findUser = (fieldName, value, isValidation = false) => {
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
        requestTypes: {},
        isRequestTypesReceived: false,
      });
      form.change(REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, undefined);
      form.change(REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, undefined);
      form.change(REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, undefined);

      return findResource(RESOURCE_TYPES.USER, value, fieldName)
        .then((result) => {
          this.setState({ isAwaitingForProxySelection: true });

          if (result.totalRecords === 1) {
            const blocks = onGetPatronManualBlocks(parentResources);
            const automatedPatronBlocks = onGetAutomatedPatronBlocks(parentResources);
            const isAutomatedPatronBlocksRequestInPendingState = parentResources.automatedPatronBlocks.isPending;
            const selectedUser = result.users[0];
            onChangePatron(selectedUser);
            form.change(REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, selectedUser.id);
            form.change(REQUEST_FORM_FIELD_NAMES.REQUESTER, selectedUser);
            onSetSelectedUser(selectedUser);

            if (fieldName === RESOURCE_KEYS.id) {
              this.triggerUserBarcodeValidation();
            }

            this.findRequestPreferences(selectedUser.id);

            if (this.shouldSetBlocked(blocks, selectedUser) || (!isEmpty(automatedPatronBlocks) && !isAutomatedPatronBlocksRequestInPendingState)) {
              onSetBlocked(true);
              onSetIsPatronBlocksOverridden(false);
            }

            return selectedUser;
          }

          return null;
        })
        .then(user => {
          this.getAvailableRequestTypes(user);

          return user;
        })
        .then(user => this.hasProxies(user))
        .finally(() => {
          this.setState({ isUserLoading: false });
        });
    }
  }

  async findRequestPreferences(userId) {
    const {
      findResource,
      form,
      request,
      initialValues,
    } = this.props;

    try {
      const { requestPreferences } = await findResource('requestPreferences', userId, 'userId');
      const preferences = requestPreferences[0];

      const defaultPreferences = getDefaultRequestPreferences(request, initialValues);
      const requestPreference = {
        ...defaultPreferences,
        ...pick(preferences, ['defaultDeliveryAddressTypeId', 'defaultServicePointId']),
        requestPreferencesLoaded: true,
      };

      // when in edit mode (editing existing request) and defaultServicePointId is present (it was
      // set during creation) just keep it instead of choosing the preferred one.
      // https://issues.folio.org/browse/UIREQ-544
      if (isFormEditing(request) && defaultPreferences.defaultServicePointId) {
        requestPreference.defaultServicePointId = defaultPreferences.defaultServicePointId;
      }

      const deliveryIsPredefined = get(preferences, 'delivery');

      if (isBoolean(deliveryIsPredefined)) {
        requestPreference.hasDelivery = deliveryIsPredefined;
      }

      const fulfillmentPreference = getFulfillmentPreference(preferences, initialValues);
      const deliverySelected = isDeliverySelected(fulfillmentPreference);

      const selectedAddress = requestPreference.selectedAddressTypeId || requestPreference.defaultDeliveryAddressTypeId;

      const selectedAddressTypeId = getSelectedAddressTypeId(deliverySelected, selectedAddress);

      this.setState({
        ...requestPreference,
        deliverySelected,
        selectedAddressTypeId,
      }, () => {
        form.change(REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE, fulfillmentPreference);

        this.updateRequestPreferencesFields();
      });
    } catch (e) {
      this.setState({
        ...getDefaultRequestPreferences(request, initialValues),
        deliverySelected: false,
      }, () => {
        form.change(REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE, fulfillmentTypeMap.HOLD_SHELF);
      });
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

      form.change(REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, deliveryAddressTypeId);
      form.change(REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, '');
    } else {
      // Only change pickupServicePointId to defaultServicePointId
      // if selected user has changed (by choosing a different user manually)
      // or if the request form is not in a DUPLICATE mode.
      // In DUPLICATE mode the pickupServicePointId from a duplicated request record will be used instead.
      if (requesterId !== selectedUser?.id || this.props?.query?.mode !== createModes.DUPLICATE) {
        form.change(REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, defaultServicePointId);
      }
      form.change(REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, '');
    }
  }

  findRequestTypes = (resourceId, requesterId, resourceType) => {
    const {
      findResource,
      form,
      request,
    } = this.props;
    const isEditForm = isFormEditing(request);

    if (!isEditForm) {
      form.change(REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE, DEFAULT_REQUEST_TYPE_VALUE);
    }

    this.setState({
      isRequestTypeLoading: true,
    });

    findResource(RESOURCE_TYPES.REQUEST_TYPES, {
      [resourceType]: resourceId,
      requesterId: requesterId,
    })
      .then(requestTypes => {
        if (!isEmpty(requestTypes)) {
          this.setState({
            requestTypes,
            isRequestTypesReceived: true,
          }, this.triggerRequestTypeValidation);
        } else {
          this.setState({
            isRequestTypesReceived: true,
          }, this.triggerRequestTypeValidation);
        }
      })
      .finally(() => {
        this.setState({
          isRequestTypeLoading: false,
        });
      });
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

  setItemIdRequest = (key, isBarcodeRequired) => {
    const { isItemIdRequest } = this.state;

    if (key === RESOURCE_KEYS.id && !isBarcodeRequired) {
      this.setState({
        isItemIdRequest: true,
      });
    } else if (key === RESOURCE_KEYS.barcode && isItemIdRequest) {
      this.setState({
        isItemIdRequest: false,
      });
    }
  };

  findItem = (key, value, isValidation = false, isBarcodeRequired = false) => {
    const {
      findResource,
      form,
      onSetSelectedItem,
      selectedUser,
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
        requestTypes: {},
        isRequestTypesReceived: false,
      });

      return findResource(RESOURCE_TYPES.ITEM, value, key)
        .then((result) => {
          this.setItemIdRequest(key, isBarcodeRequired);

          if (!result || result.totalRecords === 0) {
            this.setState({
              isItemOrInstanceLoading: false,
            });

            return null;
          }

          const item = result.items[0];

          form.change(REQUEST_FORM_FIELD_NAMES.ITEM_ID, item.id);
          form.change(REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, item.barcode);
          resetFieldState(form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE);

          // Setting state here is redundant with what follows, but it lets us
          // display the matched item as quickly as possible, without waiting for
          // the slow loan and request lookups
          onSetSelectedItem(item);
          this.setState({
            isItemOrInstanceLoading: false,
          });

          return item;
        })
        .then(item => {
          if (item && selectedUser?.id) {
            this.findRequestTypes(item.id, selectedUser.id, ID_TYPE_MAP.ITEM_ID);
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
      selectedUser,
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
        requestTypes: {},
        isRequestTypesReceived: false,
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

          form.change(REQUEST_FORM_FIELD_NAMES.INSTANCE_ID, instance.id);
          form.change(REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, instance.hrid);
          resetFieldState(form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE);

          onSetSelectedInstance(instance);
          this.setState({
            isItemOrInstanceLoading: false,
          });

          return instance;
        })
        .then(instance => {
          if (instance && selectedUser?.id) {
            this.findRequestTypes(instance.id, selectedUser.id, ID_TYPE_MAP.INSTANCE_ID);
          }

          return instance;
        })
        .then(instance => {
          this.findInstanceRelatedResources(instance);

          return instance;
        });
    }
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

  triggerRequestTypeValidation = () => {
    const {
      form,
      values,
    } = this.props;

    form.change('keyOfRequestTypeField', values.keyOfRequestTypeField ? 0 : 1);
  };

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

  handleTlrCheckboxChange = (event) => {
    const isCreateTlr = event.target.checked;
    const {
      form,
      selectedItem,
      selectedInstance,
      onSetSelectedItem,
      onSetSelectedInstance,
    } = this.props;

    form.change(REQUEST_FORM_FIELD_NAMES.CREATE_TLR, isCreateTlr);
    form.change(REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, null);
    form.change(REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, null);
    form.change(REQUEST_FORM_FIELD_NAMES.INSTANCE_ID, null);

    if (isCreateTlr) {
      onSetSelectedItem(undefined);
      this.setState({
        requestTypes: {},
        isRequestTypesReceived: false,
      });

      if (selectedItem) {
        this.findInstance(null, selectedItem.holdingsRecordId);
      }
    } else if (selectedInstance) {
      form.change(REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE, DEFAULT_REQUEST_TYPE_VALUE);
      resetFieldState(form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE);
      this.setState({
        isItemsDialogOpen: true,
      });
    } else {
      onSetSelectedInstance(undefined);
      this.setState({
        requestTypes: {},
        isRequestTypesReceived: false,
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
      requestTypes: {},
      isRequestTypesReceived: false,
      isItemIdRequest: false,
    }, this.triggerItemBarcodeValidation);
  }

  handleInstanceItemClick = (event, item) => {
    const {
      onSetSelectedInstance,
    } = this.props;
    let isBarcodeRequired = false;

    onSetSelectedInstance(undefined);
    this.setState({
      isItemsDialogOpen: false,
      requestTypes: {},
    });

    if (item?.barcode) {
      isBarcodeRequired = true;
      this.setState({
        isItemIdRequest: false,
      });
    }

    this.findItem(RESOURCE_KEYS.id, item.id, false, isBarcodeRequired);
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
      form,
      optionLists: {
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
      instanceId,
      blocked,
      values,
      onCancel,
      onGetAutomatedPatronBlocks,
      onGetPatronManualBlocks,
      isTlrEnabledOnEditPage,
      optionLists,
      pristine,
      onSetSelectedItem,
      onSetSelectedInstance,
      metadataDisplay,
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
      requestTypes,
      hasDelivery,
      defaultDeliveryAddressTypeId,
      isItemIdRequest,
      isRequestTypesReceived,
      isRequestTypeLoading,
    } = this.state;
    const {
      createTitleLevelRequest,
    } = values;
    const patronBlocks = onGetPatronManualBlocks(parentResources);
    const automatedPatronBlocks = onGetAutomatedPatronBlocks(parentResources);
    const isEditForm = isFormEditing(request);

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

    const patronGroup = getPatronGroup(selectedUser, patronGroups);
    const fulfillmentTypeOptions = getFulfillmentTypeOptions(hasDelivery, optionLists?.fulfillmentTypes || []);
    const selectedProxy = getProxy(request, proxy);
    const isSubmittingDisabled = isSubmittingButtonDisabled(pristine, submitting);
    const isTitleLevelRequest = createTitleLevelRequest || request?.requestLevel === REQUEST_LEVEL_TYPES.TITLE;
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
    const isFulfilmentPreferenceVisible = (values.requestType || isEditForm) && !isRequestTypeLoading && isRequestTypesReceived;
    const requestTypeOptions = Object.keys(requestTypes).map(requestType => {
      return {
        id: requestTypeOptionMap[requestType],
        value: requestType,
      };
    });

    return (
      <Paneset isRoot>
        <RequestFormShortcutsWrapper
          onSubmit={handleSubmit}
          onCancel={handleCancelAndClose}
          accordionStatusRef={this.accordionStatusRef}
          isSubmittingDisabled={isSubmittingDisabled}
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
                      disabled={isSubmittingDisabled}
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
                        name={REQUEST_FORM_FIELD_NAMES.CREATE_TLR}
                        type="checkbox"
                        label={formatMessage({ id: 'ui-requests.requests.createTitleLevelRequest' })}
                        component={Checkbox}
                        checked={isTitleLevelRequest}
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
                    isTitleLevelRequest
                      ? (
                        <Accordion
                          id="new-instance-info"
                          label={<FormattedMessage id="ui-requests.instance.information" />}
                        >
                          <div
                            data-testid="instanceInfoSection"
                            id="section-instance-info"
                          >
                            <InstanceInformation
                              request={request}
                              selectedInstance={selectedInstance}
                              triggerValidation={this.triggerInstanceIdValidation}
                              findInstance={this.findInstance}
                              submitting={submitting}
                              form={form}
                              values={values}
                              onSetSelectedInstance={onSetSelectedInstance}
                              isLoading={isItemOrInstanceLoading}
                              instanceRequestCount={instanceRequestCount}
                              instanceId={instanceId}
                            />
                          </div>
                        </Accordion>
                      )
                      : (
                        <Accordion
                          id="new-item-info"
                          label={<FormattedMessage id="ui-requests.item.information" />}
                        >
                          <div id="section-item-info">
                            <ItemInformation
                              request={request}
                              form={form}
                              selectedItem={selectedItem}
                              isItemIdRequest={isItemIdRequest}
                              triggerValidation={this.triggerItemBarcodeValidation}
                              findItem={this.findItem}
                              submitting={submitting}
                              onSetSelectedItem={onSetSelectedItem}
                              values={values}
                              itemRequestCount={itemRequestCount}
                              instanceId={instanceId}
                              selectedLoan={selectedLoan}
                              isLoading={isItemOrInstanceLoading}
                            />
                          </div>
                        </Accordion>
                      )
                  }
                  <Accordion
                    id="new-requester-info"
                    label={<FormattedMessage id="ui-requests.requester.information" />}
                  >
                    <div id="section-requester-info">
                      <RequesterInformation
                        {...this.props}
                        patronGroup={patronGroup}
                        selectedProxy={selectedProxy}
                        isLoading={isUserLoading}
                        onSelectProxy={this.onSelectProxy}
                        handleCloseProxy={this.handleCloseProxy}
                        findUser={this.findUser}
                        triggerUserBarcodeValidation={this.triggerUserBarcodeValidation}
                      />
                    </div>
                  </Accordion>
                  <Accordion
                    id="new-request-info"
                    label={<FormattedMessage id="ui-requests.requestMeta.information" />}
                  >
                    <RequestInformation
                      request={request}
                      requestTypeOptions={requestTypeOptions}
                      isTlrEnabledOnEditPage={isTlrEnabledOnEditPage}
                      MetadataDisplay={metadataDisplay}
                      isTitleLevelRequest={isTitleLevelRequest}
                      isRequestTypesReceived={isRequestTypesReceived}
                      isRequestTypeLoading={isRequestTypeLoading}
                      isSelectedInstance={Boolean(selectedInstance?.id)}
                      isSelectedItem={Boolean(selectedItem?.id)}
                      isSelectedUser={Boolean(selectedUser?.id)}
                      values={values}
                      form={form}
                    />
                    {isFulfilmentPreferenceVisible &&
                      <FulfilmentPreference
                        isEditForm={isEditForm}
                        requestTypes={requestTypes}
                        deliverySelected={deliverySelected}
                        deliveryAddress={addressDetail}
                        onChangeAddress={this.onChangeAddress}
                        changeDeliveryAddress={this.changeDeliveryAddress}
                        deliveryLocations={deliveryLocations}
                        fulfillmentTypeOptions={fulfillmentTypeOptions}
                        defaultDeliveryAddressTypeId={defaultDeliveryAddressTypeId}
                        request={request}
                        form={form}
                        values={values}
                      />
                    }
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
