import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  orderBy,
} from 'lodash';
import {
  FormattedMessage,
  FormattedTime,
  FormattedDate,
} from 'react-intl';
import {
  PaneHeaderIconButton,
  MultiColumnList,
  Pane,
  PaneMenu,
  Paneset,
} from '@folio/stripes/components';

import { iconTypes } from '../constants';
import { getFullName } from '../utils';

const COLUMN_NAMES = [
  'position',
  'status',
  'pickupServicePoint',
  'requester',
  'requesterBarcode',
  'patronGroup',
  'requestDate',
  'requestType',
  'requestExpirationDate',
  'holdShelfExpireDate',
];

const COLUMN_WIDTHS = {
  position: '5%',
  status: '12%',
  pickupServicePoint: '12%',
  requester: '12%',
  requesterBarcode: '12%',
  patronGroup: '12%',
  requestDate: '8%',
  requestType: '10%',
  requestExpirationDate: '8%',
  holdShelfExpireDate: '8%',
};

const COLUMN_MAP = {
  position: <FormattedMessage id="ui-requests.position" />,
  status: <FormattedMessage id="ui-requests.status" />,
  pickupServicePoint: <FormattedMessage id="ui-requests.pickup" />,
  requester: <FormattedMessage id="ui-requests.requester.name" />,
  requesterBarcode: <FormattedMessage id="ui-requests.requests.requesterBarcode" />,
  patronGroup: <FormattedMessage id="ui-requests.requester.patronGroup.group" />,
  requestDate: <FormattedMessage id="ui-requests.requests.requestDate" />,
  requestType: <FormattedMessage id="ui-requests.requestType" />,
  requestExpirationDate: <FormattedMessage id="ui-requests.requestExpirationDate" />,
  holdShelfExpireDate: <FormattedMessage id="ui-requests.holdShelfExpirationDate" />,
};

const formatter = {
  pickupServicePoint: request => get(request, 'pickupServicePoint.name', '-'),
  requester: request => getFullName(request.requester),
  requesterBarcode: request => get(request, 'requester.barcode', '-'),
  patronGroup: request => get(request, 'requester.patronGroup.desc', '-'),
  requestDate: request => (<FormattedDate value={request.requestDate} />),
  requestExpirationDate: request => (request.requestExpirationDate ? <FormattedDate value={request.requestExpirationDate} /> : '-'),
  holdShelfExpireDate: request => (request.holdShelfExpirationDate ? <FormattedDate value={request.holdShelfExpirationDate} /> : '-'),
};

class RequestQueueView extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      requests: PropTypes.arrayOf(PropTypes.object),
      item: PropTypes.object,
    }),
    onClose: PropTypes.func,
    isLoading: PropTypes.func,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  render() {
    const {
      isLoading,
      onClose,
      data: { item, requests },
    } = this.props;

    const contentData = orderBy(requests, 'position');
    const count = requests.length;
    const title = item.title;

    return (
      <Paneset isRoot>
        <Pane
          defaultWidth="100%"
          height="100%"
          firstMenu={
            <PaneMenu>
              <FormattedMessage id="ui-requests.actions.closeNewRequest">
                {label => (
                  <PaneHeaderIconButton
                    onClick={onClose}
                    ariaLabel={label}
                    icon={iconTypes.times}
                  />
                )}
              </FormattedMessage>
            </PaneMenu>
          }
          paneTitle={<FormattedMessage id="ui-requests.requestQueue.title" values={{ title }} />}
          paneSub={<FormattedMessage id="ui-requests.resultCount" values={{ count }} />}
        >
          <MultiColumnList
            id="instance-items-list"
            interactive={false}
            loading={isLoading}
            contentData={contentData}
            visibleColumns={COLUMN_NAMES}
            columnMapping={COLUMN_MAP}
            columnWidths={COLUMN_WIDTHS}
            formatter={formatter}
            isEmptyMessage={<FormattedMessage id="ui-requests.requestQueue.requests.notFound" />}
          />
        </Pane>
      </Paneset>
    );
  }
}

export default RequestQueueView;
