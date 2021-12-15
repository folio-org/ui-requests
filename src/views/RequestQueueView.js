import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  Callout,
  ConfirmationModal,
  ErrorModal,
  Pane,
  PaneHeaderIconButton,
  PaneMenu,
  Paneset,
} from '@folio/stripes/components';

import {
  iconTypes,
  errorMessages,
  requestStatuses,
} from '../constants';
import {
  isNotYetFilled,
  isPageRequest,
} from '../utils';
import {
  SortableList,
  Loading,
} from '../components';
import FulfillmentRequestsData from './components/FulfillmentRequestsData';

import {
  COLUMN_MAP,
  COLUMN_WIDTHS,
  formatter,
} from './constants';

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

  processError = (err) => {
    let error = {
      label: <FormattedMessage id="ui-requests.errors.unknown.requestQueueLabel" />,
      content: <FormattedMessage id="ui-requests.errors.unknown.requestQueueBody" />,
    };

    if (err.json) {
      return err.json().then(json => {
        if (json?.errors?.[0]?.message === errorMessages.REORDER_SYNC_ERROR) {
          error = {
            label: <FormattedMessage id="ui-requests.errors.sync.requestQueueLabel" />,
            content: <FormattedMessage id="ui-requests.errors.sync.requestQueueBody" />,
          };
        }

        this.setState({ error });
      });
    }

    return this.setState({ error });
  }

  finishReorder = (requests) => {
    this.props.onReorder(requests)
      .then(() => this.showCallout('ui-requests.requestQueue.reorderSuccess'))
      .catch(this.processError);
  }

  reload = () => {
    window.location.reload();
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
        request,
      },
    } = this.props;
    const {
      requests,
      confirmMessage,
      error,
    } = this.state;
    const count = requests.length;
    const { title } = request?.instance || {};
    const notYetFilledRequests = [];
    const inProgressRequests = [];

    requests.forEach(r => {
      if (r.status === requestStatuses.NOT_YET_FILLED) {
        notYetFilledRequests.push(r);
      } else {
        inProgressRequests.push(r);
      }
    });

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
          {
          isLoading
            ? <Loading />
            : (
              <>
                <FulfillmentRequestsData
                  contentData={inProgressRequests}
                />
                <SortableList
                  id="requests-list"
                  onDragEnd={this.onDragEnd}
                  isRowDraggable={this.isRowDraggable}
                  contentData={notYetFilledRequests}
                  visibleColumns={COLUMN_NAMES}
                  columnMapping={COLUMN_MAP}
                  columnWidths={COLUMN_WIDTHS}
                  formatter={formatter}
                  height="70vh"
                  isEmptyMessage={
                    <FormattedMessage id="ui-requests.requestQueue.requests.notFound" />
                  }
                />
              </>
            )
          }
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
        <ErrorModal
          open={!!error}
          label={error?.label}
          content={error?.content}
          buttonLabel={<FormattedMessage id="ui-requests.requestQueue.refresh" />}
          onClose={this.reload}
        />
      </Paneset>
    );
  }
}

export default RequestQueueView;
