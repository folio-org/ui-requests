import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  isEmpty,
} from 'lodash';
import {
  FormattedMessage,
  FormattedDate,
} from 'react-intl';
import {
  PaneHeaderIconButton,
  Pane,
  PaneMenu,
  Paneset,
  Row,
  Col,
  KeyValue,
} from '@folio/stripes/components';

import { iconTypes } from '../constants';
import { getFullName } from '../utils';
import SortableList from '../components/SortableList';

import css from './RequestQueueView.css';

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
  pickupServicePoint: '8%',
  requester: '15%',
  requesterBarcode: '12%',
  patronGroup: '13%',
  requestDate: '8%',
  requestType: '5%',
  requestExpirationDate: '8%',
  holdShelfExpireDate: '13%',
};

const COLUMN_MAP = {
  position: <FormattedMessage id="ui-requests.requestQueue.position" />,
  status: <FormattedMessage id="ui-requests.requestQueue.requestStatus" />,
  pickupServicePoint: <FormattedMessage id="ui-requests.requestQueue.pickup" />,
  requester: <FormattedMessage id="ui-requests.requestQueue.requesterName" />,
  requesterBarcode: <FormattedMessage id="ui-requests.requestQueue.requesterBarcode" />,
  patronGroup: <FormattedMessage id="ui-requests.requestQueue.patronGroup" />,
  requestDate: <FormattedMessage id="ui-requests.requestQueue.requestDate" />,
  requestType: <FormattedMessage id="ui-requests.requestQueue.requestType" />,
  requestExpirationDate: <FormattedMessage id="ui-requests.requestQueue.requestExpirationDate" />,
  holdShelfExpireDate: <FormattedMessage id="ui-requests.requestQueue.holdShelfExpirationDate" />,
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

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class RequestQueueView extends React.Component {
  static propTypes = {
    data: PropTypes.shape({
      requests: PropTypes.arrayOf(PropTypes.object),
      item: PropTypes.object,
      request: PropTypes.object,
    }),
    onClose: PropTypes.func,
    isLoading: PropTypes.func,
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = {};

  static getDerivedStateFromProps(props, state) {
    const { data: { requests } } = props;

    if (isEmpty(state.requests)) {
      return { requests };
    }

    return null;
  }

  // TODO: connect to backend
  onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const data = this.state.requests;
    const requests = reorder(
      data,
      result.source.index,
      result.destination.index
    );

    this.setState({ requests });
  }

  render() {
    const {
      isLoading,
      onClose,
      data: {
        item,
        request,
      },
    } = this.props;

    const { requests } = this.state;
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
          <div className={css.section}>
            <Row>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.barcode" />}
                  value={get(item, 'barcode', '-')}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.dueDate" />}
                  value={get(request, 'loan.dueDate') ? <FormattedDate value={request.loan.dueDate} /> : '-'}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.location.name" />}
                  value={get(item, 'effectiveLocation.name', '-')}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.callNumber" />}
                  value={get(item, 'callNumber', '-')}
                />
              </Col>
              <Col xs={1}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.volume" />}
                  value="-"
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.enumeration" />}
                  value={get(item, 'enumeration', '-')}
                />
              </Col>
              <Col xs={1}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.copyNumber" />}
                  value={get(item, 'copyNumbers[0]', '-')}
                />
              </Col>
            </Row>
          </div>
          {!isLoading &&
            <SortableList
              id="requests-list"
              onDragEnd={this.onDragEnd}
              contentData={requests}
              visibleColumns={COLUMN_NAMES}
              columnMapping={COLUMN_MAP}
              columnWidths={COLUMN_WIDTHS}
              formatter={formatter}
              isEmptyMessage={<FormattedMessage id="ui-requests.requestQueue.requests.notFound" />}
            />
          }
        </Pane>
      </Paneset>
    );
  }
}

export default RequestQueueView;
