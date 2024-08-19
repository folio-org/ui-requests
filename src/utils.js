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
  size,
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
import { checkIfUserInCentralTenant } from '@folio/stripes/core';

import {
  requestTypeOptionMap,
  fulfillmentTypeMap,
  requestStatuses,
  requestTypesMap,
  REQUEST_LEVEL_TYPES,
  createModes,
  INVALID_REQUEST_HARDCODED_ID,
  DCB_INSTANCE_ID,
  DCB_HOLDINGS_RECORD_ID,
  DCB_USER,
  SLIPS_TYPE,
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
  CENTRAL_TENANT_URLS,
  SINGLE_TENANT_URLS,
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
  const clonedRequest = cloneDeep(request);

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

export function getRequestTypeOptions(requestTypes) {
  return requestTypes.map(requestType => ({
    id: requestTypeOptionMap[requestType],
    value: requestType,
  }));
}

export function isDelivery(request) {
  return request?.fulfillmentPreference === fulfillmentTypeMap.DELIVERY;
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

export function getSelectedSlipData(pickSlipsData, selectedRequestId) {
  const sel = pickSlipsData.filter((pickSlip) => {
    return pickSlip['request.requestID'] === selectedRequestId;
  })[0];

  if (sel === undefined) {
    return [];
  } else {
    return [sel].flat();
  }
}

export function getSelectedSlipDataMulti(pickSlipsData, selectedRows) {
  const sel = pickSlipsData.filter((pickSlip) => {
    return Object.keys(selectedRows).includes(pickSlip['request.requestID']);
  });

  return [sel].flat();
}

export function selectedRowsNonPrintable(pickSlipsData, selectedRows) {
  if (!size(selectedRows)) {
    return true;
  }

  const sel = pickSlipsData.filter((pickSlip) => {
    return Object.keys(selectedRows).includes(pickSlip['request.requestID']);
  });

  return sel.length === 0;
}

export function isPrintable(requestId, pickSlips) {
  let matched = false;

  if (pickSlips !== undefined) {
    matched = pickSlips.filter((pickSlip) => {
      return pickSlip.request.requestID === requestId;
    })[0];
  }

  return Boolean(matched);
}

export const getNextSelectedRowsState = (selectedRows, row) => {
  const { id } = row;
  const isRowSelected = Boolean(selectedRows[id]);
  const newSelectedRows = { ...selectedRows };

  if (isRowSelected) {
    delete newSelectedRows[id];
  } else {
    newSelectedRows[id] = row;
  }

  return newSelectedRows;
};

export const convertToSlipData = (source, intl, timeZone, locale, slipName = SLIPS_TYPE.PICK_SLIP, user = {}) => {
  return source.map(pickSlip => {
    const {
      item = {},
      request = {},
      requester = {},
      currentDateTime = null,
    } = pickSlip;

    const { username } = user;

    return {
      'staffSlip.Name': slipName,
      'staffSlip.currentDateTime': buildLocaleDateAndTime(currentDateTime, timeZone, locale),
      'staffSlip.staffUsername': username,
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
      'requester.departments': requester.departments,
      'item.title': item.title,
      'item.primaryContributor': item.primaryContributor,
      'item.allContributors': item.allContributors,
      'item.barcode': item.barcode,
      'item.barcodeImage': `<Barcode>${item.barcode}</Barcode>`,
      'item.callNumber': item.callNumber,
      'item.callNumberPrefix': item.callNumberPrefix,
      'item.callNumberSuffix': item.callNumberSuffix,
      'item.displaySummary': item.displaySummary,
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
      'item.effectiveLocationPrimaryServicePointName': item.effectiveLocationPrimaryServicePointName,
      'request.servicePointPickup': request.servicePointPickup,
      'request.deliveryAddressType': request.deliveryAddressType,
      'request.requestExpirationDate': request.requestExpirationDate
        ? intl.formatDate(request.requestExpirationDate, { timeZone, locale })
        : request.requestExpirationDate,
      'request.requestDate': request.requestDate
        ? intl.formatDate(request.requestDate, { timeZone, locale, year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
        : request.requestDate,
      'request.holdShelfExpirationDate': request.holdShelfExpirationDate
        ? intl.formatDate(request.holdShelfExpirationDate, { timeZone, locale })
        : request.holdShelfExpirationDate,
      'request.requestID': request.requestID,
      'request.patronComments': request.patronComments,
      'request.barcodeImage': `<Barcode>${request.requestID}</Barcode>`,
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

export const getTlrSettings = (settings) => settings || {};

export const getRequestLevelValue = (value) => {
  return value
    ? REQUEST_LEVEL_TYPES.TITLE
    : REQUEST_LEVEL_TYPES.ITEM;
};

export const getInstanceQueryString = (hrid, id) => `("hrid"=="${hrid}" or "id"=="${id || hrid}")`;

export const generateUserName = (user) => {
  if (user) {
    const {
      firstName,
      lastName,
      middleName,
    } = user;

    const shownMiddleName = middleName ? ` ${middleName}` : '';

    return `${lastName}${firstName ? ', ' + firstName + shownMiddleName : ''}`;
  }

  return '';
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

/*
  DCB Transactions (where FOLIO plays a) borrowing role work with virtual items,
  whose instance and holding record id are hard coded
*/
export const isVirtualItem = (
  instanceId,
  holdingsRecordId,
) => {
  return instanceId === DCB_INSTANCE_ID && holdingsRecordId === DCB_HOLDINGS_RECORD_ID;
};


/*
  DCB Transactions (where FOLIO plays a) lending role work with virtual patons,
  whose lastname is hard coded to "DcbSystem"
*/
export const isVirtualPatron = (lastName) => lastName === DCB_USER.lastName;

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

export const getFulfillmentTypeOptions = (hasDelivery, fulfillmentTypes) => {
  const sortedFulfillmentTypes = sortBy(fulfillmentTypes, ['label']);
  const fulfillmentTypeOptions = sortedFulfillmentTypes.map(({ label, id }) => ({
    labelTranslationPath: label,
    value: id,
  }));

  return hasDelivery
    ? fulfillmentTypeOptions
    : fulfillmentTypeOptions.filter(option => option.value !== fulfillmentTypeMap.DELIVERY);
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
    return get(initialValues, 'fulfillmentPreference');
  } else {
    return get(preferences, 'fulfillment', fulfillmentTypeMap.HOLD_SHELF);
  }
};

export const isDeliverySelected = (fulfillmentPreference) => {
  return fulfillmentPreference === fulfillmentTypeMap.DELIVERY;
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

export const getRequestErrorMessage = (error, intl) => {
  const {
    code = '',
    message = '',
  } = error;

  return code && REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS[code]
    ? intl.formatMessage({ id: REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS[code] })
    : message;
};

export function resetFieldState(form, fieldName) {
  const registeredFields = form.getRegisteredFields();

  if (includes(registeredFields, fieldName)) {
    form.resetFieldState(fieldName);
  }
}

export const isMultiDataTenant = (stripes) => {
  return stripes.hasInterface('consortia') && stripes.hasInterface('ecs-tlr');
};

export const getRequestUrl = (actionName, stripes) => {
  const isMultiTenant = isMultiDataTenant(stripes);
  const isUserInCentralTenant = checkIfUserInCentralTenant(stripes);

  if (isMultiTenant && isUserInCentralTenant) {
    return CENTRAL_TENANT_URLS[actionName];
  }

  return SINGLE_TENANT_URLS[actionName];
};
