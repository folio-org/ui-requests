import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import {
  FormattedDate,
  KeyValue,
} from '@folio/stripes/components';

import { FullNameLink } from '../RequesterLinks';

import css from './ReferredRecord.css';

const ReferredRecord = ({ values }) => {
  const {
    instanceId,
    instanceTitle,
    itemBarcode,
    itemId,
    holdingsRecordId,
    requestCreateDate,
    request,
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
          values={{ requesterName: <FullNameLink userId={request?.requesterId} user={request?.requester} /> }}
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

const userShape = {
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  preferredFirstName: PropTypes.string,
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
      requesterId: PropTypes.string,
      requester: PropTypes.shape({
        id: PropTypes.string,
        barcode: PropTypes.string,
        personal: PropTypes.shape(userShape),
        ...userShape
      }),
    }),
  }).isRequired,
};

export default ReferredRecord;
