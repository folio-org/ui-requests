import {
  get,
  isObject,
  omit,
  cloneDeep,
} from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Headline, Row } from '@folio/stripes/components';

import {
  requestTypesByItemStatus,
  requestTypeOptionMap,
  itemStatuses,
  fulfilmentTypeMap,
  requestStatuses,
  requestTypesMap,
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
    id: requestTypeOptionMap[type],
    value: type,
  }));
}

export function isPagedItem(item) {
  return (get(item, 'status.name') === itemStatuses.PAGED);
}

export function isDelivery(request) {
  return get(request, 'fulfilmentPreference') === fulfilmentTypeMap.DELIVERY;
}

export function isNotYetFilled(request) {
  return request.status === requestStatuses.NOT_YET_FILLED;
}

export function isPageRequest(request) {
  return requestTypesMap.PAGE === request.requestType;
}

export const openRequestStatusFilters = [
  requestStatuses.NOT_YET_FILLED,
  requestStatuses.AWAITING_PICKUP,
  requestStatuses.AWAITING_DELIVERY,
  requestStatuses.IN_TRANSIT,
]
  .map(status => `requestStatus.${status}`)
  .join(',');

export function buildTemplate(str = '') {
  return o => {
    return str.replace(/{{([^{}]*)}}/g, (a, b) => {
      const r = o[b];
      return typeof r === 'string' || typeof r === 'number' ? r : '';
    });
  };
}

export const convertToSlipData = (requests = []) => {
  return requests.map(request => {
    const {
      item = {},
      requester = {},
    } = request;

    return {
      'staffSlip.Name': 'Pick slip',
      'requester.firstName': requester.firstName,
      'requester.lastName': requester.lastName,
      'requester.middleName': requester.middleName,
      'requester.barcode': `<Barcode>${requester.barcode}</Barcode>`,
      // 'requester.addressLine1': requester.addressLine1,
      // 'requester.addressLine2': requester.addressLine2,
      // 'requester.city': requester.city,
      // 'requester.stateProvRegion': requester.region,
      // 'requester.zipPostalCode': requester.postalCode,
      'item.title': item.title,
      'item.barcode': `<Barcode>${item.barcode}</Barcode>`,
      'item.callNumber': item.callNumber,
      'item.enumeration': item.enumeration,
      'item.allContributors': item.contributorNames.map(({ name }) => name).join(';'),
      'item.copy': item.copyNumbers.join(';'),
      // 'item.primaryContributor': item.primaryContributor,
      // 'item.callNumberPrefix': item.callNumberPrefix,
      // 'item.callNumberSuffix': item.callNumberSuffix,
      // 'item.volume': item.volume,
      // 'item.chronology': item.chronology,
      /* 'item.yearCaption': item.yearCaption,
      'item.materialType': item.materialType,
      'item.loanType': item.loanType,
      'item.numberOfPieces': item.numberOfPieces,
      'item.descriptionOfPieces': item.descriptionOfPieces,
      'item.lastCheckedInDateTime': item.lastCheckedInDateTime,
      'item.fromServicePoint': item.fromServicePoint,
      'item.toServicePoint': item.toServicePoint,
      'item.effectiveLocationInstitution': item.effectiveLocationInstitution,
      'item.effectiveLocationCampus': item.effectiveLocationCampus,
      'item.effectiveLocationLibrary': item.effectiveLocationLibrary,
      'item.effectiveLocationSpecific': item.effectiveLocationSpecific, */
      'request.servicePointPickup': request.pickupServicePoint.name,
      /* 'request.deliveryAddressType': request.deliveryAddressType,
      'request.requestExpirationDate': request.requestExpirationDate
        ? intl.formatDate(request.requestExpirationDate, { timeZone, locale })
        : request.requestExpirationDate,
      'request.holdShelfExpirationDate': request.holdShelfExpirationDate
        ? intl.formatDate(request.holdShelfExpirationDate, { timeZone, locale })
        : request.holdShelfExpirationDate, */
      'request.requestID': request.id
    };
  });
};
