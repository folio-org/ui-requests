import {
  FormattedDate,
  FormattedMessage,
} from 'react-intl';

import { AppIcon } from '@folio/stripes/core';

import ItemLink from './components/ItemLink';
import { BarcodeLink } from '../components/RequesterLinks';
import { getFullName } from '../utils';
import {
  MISSING_VALUE_SYMBOL,
  requestStatusesTranslations,
  requestTypesTranslations,
} from '../constants';

export const COLUMN_MAP = {
  position: <FormattedMessage id="ui-requests.requestQueue.order" />,
  fulfillmentStatus: <FormattedMessage id="ui-requests.requestQueue.fulfillmentStatus" />,
  itemBarcode: <FormattedMessage id="ui-requests.requestQueue.itemBarcode" />,
  requestDate: <FormattedMessage id="ui-requests.requestQueue.requestDate" />,
  status: <FormattedMessage id="ui-requests.requestQueue.status" />,
  pickupDelivery: <FormattedMessage id="ui-requests.requestQueue.pickup" />,
  requester: <FormattedMessage id="ui-requests.requestQueue.requesterName" />,
  requesterBarcode: <FormattedMessage id="ui-requests.requestQueue.requesterBarcode" />,
  patronGroup: <FormattedMessage id="ui-requests.requestQueue.patronGroup" />,
  requestType: <FormattedMessage id="ui-requests.requestQueue.requestType" />,
  enumeration: <FormattedMessage id="ui-requests.requestQueue.enumeration" />,
  chronology: <FormattedMessage id="ui-requests.requestQueue.chronology" />,
  volume: <FormattedMessage id="ui-requests.requestQueue.volume" />,
  patronComments: <FormattedMessage id="ui-requests.requestQueue.patronComments" />,
};

export const COLUMN_WIDTHS = {
  fulfillmentStatus: { max: 125 },
  position: { max: 70 },
  itemBarcode: { max: 115 },
  requestDate: { max: 160 },
  status: { max: 180 },
  pickupDelivery: { max: 130 },
  requester: { max: 180 },
  requesterBarcode: { max: 150 },
  patronGroup: { max: 110 },
  requestType: { max: 70 },
  enumeration: { max: 110 },
  chronology: { max: 100 },
  volume: { max: 80 },
  patronComments: { max: 250 },
};

export const formatter = {
  fulfillmentStatus: () => <FormattedMessage id="ui-requests.requestQueue.requestInProgress" />,
  position: request => (<AppIcon size="small" app="requests">{request.position}</AppIcon>),
  itemBarcode: request => <ItemLink request={request} />,
  requestDate: request => <FormattedDate value={request.requestDate} day="numeric" month="numeric" year="numeric" hour="numeric" minute="numeric" />,
  status: request => <FormattedMessage id={requestStatusesTranslations[request.status]} />,
  pickupDelivery: request => request.pickupServicePoint?.name || (request.deliveryType ? <FormattedMessage id="ui-requests.requestQueue.deliveryType" values={{ type: request.deliveryType }} /> : MISSING_VALUE_SYMBOL),
  requester: (request) => getFullName(request.requester),
  requesterBarcode: request => <BarcodeLink request={request} />,
  patronGroup: request => request?.requester?.patronGroup?.group || MISSING_VALUE_SYMBOL,
  requestType: request => <FormattedMessage id={requestTypesTranslations[request.requestType]} />,
  enumeration: request => request.item?.enumeration || MISSING_VALUE_SYMBOL,
  chronology: request => request.item?.chronology || MISSING_VALUE_SYMBOL,
  volume: request => request.item?.volume || MISSING_VALUE_SYMBOL,
  patronComments: request => request.patronComments || MISSING_VALUE_SYMBOL,
};
