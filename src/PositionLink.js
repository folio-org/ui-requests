import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { openRequestStatusFilters } from './utils';
import {
  REQUEST_LEVEL_TYPES,
  REQUEST_DATE,
} from './constants';

export default function PositionLink({ request }) {
  const queuePosition = get(request, 'position');
  const id = request[request.requestLevel === REQUEST_LEVEL_TYPES.ITEM ? 'itemId' : 'instanceId'];
  const openRequestsPath = `/requests?filters=${openRequestStatusFilters}&query=${id}&sort=${REQUEST_DATE}`;

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
};
