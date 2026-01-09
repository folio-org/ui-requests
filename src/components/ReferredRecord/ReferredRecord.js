import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  FormattedDate,
  KeyValue,
} from '@folio/stripes/components';

import { computeUserDisplayForRequest } from '../../utils';

import css from './ReferredRecord.css';

const ReferredRecord = ({ values }) => {
  const {
    instanceId,
    instanceTitle,
    itemBarcode,
    itemId,
    holdingsRecordId,
    request,
    isEcsTlrSettingEnabled = false,
    requestCreateDate,
  } = values;

  const instanceLink = (
    <Link
      to={`/inventory/view/${instanceId}`}
      data-test-instance-link
    >
      {instanceTitle}
    </Link>
  );
  const itemLink = (
    <Link
      to={`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`}
      data-test-item-link
    >
      {itemBarcode}
    </Link>
  );
  const label = (
    <span className={css['referred-record__entity-type']}>
      <FormattedMessage id="ui-requests.notes.entityType.request" />
    </span>
  );

  const userDisplay = computeUserDisplayForRequest(request, isEcsTlrSettingEnabled);
  return (
    <KeyValue
      data-test-referred-record
      label={label}
    >
      <div>
        <FormattedMessage
          id="ui-requests.notes.assigned.for"
          values={{
            instanceLink,
            itemLink,
          }}
        />
      </div>
      <div>
        <FormattedMessage
          id="ui-requests.notes.assigned.requester"
          values={{ requesterName: userDisplay.requesterNameLink }}
        />
      </div>
      <div>
        <FormattedMessage
          id="ui-requests.notes.assigned.requestDate"
          values={{ requestCreateDate: <FormattedDate value={requestCreateDate} /> }}
        />
      </div>
    </KeyValue>
  );
};

ReferredRecord.propTypes = {
  values: PropTypes.shape({
    instanceId: PropTypes.string.isRequired,
    instanceTitle: PropTypes.string.isRequired,
    itemBarcode: PropTypes.string.isRequired,
    itemId: PropTypes.string.isRequired,
    holdingsRecordId: PropTypes.string.isRequired,
    requestCreateDate: PropTypes.string.isRequired,
    request: PropTypes.shape({
      requesterId: PropTypes.string.isRequired,
      proxyUserId: PropTypes.string,
    }).isRequired,
    isEcsTlrSettingEnabled: PropTypes.string,
  }).isRequired,
};

export default ReferredRecord;
