import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  requestStatuses,
  REQUEST_DATE,
} from './constants';

export default function PositionLink({
  request,
  isTlrEnabled,
}) {
  const queuePosition = get(request, 'position');
  const id = request[isTlrEnabled ? 'instanceId' : 'itemId'];
  const openRequestsPath = `/requests?filters=requestStatus.${requestStatuses.NOT_YET_FILLED}&query=${id}&sort=${REQUEST_DATE}`;

  return request
    ? (
      <div>
        <span>
          {queuePosition}
          &nbsp;
          &nbsp;
        </span>
        <Link to={openRequestsPath}>
          <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
        </Link>
      </div>
    )
    : '-';
}

PositionLink.propTypes = {
  request: PropTypes.object,
  isTlrEnabled: PropTypes.bool.isRequired,
};
