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
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Headline,
  Row,
  NoValue,
} from '@folio/stripes/components';

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
  REQUEST_ERROR_MESSAGE_TRANSLATION_KEYS,
} from './constants';

import css from './requests.css';

export function getFullName(user) {
  const userNameObj = user?.personal || user;
  const lastName = get(userNameObj, ['lastName']) ?? '';
  const firstName = get(userNameObj, ['firstName']) ?? '';
  const middleName = get(userNameObj, ['middleName']) ?? '';
  const preferredFirstName = get(userNameObj, ['preferredFirstName']) ?? '';
  const displayedFirstName = preferredFirstName || firstName;

  return `${lastName}${displayedFirstName ? ', ' : ''}${displayedFirstName}${middleName ? ' ' : ''}${middleName}`;
}

export const createUserHighlightBoxLink = (linkText, id) => {
  return linkText ? <Link to={`/users/view/${id}`}>{linkText}</Link> : '';
};

export const isProxyFunctionalityAvailable = (isEcsTlrSettingEnabled) => {
  return !isEcsTlrSettingEnabled;
};

export function computeUserDisplayForRequest(request, isEcsTlrSettingEnabled) {
  const proxyUserId = request.proxy?.id ?? request.proxyUserId;
  const unknownProxy = (!!proxyUserId && !request.proxy);
  const nullProxy = (!proxyUserId && !request.proxy);
  if (!isProxyFunctionalityAvailable(isEcsTlrSettingEnabled) && !nullProxy) {
    throw new Error();
  }

  const requesterId = request.requester?.id ?? request.requesterId;
  const isAnonymized = !requesterId && !request.requester && nullProxy;
  if (isAnonymized) {
    return {
      requesterName: <FormattedMessage id="ui-requests.requestMeta.anonymized" />,
      requesterNameLink: <FormattedMessage id="ui-requests.requestMeta.anonymized" />,
      requesterBarcode: <NoValue />,
      requesterBarcodeLink: <NoValue />,
      proxy: null,
    };
  }

  const unknownRequester = (!!requesterId && !request.requester) || (!requesterId && !nullProxy);
  const requesterDisplay = {
    requesterName: unknownRequester
      ? <FormattedMessage id="ui-requests.errors.user.unknown" />
      : getFullName(request.requester),
    requesterNameLink: unknownRequester
      ? <FormattedMessage id="ui-requests.errors.user.unknown" />
      : createUserHighlightBoxLink(getFullName(request.requester), requesterId),
    requesterBarcode: unknownRequester
      ? <NoValue />
      : request.requester.barcode,
    requesterBarcodeLink: unknownRequester
      ? <NoValue />
      : createUserHighlightBoxLink(request.requester.barcode, requesterId),
  };

  if (nullProxy) {
    return {
      ...requesterDisplay,
      proxy: null
    };
  }

  return {
    ...requesterDisplay,
    proxy: {
      proxyName: unknownProxy
        ? <FormattedMessage id="ui-requests.errors.user.unknown" />
        : getFullName(request.proxy),
      proxyNameLink: unknownProxy
        ? <FormattedMessage id="ui-requests.errors.user.unknown" />
        : createUserHighlightBoxLink(getFullName(request.proxy), proxyUserId),
      proxyBarcode: unknownProxy
        ? <NoValue />
        : request.proxy.barcode,
      proxyBarcodeLink: unknownProxy
        ? <NoValue />
        : createUserHighlightBoxLink(request.proxy.barcode, proxyUserId),
    }
  };
}

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
            {recordLink || <FormattedMessage id="ui-requests.errors.user.unknown" />}
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

export const isVirtualPatron = (user) => user?.type === 'dcb';

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

export const getRequester = (proxy, selectedUser, isEcsTlrSettingEnabled) => {
  if (isProxyFunctionalityAvailable(isEcsTlrSettingEnabled) && proxy && proxy.id !== selectedUser?.id) {
    return proxy;
  }

  return selectedUser;
};
