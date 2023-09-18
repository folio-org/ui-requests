export const requestTypes = [
  { id: 'Recall', label: 'ui-requests.requestMeta.type.recall' },
  { id: 'Hold', label: 'ui-requests.requestMeta.type.hold' },
  { id: 'Page', label: 'ui-requests.requestMeta.type.page' },
];

// map from API's enum-value to translation key
export const requestTypesTranslations = {
  'Recall': 'ui-requests.requestMeta.type.recall',
  'Hold': 'ui-requests.requestMeta.type.hold',
  'Page': 'ui-requests.requestMeta.type.page',
};

export const fulfillmentTypes = [
  { id: 'Hold Shelf', label: 'ui-requests.requestMeta.fulfillment.holdShelf' },
  { id: 'Delivery', label: 'ui-requests.requestMeta.fulfillment.delivery' },
];

export const fulfillmentTypeMap = {
  DELIVERY: 'Delivery',
  HOLD_SHELF: 'Hold Shelf',
};

export const OPEN_REQUESTS_STATUSES = [
  'Open - Awaiting delivery',
  'Open - Awaiting pickup',
  'Open - In transit',
  'Open - Not yet filled',
];

// used to perform queries with the backend
// not used for data display
export const requestStatuses = {
  AWAITING_DELIVERY: 'Open - Awaiting delivery',
  AWAITING_PICKUP: 'Open - Awaiting pickup',
  CANCELLED: 'Closed - Cancelled',
  CHECKED_OUT: 'Checked out',
  FILLED: 'Closed - Filled',
  HOLD: 'Hold',
  IN_TRANSIT: 'Open - In transit',
  NOT_YET_FILLED: 'Open - Not yet filled',
  PICKUP_EXPIRED: 'Closed - Pickup expired',
  RECALL: 'Recall',
  UNFILLED: 'Closed - Unfilled',
};

export const requestOpenStatuses = [
  requestStatuses.AWAITING_DELIVERY,
  requestStatuses.AWAITING_PICKUP,
  requestStatuses.IN_TRANSIT,
  requestStatuses.NOT_YET_FILLED,
];

// map from API's enum-value to translation key
export const requestStatusesTranslations = {
  'Closed - Cancelled': 'ui-requests.filters.requestStatus.cancelled',
  'Closed - Filled': 'ui-requests.filters.requestStatus.filled',
  'Closed - Pickup expired': 'ui-requests.filters.requestStatus.pickupExpired',
  'Closed - Unfilled': 'ui-requests.filters.requestStatus.unfilled',

  'Open - Awaiting delivery': 'ui-requests.filters.requestStatus.awaitingDelivery',
  'Open - Awaiting pickup': 'ui-requests.filters.requestStatus.awaitingPickup',
  'Open - In transit': 'ui-requests.filters.requestStatus.inTransit',
  'Open - Not yet filled': 'ui-requests.filters.requestStatus.notYetFilled',
};

export const itemStatuses = {
  AGED_TO_LOST: 'Aged to lost',
  AVAILABLE: 'Available',
  AWAITING_DELIVERY: 'Awaiting delivery',
  AWAITING_PICKUP: 'Awaiting pickup',
  CHECKED_OUT: 'Checked out',
  CLAIMED_RETURNED: 'Claimed returned',
  DECLARED_LOST: 'Declared lost',
  IN_PROCESS: 'In process',
  IN_PROCESS_NON_REQUESTABLE: 'In process (non-requestable)',
  IN_TRANSIT: 'In transit',
  INTELLECTUAL_ITEM: 'Intellectual item',
  LONG_MISSING: 'Long missing',
  LOST_AND_PAID: 'Lost and paid',
  MISSING: 'Missing',
  ON_ORDER: 'On order',
  PAGED: 'Paged',
  UNAVAILABLE: 'Unavailable',
  UNKNOWN: 'Unknown',
  WITHDRAWN: 'Withdrawn',
  RECENTLY_RETURNED: 'Recently returned',
  AVAILABLE_IN_ASR: 'Available in ASR',
  RETRIEVING_FROM_ASR: 'Retrieving from ASR',
  MISSING_FROM_ASR: 'Missing from ASR',
  ORDER_CLOSED: 'Order closed',
  RESTRICTED: 'Restricted',
};

// map from API's enum-value to translation key
export const itemStatusesTranslations = {
  [itemStatuses.AGED_TO_LOST]: 'ui-requests.item.status.agedToLost',
  [itemStatuses.AVAILABLE]: 'ui-requests.item.status.available',
  [itemStatuses.AWAITING_DELIVERY]: 'ui-requests.item.status.awaitingDelivery',
  [itemStatuses.AWAITING_PICKUP]: 'ui-requests.item.status.awaitingPickup',
  [itemStatuses.CHECKED_OUT]: 'ui-requests.item.status.checkedOut',
  [itemStatuses.CLAIMED_RETURNED]: 'ui-requests.item.status.claimedReturned',
  [itemStatuses.DECLARED_LOST]: 'ui-requests.item.status.declaredLost',
  [itemStatuses.IN_PROCESS]: 'ui-requests.item.status.inProcess',
  [itemStatuses.IN_PROCESS_NON_REQUESTABLE]: 'ui-requests.item.status.inProcessNonRequestable',
  [itemStatuses.IN_TRANSIT]: 'ui-requests.item.status.inTransit',
  [itemStatuses.INTELLECTUAL_ITEM]: 'ui-requests.item.status.intellectualItem',
  [itemStatuses.LONG_MISSING]: 'ui-requests.item.status.longMissing',
  [itemStatuses.LOST_AND_PAID]: 'ui-requests.item.status.lostAndPaid',
  [itemStatuses.MISSING]: 'ui-requests.item.status.missing',
  [itemStatuses.ON_ORDER]: 'ui-requests.item.status.onOrder',
  [itemStatuses.PAGED]: 'ui-requests.item.status.paged',
  [itemStatuses.UNAVAILABLE]: 'ui-requests.item.status.unavailable',
  [itemStatuses.UNKNOWN]: 'ui-requests.item.status.unknown',
  [itemStatuses.WITHDRAWN]: 'ui-requests.item.status.withdrawn',
  [itemStatuses.RECENTLY_RETURNED]: 'ui-requests.item.status.recentlyReturned',
  [itemStatuses.AVAILABLE_IN_ASR]: 'ui-requests.item.status.availableInASR',
  [itemStatuses.RETRIEVING_FROM_ASR]: 'ui-requests.item.status.retrievingFromASR',
  [itemStatuses.MISSING_FROM_ASR]: 'ui-requests.item.status.missingFromASR',
  [itemStatuses.ORDER_CLOSED]: 'ui-requests.item.status.orderClosed',
  [itemStatuses.RESTRICTED]: 'ui-requests.item.status.restricted',
};

export const REQUEST_TYPE_ERRORS = {
  TITLE_LEVEL_ERROR: 'title',
  ITEM_LEVEL_ERROR: 'item',
};

export const REQUEST_TYPE_ERROR_TRANSLATIONS = {
  [REQUEST_TYPE_ERRORS.TITLE_LEVEL_ERROR]: 'ui-requests.errors.requestType.titleLevelRequest',
  [REQUEST_TYPE_ERRORS.ITEM_LEVEL_ERROR]: 'ui-requests.errors.requestType.itemLevelRequest',
};

export const DEFAULT_REQUEST_TYPE_VALUE = '';

export const requestTypesMap = {
  HOLD: 'Hold',
  RECALL: 'Recall',
  PAGE: 'Page',
};

export const iconTypes = {
  times: 'times',
  timesCircle: 'times-circle',
  trash: 'trash',
};

export const requestTypeOptionMap = {
  'Recall': 'ui-requests.requestMeta.type.recall',
  'Hold': 'ui-requests.requestMeta.type.hold',
  'Page': 'ui-requests.requestMeta.type.page',
};

export const requestableItemStatuses = [
  itemStatuses.CHECKED_OUT,
  itemStatuses.AVAILABLE,
  itemStatuses.AWAITING_PICKUP,
  itemStatuses.AWAITING_DELIVERY,
  itemStatuses.IN_TRANSIT,
  itemStatuses.MISSING,
  itemStatuses.PAGED,
  itemStatuses.ON_ORDER,
  itemStatuses.IN_PROCESS,
  itemStatuses.RESTRICTED,
];

export const reportHeaders = [
  'requestType',
  'status',
  'requestDate',
  'requestExpirationDate',
  'holdShelfExpirationDate',
  'position',
  'item.barcode',
  'instance.title',
  'instance.contributorNames',
  'item.location.libraryName',
  'item.location.name',
  'item.location.code',
  'item.callNumberComponents.prefix',
  'item.callNumberComponents.callNumber',
  'item.callNumberComponents.suffix',
  'item.volume',
  'item.enumeration',
  'item.chronology',
  'item.copyNumber',
  'item.status',
  'loan.dueDate',
  'requester.name',
  'requester.barcode',
  'requester.patronGroup.group',
  'fulfillmentPreference',
  'pickupServicePoint.name',
  'deliveryAddress',
  'proxy.name',
  'proxy.barcode',
  'tags.tagList',
  'patronComments',
];

export const expiredHoldsReportHeaders = [
  'requester.name',
  'requester.barcode',
  'instance.title',
  'item.barcode',
  'item.callNumberComponents.prefix',
  'item.callNumberComponents.callNumber',
  'item.callNumberComponents.suffix',
  'item.volume',
  'item.enumeration',
  'item.chronology',
  'item.copyNumber',
  'status',
  'holdShelfExpirationDate',
  'patronComments',
];

export const requestFilterTypes = {
  TAGS: 'tags',
  REQUEST_TYPE: 'requestType',
  REQUEST_STATUS: 'requestStatus',
  REQUEST_LEVELS: 'requestLevels',
  PICKUP_SERVICE_POINT: 'pickupServicePoints',
};

export const REQUEST_LEVEL_TYPES = {
  ITEM: 'Item',
  TITLE: 'Title',
};

export const requestTypeFilters = [
  { label: 'ui-requests.filters.requestType.holds', value: requestTypesMap.HOLD },
  { label: 'ui-requests.filters.requestType.pages', value: requestTypesMap.PAGE },
  { label: 'ui-requests.filters.requestType.recalls', value: requestTypesMap.RECALL },
];

export const requestStatusFilters = [
  { label: 'ui-requests.filters.requestStatus.cancelled', value: requestStatuses.CANCELLED },
  { label: 'ui-requests.filters.requestStatus.filled', value: requestStatuses.FILLED },
  { label: 'ui-requests.filters.requestStatus.pickupExpired', value: requestStatuses.PICKUP_EXPIRED },
  { label: 'ui-requests.filters.requestStatus.unfilled', value: requestStatuses.UNFILLED },
  { label: 'ui-requests.filters.requestStatus.awaitingDelivery', value: requestStatuses.AWAITING_DELIVERY },
  { label: 'ui-requests.filters.requestStatus.awaitingPickup', value: requestStatuses.AWAITING_PICKUP },
  { label: 'ui-requests.filters.requestStatus.inTransit', value: requestStatuses.IN_TRANSIT },
  { label: 'ui-requests.filters.requestStatus.notYetFilled', value: requestStatuses.NOT_YET_FILLED },
];

export const requestLevelFilters = [
  { label: 'ui-requests.filters.requestLevel.item', value: REQUEST_LEVEL_TYPES.ITEM },
  { label: 'ui-requests.filters.requestLevel.title', value: REQUEST_LEVEL_TYPES.TITLE },
];

export const pickSlipType = 'pick slip';

export const DOMAIN_NAME = 'requests';

export const APP_ICON_NAME = 'requests';

export const createModes = {
  DUPLICATE: 'duplicate',
};

export const REQUEST_LAYERS = {
  EDIT: 'edit',
  CREATE: 'create',
};

export const errorMessages = {
  REORDER_SYNC_ERROR: 'There is inconsistency between provided reordered queue and item queue.',
  DELETE_REQUEST_ERROR: 'The Request has already been closed',
};

export const errorMessageLabels = {
  [errorMessages.DELETE_REQUEST_ERROR]: 'ui-requests.errors.closingAlreadyClosedRequest',
};

export const errorCodes = {
  SYNC: 'sync',
  UNKNOWN: 'unknown',
};

export const REQUEST_DATE = 'Request Date';

export const REQUEST_TYPES = {
  [requestTypesMap.PAGE]:{
    id: requestTypeOptionMap[requestTypesMap.PAGE],
    value: requestTypesMap.PAGE,
  },
  [requestTypesMap.HOLD]: {
    id: requestTypeOptionMap[requestTypesMap.HOLD],
    value: requestTypesMap.HOLD,
  },
  [requestTypesMap.RECALL]: {
    id: requestTypeOptionMap[requestTypesMap.RECALL],
    value: requestTypesMap.RECALL,
  },
};

export const MISSING_VALUE_SYMBOL = '-';

export const DEFAULT_DISPLAYED_YEARS_AMOUNT = 3;

export const MAX_RECORDS = '10000';

export const INVALID_REQUEST_HARDCODED_ID = '00000000-0000-4000-8000-000000000000';

export const RESOURCE_TYPES = {
  ITEM: 'item',
  INSTANCE: 'instance',
  USER: 'user',
  HOLDING: 'holding',
  REQUEST_TYPES: 'requestTypes',
};

export const ENTER_EVENT_KEY = 'Enter';

export const RESOURCE_KEYS = {
  id: 'id',
  barcode: 'barcode',
};

export const REQUEST_FORM_FIELD_NAMES = {
  CREATE_TLR: 'createTitleLevelRequest',
  FULFILLMENT_PREFERENCE: 'fulfillmentPreference',
  DELIVERY_ADDRESS_TYPE_ID: 'deliveryAddressTypeId',
  REQUESTER_ID: 'requesterId',
  REQUESTER: 'requester',
  PROXY_USER_ID: 'proxyUserId',
  PICKUP_SERVICE_POINT_ID: 'pickupServicePointId',
  ITEM_ID: 'itemId',
  ITEM_BARCODE: 'item.barcode',
  REQUEST_TYPE: 'requestType',
  INSTANCE_ID: 'instanceId',
  INSTANCE_HRID: 'instance.hrid',
  REQUESTER_BARCODE: 'requester.barcode',
};

export const BASE_SPINNER_PROPS = {
  icon: 'spinner-ellipsis',
  width: '10px',
};

export const REQUEST_OPERATIONS = {
  CREATE: 'create',
  REPLACE: 'replace',
  MOVE: 'move',
};
