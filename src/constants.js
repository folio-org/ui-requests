export const requestTypes = [
  { id: 'Recall', label: 'ui-requests.requestMeta.type.recall' },
  { id: 'Hold', label: 'ui-requests.requestMeta.type.hold' },
  { id: 'Page', label: 'ui-requests.requestMeta.type.page' },
];

export const fulfilmentTypes = [
  { id: 'Hold Shelf', label: 'ui-requests.requestMeta.fulfilment.holdShelf' },
  { id: 'Delivery', label: 'ui-requests.requestMeta.fulfilment.delivery' },
];

export const fulfilmentTypeMap = {
  DELIVERY: 'Delivery',
  HOLD_SHELF: 'Hold Shelf',
};

// used to perform queries with the backend
// not used for data display
export const requestStatuses = {
  CHECKED_OUT: 'Checked out',
  AWAITING_PICKUP: 'Open - Awaiting pickup',
  AWAITING_DELIVERY: 'Open - Awaiting delivery',
  IN_TRANSIT: 'Open - In transit',
  RECALL: 'Recall',
  HOLD: 'Hold',
  NOT_YET_FILLED: 'Open - Not yet filled',
  PICKUP_EXPIRED: 'Closed - Pickup expired',
  CANCELLED: 'Closed - Cancelled',
  FILLED: 'Closed - Filled',
  UNFILLED: 'Closed - Unfilled',
};

export const itemStatuses = {
  PAGED: 'Paged',
  DECLARED_LOST: 'Declared lost',
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
  'requestExpirationDate',
  'holdShelfExpirationDate',
  'position',
  'item.barcode',
  'item.title',
  'item.contributorNames',
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
];

export const expiredHoldsReportHeaders = [
  'requester.name',
  'requester.barcode',
  'item.title',
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
];

export const requestFilterTypes = {
  TAGS: 'tags',
  REQUEST_TYPE: 'requestType',
  REQUEST_STATUS: 'requestStatus'
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
