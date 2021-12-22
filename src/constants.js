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

export const fulfilmentTypes = [
  { id: 'Hold Shelf', label: 'ui-requests.requestMeta.fulfilment.holdShelf' },
  { id: 'Delivery', label: 'ui-requests.requestMeta.fulfilment.delivery' },
];

export const fulfilmentTypeMap = {
  DELIVERY: 'Delivery',
  HOLD_SHELF: 'Hold Shelf',
};

// map from API's enum-value to translation key
export const fulfilmentTypesTranslations = {
  'Delivery': 'ui-requests.requestMeta.fulfilment.delivery.',
  'Hold Shelf': 'ui-requests.requestMeta.fulfilment.holdShelf.',
};

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
};

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

export const requestTypesByItemStatus = {
  'Checked out': ['Hold', 'Recall'],
  'Available': ['Page'],
  'Awaiting pickup': ['Hold', 'Recall'],
  'Awaiting delivery': ['Hold', 'Recall'],
  'In transit': ['Hold', 'Recall'],
  'Missing': ['Hold'],
  'Paged': ['Hold', 'Recall'],
  'On order': ['Hold', 'Recall'],
  'In process': ['Hold', 'Recall'],
};

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
  'fulfilmentPreference',
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
  PICKUP_SERVICE_POINT: 'pickupServicePoints',
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

export const pickSlipType = 'pick slip';

export const DOMAIN_NAME = 'requests';

export const APP_ICON_NAME = 'requests';

export const createModes = {
  DUPLICATE: 'duplicate',
};

export const errorMessages = {
  REORDER_SYNC_ERROR: 'There is inconsistency between provided reordered queue and item queue.',
};

export const errorCodes = {
  SYNC: 'sync',
  UNKNOWN: 'unknown',
};

export const REQUEST_LEVEL_TYPES = {
  ITEM: 'Item',
  TITLE: 'Title',
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
