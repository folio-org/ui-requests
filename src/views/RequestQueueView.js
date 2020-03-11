import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { get } from 'lodash';
import {
  FormattedMessage,
  FormattedDate,
  FormattedTime,
} from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  Col,
  Callout,
  ConfirmationModal,
  KeyValue,
  Pane,
  PaneHeaderIconButton,
  PaneMenu,
  Paneset,
  Row,
} from '@folio/stripes/components';
import { AppIcon } from '@folio/stripes/core';
import { effectiveCallNumber } from '@folio/stripes/util';

import { iconTypes } from '../constants';
import {
  getFullName,
  isNotYetFilled,
  isPageRequest,
} from '../utils';
import {
  SortableList,
  Loading,
} from '../components';

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
  requestType: '5%',
  status: '11%',
  pickup: '9%',
  requester: '15%',
  requesterBarcode: '12%',
  patronGroup: '13%',
  requestDate: '11%',
  requestExpirationDate: '8%',
  holdShelfExpireDate: '13%',
};

const COLUMN_MAP = {
  position: <FormattedMessage id="ui-requests.requestQueue.position" />,
  requestType: <FormattedMessage id="ui-requests.requestQueue.requestType" />,
  status: <FormattedMessage id="ui-requests.requestQueue.requestStatus" />,
  pickup: <FormattedMessage id="ui-requests.requestQueue.pickup" />,
  requester: <FormattedMessage id="ui-requests.requestQueue.requesterName" />,
  requesterBarcode: <FormattedMessage id="ui-requests.requestQueue.requesterBarcode" />,
  patronGroup: <FormattedMessage id="ui-requests.requestQueue.patronGroup" />,
  requestDate: <FormattedMessage id="ui-requests.requestQueue.requestDate" />,
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
    onReorder: PropTypes.func,
    isLoading: PropTypes.bool,
    location: ReactRouterPropTypes.location,
  };

  static getDerivedStateFromProps(props, state) {
    const { data: { requests } } = props;

    if (!state.reorder) {
      return { requests };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      requests: [],
      reorder: false,
    };
  }

  componentDidMount() {
    const { location } = this.props;
    const afterMove = get(location, 'state.afterMove', false);

    if (afterMove) {
      this.showCallout(
        'ui-requests.moveRequest.success',
      );
    }
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

    const { requests } = this.state;
    const destIndex = destination.index;
    const sourceIndex = source.index;
    const destRequest = requests[destIndex];
    let confirmMessage;

    if (sourceIndex === destIndex) {
      return;
    }

    if (destIndex === 0 && !isNotYetFilled(destRequest)) {
      confirmMessage = 'ui-requests.requestQueue.confirmReorder.message1';
    }

    if (destIndex === 0 && isPageRequest(destRequest)) {
      confirmMessage = 'ui-requests.requestQueue.confirmReorder.message2';
    }

    if (confirmMessage) {
      this.setState({
        confirmMessage,
        sourceIndex,
        destIndex: 1,
      });
    } else {
      this.reorderRequests(sourceIndex, destIndex);
    }
  }

  reorderRequests = (sourceIndex, destIndex) => {
    const data = this.state.requests;
    const requests = reorder(
      data,
      sourceIndex,
      destIndex
    ).map((r, index) => ({ ...r, position: index + 1 }));

    this.setState({
      confirmMessage: null,
      reorder: true, // eslint-disable-line react/no-unused-state
      requests,
    }, () => this.finishReorder(requests));
  }

  finishReorder = (requests) => {
    this.props.onReorder(requests).then(this.showCallout(
      'ui-requests.requestQueue.reorderSuccess',
    ));
  }

  confirmReorder = () => {
    const {
      sourceIndex,
      destIndex,
    } = this.state;

    this.reorderRequests(sourceIndex, destIndex);
  }

  cancelReorder = () => {
    this.setState({ confirmMessage: null });
  }

  showCallout = (message) => {
    this.callout.current.sendCallout({
      message: <FormattedMessage id={message} />,
      timeout: 2000,
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
      },
    } = this.props;
    const {
      requests,
      confirmMessage,
    } = this.state;
    const count = requests.length;
    const { title } = item;
    const itemLink = (item.barcode)
      ? (<Link to={`/inventory/view/${get(request, 'item.instanceId')}/${get(request, 'item.holdingsRecordId')}/${item.id}`}>{item.barcode}</Link>)
      : '-';

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
                    data-test-close-request-queue-view
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
              <Col xs={1}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.barcode" />}
                  value={itemLink}
                />
              </Col>
              <Col xs={2}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.status" />}
                  value={get(item, 'status.name', '-')}
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
              <Col
                data-test-item-call-number
                xs={4}
              >
                <KeyValue
                  label={<FormattedMessage id="ui-requests.item.callNumber" />}
                  value={effectiveCallNumber(item)}
                />
              </Col>
            </Row>
          </div>
          {isLoading ?
            <Loading /> :
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
            /> }
        </Pane>
        <Callout ref={this.callout} />
        <ConfirmationModal
          id="confirm-reorder"
          open={!!confirmMessage}
          heading={<FormattedMessage id="ui-requests.requestQueue.confirmReorder.title" />}
          message={<FormattedMessage id={`${confirmMessage}`} />}
          confirmLabel={<FormattedMessage id="ui-requests.requestQueue.confirmReorder.confirm" />}
          cancelLabel={<FormattedMessage id="ui-requests.requestQueue.confirmReorder.cancel" />}
          onConfirm={this.confirmReorder}
          onCancel={this.cancelReorder}
        />
      </Paneset>
    );
  }
}

export default RequestQueueView;
