import {
  escape,
  get,
  includes,
  isEmpty,
  isObject,
  omit,
  cloneDeep,
  pickBy,
  identity,
  sortBy,
} from 'lodash';
import queryString from 'query-string';
import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment-timezone';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Headline,
  Row,
  NoValue,
} from '@folio/stripes/components';

import {
  requestTypesByItemStatus,
  requestTypeOptionMap,
  itemStatuses,
  fulfilmentTypeMap,
  requestStatuses,
  requestTypesMap,
  REQUEST_LEVEL_TYPES,
  REQUEST_TYPES,
  createModes,
  INVALID_REQUEST_HARDCODED_ID,
} from './constants';

import css from './requests.css';

// eslint-disable-next-line import/prefer-default-export
export function getFullName(user) {
  const userNameObj = user?.personal || user;
  const lastName = get(userNameObj, ['lastName'], '');
  const firstName = get(userNameObj, ['firstName'], '');
  const middleName = get(userNameObj, ['middleName'], '');
  const preferredFirstName = get(userNameObj, ['preferredFirstName'], '');
  const displayedFirstName = preferredFirstName || firstName;

  return `${lastName}${displayedFirstName ? ', ' : ' '}${displayedFirstName} ${middleName}`;
}

export const createUserHighlightBoxLink = (linkText, id) => {
  return linkText ? <Link to={`/users/view/${id}`}>{linkText}</Link> : '';
};

export function userHighlightBox(title, name, id, barcode) {
  const recordLink = createUserHighlightBoxLink(name, id);
  const barcodeLink = createUserHighlightBoxLink(barcode, id);

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
            <FormattedMessage id="ui-requests.barcode" />:
            {' '}
            {barcode ? barcodeLink : <NoValue />}
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
    'cancellationAdditionalInformation',
    'cancellationReasonId',
    'cancelledByUserId',
    'cancelledDate',
    'holdShelfExpirationDate',
    'id',
    'metadata',
    'position',
    'proxy',
    'proxyUserId',
    'requestCount',
    'requester',
    'requesterId',
    'status',
  ]);
}

export function getRequestTypeOptions(item) {
  const itemStatus = item?.status?.name;
  const requestTypes = requestTypesByItemStatus[itemStatus] || [];

  return requestTypes.map(type => ({
    id: requestTypeOptionMap[type],
    value: type,
  }));
}

export function isPagedItem(item) {
  return item?.status?.name === itemStatuses.PAGED;
}

export function hasNonRequestableStatus(item) {
  return includes([
    itemStatuses.AGED_TO_LOST,
    itemStatuses.CLAIMED_RETURNED,
    itemStatuses.DECLARED_LOST,
    itemStatuses.INTELLECTUAL_ITEM,
    itemStatuses.IN_PROCESS_NON_REQUESTABLE,
    itemStatuses.LONG_MISSING,
    itemStatuses.LOST_AND_PAID,
    itemStatuses.UNAVAILABLE,
    itemStatuses.UNKNOWN,
    itemStatuses.WITHDRAWN,
  ], item?.status?.name);
}

export function isDelivery(request) {
  return request?.fulfilmentPreference === fulfilmentTypeMap.DELIVERY;
}

export function isNotYetFilled(request) {
  return request.status === requestStatuses.NOT_YET_FILLED;
}

export function isPageRequest(request) {
  return requestTypesMap.PAGE === request.requestType;
}

export function isDuplicateMode(mode) {
  return mode === createModes.DUPLICATE;
}

export const openRequestStatusFilters = [
  requestStatuses.NOT_YET_FILLED,
  requestStatuses.AWAITING_PICKUP,
  requestStatuses.AWAITING_DELIVERY,
  requestStatuses.IN_TRANSIT,
]
  .map(status => `requestStatus.${status}`)
  .join(',');


export const escapeValue = (val) => {
  if (typeof val === 'string' && val.startsWith('<Barcode>') && val.endsWith('</Barcode>')) {
    return val;
  }

  return escape(val);
};

export function buildTemplate(template = '') {
  return dataSource => {
    return template.replace(/{{([^{}]*)}}/g, (token, tokenName) => {
      const tokenValue = dataSource[tokenName];
      return typeof tokenValue === 'string' || typeof tokenValue === 'number' ? escapeValue(tokenValue) : '';
    });
  };
}

export function buildLocaleDateAndTime(dateTime, timezone, locale) {
  return moment(dateTime)
    .tz(timezone)
    .locale(locale)
    .format('L LT');
}

export const convertToSlipData = (source, intl, timeZone, locale, slipName = 'Pick slip') => {
  return source.map(pickSlip => {
    const {
      item = {},
      request = {},
      requester = {},
    } = pickSlip;

    return {
      'staffSlip.Name': slipName,
      'requester.firstName': requester.firstName,
      'requester.lastName': requester.lastName,
      'requester.middleName': requester.middleName,
      'requester.preferredFirstName': requester.preferredFirstName || requester.firstName,
      'requester.patronGroup': requester.patronGroup,
      'requester.addressLine1': requester.addressLine1,
      'requester.addressLine2': requester.addressLine2,
      'requester.country': requester.countryId
        ? intl.formatMessage({ id: `stripes-components.countries.${requester.countryId}` })
        : requester.countryId,
      'requester.city': requester.city,
      'requester.stateProvRegion': requester.region,
      'requester.zipPostalCode': requester.postalCode,
      'requester.barcode': requester.barcode,
      'requester.barcodeImage': `<Barcode>${requester.barcode}</Barcode>`,
      'item.title': item.title,
      'item.primaryContributor': item.primaryContributor,
      'item.allContributors': item.allContributors,
      'item.barcode': item.barcode,
      'item.barcodeImage': `<Barcode>${item.barcode}</Barcode>`,
      'item.callNumber': item.callNumber,
      'item.callNumberPrefix': item.callNumberPrefix,
      'item.callNumberSuffix': item.callNumberSuffix,
      'item.enumeration': item.enumeration,
      'item.volume': item.volume,
      'item.chronology': item.chronology,
      'item.copy': item.copy,
      'item.yearCaption': item.yearCaption,
      'item.materialType': item.materialType,
      'item.loanType': item.loanType,
      'item.numberOfPieces': item.numberOfPieces,
      'item.descriptionOfPieces': item.descriptionOfPieces,
      'item.lastCheckedInDateTime': item.lastCheckedInDateTime
        ? buildLocaleDateAndTime(item.lastCheckedInDateTime, timeZone, locale)
        : item.lastCheckedInDateTime,
      'item.fromServicePoint': item.fromServicePoint,
      'item.toServicePoint': item.toServicePoint,
      'item.effectiveLocationInstitution': item.effectiveLocationInstitution,
      'item.effectiveLocationCampus': item.effectiveLocationCampus,
      'item.effectiveLocationLibrary': item.effectiveLocationLibrary,
      'item.effectiveLocationSpecific': item.effectiveLocationSpecific,
      'request.servicePointPickup': request.servicePointPickup,
      'request.deliveryAddressType': request.deliveryAddressType,
      'request.requestExpirationDate': request.requestExpirationDate
        ? intl.formatDate(request.requestExpirationDate, { timeZone, locale })
        : request.requestExpirationDate,
      'request.holdShelfExpirationDate': request.holdShelfExpirationDate
        ? intl.formatDate(request.holdShelfExpirationDate, { timeZone, locale })
        : request.holdShelfExpirationDate,
      'request.requestID': request.requestID,
      'request.patronComments': request.patronComments,
    };
  });
};

export function buildUrl(location, values) {
  const url = values._path || location.pathname;
  const locationQuery = location.query ? location.query : queryString.parse(location.search);
  const params = pickBy(omit({ ...locationQuery, ...values }, '_path'), identity);

  return isEmpty(params) ? url : `${url}?${queryString.stringify(params)}`;
}

export function formatNoteReferrerEntityData(data) {
  if (!data) {
    return false;
  }

  const {
    entityName: name,
    entityType: type,
    entityId: id,
  } = data;

  return {
    name,
    type,
    id,
  };
}

export function parseErrorMessage(errorMessage) {
  return errorMessage
    .split(';')
    .map((error, index) => (
      <p
        data-test-error-text
        key={`error-${index}`}
      >
        {error}
      </p>
    ));
}

export const getTlrSettings = (settings) => {
  try {
    return JSON.parse(settings);
  } catch (error) {
    return {};
  }
};

export const getRequestLevelValue = (value) => {
  return value
    ? REQUEST_LEVEL_TYPES.TITLE
    : REQUEST_LEVEL_TYPES.ITEM;
};

export const getInstanceRequestTypeOptions = () => {
  return [
    REQUEST_TYPES[requestTypesMap.PAGE],
    REQUEST_TYPES[requestTypesMap.HOLD],
    REQUEST_TYPES[requestTypesMap.RECALL],
  ];
};

export const getInstanceQueryString = (hrid, id) => `("hrid"=="${hrid}" or "id"=="${id || hrid}")`;

export const generateUserName = (user) => {
  const {
    firstName,
    lastName,
    middleName,
  } = user;

  const shownMiddleName = middleName ? ` ${middleName}` : '';

  return `${lastName}${firstName ? ', ' + firstName + shownMiddleName : ''}`;
};

export const handleKeyCommand = (handler, { disabled } = {}) => {
  return (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!disabled) {
      handler();
    }
  };
};

export const isValidRequest = ({
  instanceId,
  holdingsRecordId,
}) => instanceId !== INVALID_REQUEST_HARDCODED_ID && holdingsRecordId !== INVALID_REQUEST_HARDCODED_ID;

export const memoizeValidation = (fn) => {
  const lastArgs = {};
  const lastKeys = {};
  const lastResults = {};

  return (fieldName, key) => arg => {
    const lastArg = lastArgs[fieldName];
    const lastKey = lastKeys[fieldName];

    if (
      arg !== lastArg ||
      (key !== lastKey && arg === lastArg)
    ) {
      lastArgs[fieldName] = arg;
      lastKeys[fieldName] = key;
      lastResults[fieldName] = fn(arg);
    }

    return lastResults[fieldName];
  };
};

export const getFulfillmentTypeOptions = (hasDelivery, fulfilmentTypes) => {
  const sortedFulfilmentTypes = sortBy(fulfilmentTypes, ['label']);
  const fulfilmentTypeOptions = sortedFulfilmentTypes.map(({ label, id }) => ({
    labelTranslationPath: label,
    value: id,
  }));

  return hasDelivery
    ? fulfilmentTypeOptions
    : fulfilmentTypeOptions.filter(option => option.value !== fulfilmentTypeMap.DELIVERY);
};

export const getDefaultRequestPreferences = (request, initialValues) => {
  return {
    hasDelivery: false,
    requestPreferencesLoaded: false,
    defaultDeliveryAddressTypeId: '',
    defaultServicePointId: request?.pickupServicePointId || '',
    deliverySelected: isDelivery(initialValues),
    selectedAddressTypeId: initialValues.deliveryAddressTypeId || '',
  };
};

export const getFulfillmentPreference = (preferences, initialValues) => {
  const requesterId = get(initialValues, 'requesterId');
  const userId = get(preferences, 'userId');

  if (requesterId === userId) {
    return get(initialValues, 'fulfilmentPreference');
  } else {
    return get(preferences, 'fulfillment', fulfilmentTypeMap.HOLD_SHELF);
  }
};

export const isDeliverySelected = (fulfillmentPreference) => {
  return fulfillmentPreference === fulfilmentTypeMap.DELIVERY;
};

export const getSelectedAddressTypeId = (deliverySelected, defaultDeliveryAddressTypeId) => {
  return deliverySelected ? defaultDeliveryAddressTypeId : '';
};

export const getProxy = (request, proxy) => {
  const userProxy = request ? request.proxy : proxy;
  if (!userProxy) return null;

  const id = proxy?.id || request?.proxyUserId;
  return {
    ...userProxy,
    id,
  };
};

export const isSubmittingButtonDisabled = (pristine, submitting) => {
  return pristine || submitting;
};

export const isFormEditing = (request) => {
  return !!get(request, 'id');
};
