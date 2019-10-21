import {
  get,
  isObject,
  omit,
  cloneDeep,
  find,
} from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Headline, Row } from '@folio/stripes/components';

import {
  requestTypesByItemStatus,
  requestTypesMap,
  itemStatuses,
  fulfilmentTypeMap,
} from './constants';

import css from './requests.css';


// eslint-disable-next-line import/prefer-default-export
export function getFullName(user) {
  const userNameObj = user.personal || user;
  const lastName = get(userNameObj, ['lastName'], '');
  const firstName = get(userNameObj, ['firstName'], '');
  const middleName = get(userNameObj, ['middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

export function userHighlightBox(title, name, id, barcode) {
  const recordLink = name ? <Link to={`/users/view/${id}`}>{name}</Link> : '';
  const barcodeLink = barcode ? <Link to={`/users/view/${id}`}>{barcode}</Link> : '';

  return (
    <Row>
      <Col xs={12}>
        <div className={`${css.section} ${css.active}`}>
          <Headline size="medium" tag="h3">
            {title}
          </Headline>
          <div>
            {recordLink}
            {' '}
            Barcode:
            {' '}
            {barcodeLink}
          </div>
        </div>
      </Col>
    </Row>
  );
}

export function toUserAddress(addr) {
  return (
    <div>
      <div>{(addr && addr.addressLine1) || ''}</div>
      <div>{(addr && addr.addressLine2) || ''}</div>
      <div>{(addr && addr.city) || ''}</div>
      <div>{(addr && addr.region) || ''}</div>
      <div>{(addr && addr.postalCode) || ''}</div>
    </div>
  );
}

export function getPatronGroup(patron, patronGroups) {
  const group = get(patron, 'patronGroup');

  if (!group || !patronGroups.length) return undefined;

  const id = isObject(group) ? group.id : group;

  return patronGroups.find(g => (g.id === id));
}

export function duplicateRequest(request) {
  const itemStatus = get(request, 'item.status');
  const requestType = request.requestType;
  const requestTypes = requestTypesByItemStatus[itemStatus] || [];
  const clonedRequest = cloneDeep(request);

  // check if the current request type is valid if not pick a first available type
  clonedRequest.requestType = requestTypes.find(rt => rt === requestType) || requestTypes[0];

  return omit(clonedRequest, [
    'id',
    'metadata',
    'status',
    'requestCount',
    'position',
    'requester',
    'item',
    'pickupServicePoint',
  ]);
}

export function getRequestTypeOptions(item) {
  const itemStatus = get(item, 'status.name');
  const requestTypes = requestTypesByItemStatus[itemStatus] || [];

  return requestTypes.map(type => ({
    id: requestTypesMap[type],
    value: type,
  }));
}

export function isPagedItem(item) {
  return (get(item, 'status.name') === itemStatuses.PAGED);
}

export function getDeliveryAddressType(addressTypes, id) {
  return get(find(addressTypes, { id }), 'addressType', '');
}

export function isDelivery(request) {
  return get(request, 'fulfilmentPreference') === fulfilmentTypeMap.DELIVERY;
}
