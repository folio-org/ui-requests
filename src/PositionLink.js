import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

export default function PositionLink({ request }) {
  const queuePosition = get(request, 'position');
  return (request ?
    <div>
      <span>
        {queuePosition}
        &nbsp;
        &nbsp;
      </span>
      <Link to={`/requests?filters=requestStatus.Open%20-%20Awaiting%20pickup%2CrequestStatus.Open%20-%20In%20transit%2CrequestStatus.Open%20-%20Not%20yet%20filled&query=${request.item.barcode}&sort=Request%20Date`}>
        <FormattedMessage id="ui-requests.actions.viewRequestsInQueue" />
      </Link>
    </div> : '-'
  );
}

PositionLink.propTypes = {
  request: PropTypes.object,
};
