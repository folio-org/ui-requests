import React from 'react';

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
  IN_TRANSIT: 'Open - In transit',
  RECALL: 'Recall',
  HOLD: 'Hold',
};

export const toUserAddress = addr => (
  // const countryId = (addr.country) ? countriesByName[addr.country].alpha2 : '';
  <div>
    <div>{(addr && addr.addressLine1) || ''}</div>
    <div>{(addr && addr.addressLine2) || ''}</div>
    <div>{(addr && addr.city) || ''}</div>
    <div>{(addr && addr.region) || ''}</div>
    <div>{(addr && addr.postalCode) || ''}</div>
  </div>
);

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
  'Paged': ['Hold'],
};
