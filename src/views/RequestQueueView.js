import React from 'react';
import PropTypes from 'prop-types';
import {
  get,
  isEqual,
} from 'lodash';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
} from 'react-intl';
import {
  PaneHeaderIconButton,
  Pane,
  PaneMenu,
  Paneset,
  Row,
  Col,
  KeyValue,
  Callout,
} from '@folio/stripes/components';
import { AppIcon } from '@folio/stripes/core';

import { iconTypes } from '../constants';
import {
  getFullName,
  isNotYetFilled,
  isPageRequest,
} from '../utils';
import SortableList from '../components/SortableList';

import css from './RequestQueueView.css';

const COLUMN_NAMES = [
  'position',
  'status',
  'pickup',
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
  status: '11%',
  pickup: '9%',
  requester: '15%',
  requesterBarcode: '12%',
  patronGroup: '13%',
  requestDate: '11%',
  requestType: '5%',
  requestExpirationDate: '8%',
  holdShelfExpireDate: '13%',
};

const COLUMN_MAP = {
  position: <FormattedMessage id="ui-requests.requestQueue.position" />,
  status: <FormattedMessage id="ui-requests.requestQueue.requestStatus" />,
  pickup: <FormattedMessage id="ui-requests.requestQueue.pickup" />,
  requester: <FormattedMessage id="ui-requests.requestQueue.requesterName" />,
  requesterBarcode: <FormattedMessage id="ui-requests.requestQueue.requesterBarcode" />,
  patronGroup: <FormattedMessage id="ui-requests.requestQueue.patronGroup" />,
  requestDate: <FormattedMessage id="ui-requests.requestQueue.requestDate" />,
  requestType: <FormattedMessage id="ui-requests.requestQueue.requestType" />,
  requestExpirationDate: <FormattedMessage id="ui-requests.requestQueue.requestExpirationDate" />,
  holdShelfExpireDate: <FormattedMessage id="ui-requests.requestQueue.holdShelfExpirationDate" />,
};

const formatter = {
  position: r => (<AppIcon size="small" app="requests">{r.position}</AppIcon>),
  pickup: r => get(r, 'pickupServicePoint.name') ||
    ((r.deliveryType) ? <FormattedMessage id="ui-requests.requestQueue.deliveryType" values={{ type: r.deliveryType }} /> : '-'),
  requester: r => getFullName(r.requester),
  requesterBarcode: r => get(r, 'requester.barcode', '-'),
  patronGroup: r => get(r, 'requester.patronGroup.desc', '-'),
  requestDate: r => (<FormattedTime value={r.requestDate} day="numeric" month="numeric" year="numeric" />),
  requestExpirationDate: r => (r.requestExpirationDate ? <FormattedDate value={r.requestExpirationDate} /> : '-'),
  holdShelfExpireDate: r => (r.holdShelfExpirationDate ? <FormattedDate value={r.holdShelfExpirationDate} /> : '-'),
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
      holding: PropTypes.object,
      request: PropTypes.object,
    }),
    onClose: PropTypes.func,
    isLoading: PropTypes.bool,
  };

  state = { requests: [] };

  static getDerivedStateFromProps(props, state) {
    const { data: { requests } } = props;

    if (!isEqual(
      requests.map(r => r.id).sort(),
      state.requests.map(r => r.id).sort()
    )) {
      return { requests };
    }

    return null;
  }

  callout = React.createRef();

  onDragEnd = (result) => {
    const {
      destination,
      source,
    } = result;

    if (!destination) {
      return;
    }

    const data = this.state.requests;
    let destIndex = destination.index;
    const destRequest = data[destIndex];

    if (destIndex === 0 && !isNotYetFilled(destRequest)) {
      // TODO: show modal from scenario 6 in UIREQ-112
      destIndex = 1;
    }

    if (destIndex === 0 && isPageRequest(destRequest)) {
      // TODO: show modal from scenario 7 in UIREQ-112
      destIndex = 1;
    }

    const requests = reorder(
      data,
      source.index,
      destIndex
    ).map((r, index) => ({ ...r, position: index + 1 }));

    // TODO: connect to backend
    this.setState({ requests }, this.showCallout);
  }

  showCallout = () => {
    this.callout.current.sendCallout({
      type: 'success',
      message: <FormattedMessage id="ui-requests.requestQueue.reorderSuccess" />,
    });
  }

  isRowDraggable = (request, index) => {
    return index !== 0 ||
      (isNotYetFilled(request) && !isPageRequest(request));
  }

  render() {
    const {
      isLoading,
      onClose,
      data: {
        item,
        request,
        holding,
      },
    } = this.props;

    const { requests } = this.state;
    const count = requests.length;
    const { title } = item;

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
                  value={item.callNumber || holding.callNumber || '-'}
                />
              </Col>
              <Col xs={1}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.volume" />}
                  value={get(item, 'volume', '-')}
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
                  value={get(item, 'copyNumbers[0]') || holding.copyNumber || ''}
                />
              </Col>
            </Row>
          </div>
          {!isLoading &&
            <SortableList
              id="requests-list"
              onDragEnd={this.onDragEnd}
              isRowDraggable={this.isRowDraggable}
              contentData={requests}
              visibleColumns={COLUMN_NAMES}
              columnMapping={COLUMN_MAP}
              columnWidths={COLUMN_WIDTHS}
              formatter={formatter}
              height="70vh"
              isEmptyMessage={
                <FormattedMessage id="ui-requests.requestQueue.requests.notFound" />
              }
            />
          }
        </Pane>
        <Callout ref={this.callout} />
      </Paneset>
    );
  }
}

export default RequestQueueView;
