import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import { openRequestStatusFilters } from './utils';

export default function PositionLink({ request }) {
  const queuePosition = get(request, 'position');
  const barcode = get(request, 'item.barcode');

  const openRequestsPath = `/requests?filters=${openRequestStatusFilters}&query=${request.item.barcode}&sort=Request Date`;

  return (request && barcode ?
    <div>
      <span>
        {queuePosition}
        &nbsp;
        &nbsp;
      </span>
      <Link to={openRequestsPath}>
        <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
      </Link>
    </div> : '-'
  );
}

PositionLink.propTypes = {
  request: PropTypes.object,
};
