import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { useIntl } from 'react-intl';

import { NoValue } from '@folio/stripes-components';

import { openRequestStatusFilters } from './utils';

import {
  requestOpenStatuses,
  REQUEST_DATE,
} from './constants';

export default function PositionLink({
  request,
  isTlrEnabled,
}) {
  const { formatMessage } = useIntl();
  const queuePosition = get(request, 'position');
  const id = request[isTlrEnabled ? 'instanceId' : 'itemId'];
  const openRequestsPath = `/requests?filters=${openRequestStatusFilters}&query=${id}&sort=${REQUEST_DATE}`;

  return requestOpenStatuses.includes(request.status)
    ? (
      <div>
        <span>
          {`${queuePosition} (${formatMessage({ id: 'ui-requests.requests' }, { number: request.numberOfReorderableRequests })})`}
          &nbsp;
        </span>
        <Link to={openRequestsPath}>
          {formatMessage({ id: 'ui-requests.actions.viewRequestsInQueue' })}
        </Link>
      </div>
    )
    : <NoValue />;
}

PositionLink.propTypes = {
  request: PropTypes.object,
  isTlrEnabled: PropTypes.bool.isRequired,
};
