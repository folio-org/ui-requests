export const requestTypes = [
  { id: 'Recall', label: 'ui-requests.requestMeta.type.recall' },
  { id: 'Hold', label: 'ui-requests.requestMeta.type.hold' },
  { id: 'Page', label: 'ui-requests.requestMeta.type.page' },
];

export const fulfilmentTypes = [
  { id: 'Hold Shelf', label: 'ui-requests.requestMeta.fulfilment.holdShelf' },
  { id: 'Delivery', label: 'ui-requests.requestMeta.fulfilment.delivery' },
];

// used to perform queries with the backend
// not used for data display
export const requestStatuses = {
  CHECKED_OUT: 'Checked out',
  AWAITING_PICKUP: 'Open - Awaiting pickup',
  RECALL: 'Recall',
  HOLD: 'Hold',
};

export const iconTypes = {
  times: 'times',
  timesCircle: 'times-circle',
  trash: 'trash',
};

export const requestTypesMap = {
  'Recall': 'ui-requests.requestMeta.type.recall',
  'Hold': 'ui-requests.requestMeta.type.hold',
  'Page': 'ui-requests.requestMeta.type.page',
};

export const requestTypesByItemStatus = {
  'Checked out': ['Hold', 'Recall'],
  'Available': ['Page'],
  'Awaiting pickup': ['Hold', 'Recall'],
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
  'item.copyNumbers',
  'item.contributorNames',
  'item.location.libraryName',
  'item.location.name',
  'item.callNumber',
  'item.enumeration',
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
  'item.callNumber',
  'status',
  'holdShelfExpirationDate',
];
