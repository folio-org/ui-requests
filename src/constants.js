import React from 'react';

export const requestTypes = [
  { id: 'Recall', label: 'Recall' },
  { id: 'Hold', label: 'Hold' },
  { id: 'Page', label: 'Page' },
];

export const fulfilmentTypes = [
  { id: 'Hold Shelf', label: 'Hold Shelf' },
  { id: 'Delivery', label: 'Delivery' },
];

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
