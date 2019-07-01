import { get, includes } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { stripesConnect } from '@folio/stripes/core';
import { FormattedMessage } from 'react-intl';

import MoveRequestDialog from './MoveRequestDialog';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';
import ErrorModal from './components/ErrorModal';
import { requestTypesByItemStatus } from './constants';

class MoveRequestManager extends React.Component {
  static propTypes = {
    onCancelMove: PropTypes.func,
    onMove: PropTypes.func,
    request: PropTypes.object,
    mutator: PropTypes.shape({
      move: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
  };

  static manifest = {
    moveRequest: {
      type: 'okapi',
      POST: {
        path: 'circulation/requests/!{request.id}/move',
      },
      fetch: false,
      throwErrors: false,
    }
  };

  constructor(props) {
    super(props);
    this.state = {};
  }

  moveRequest = async (requestType, item) => {
    const {
      mutator: {
        moveRequest: { POST },
      },
    } = this.props;

    const data = {
      destinationItemId: item.id,
      requestType,
    };

    try {
      await POST(data);
      this.props.onMove(requestType, item);
    } catch (resp) {
      this.processError(resp);
    }
  }

  processError(resp) {
    const contentType = resp.headers.get('Content-Type') || '';
    if (contentType.startsWith('application/json')) {
      return resp.json().then(error => this.handleError(get(error, 'errors[0].message')));
    } else {
      return resp.text().then(error => this.handleError(error));
    }
  }

  handleError(errorMessage) {
    this.setState({ errorMessage });
  }

  onItemSelected = (selectedItem) => {
    const { request: { requestType } } = this.props;
    const itemStatus = get(selectedItem, 'status.name');
    const requestTypes = requestTypesByItemStatus[itemStatus] || [];

    if (includes(requestTypes, requestType)) {
      return this.moveRequest(requestType, selectedItem);
    }

    return this.setState({
      chooseRequestType: true,
      selectedItem,
    });
  }

  cancelMoveRequest = () => {
    this.setState({
      chooseRequestType: false,
    });
  }

  closeErrorMessage = () => {
    this.setState({
      errorMessage: null
    });
  }

  render() {
    const {
      onCancelMove,
      request,
    } = this.props;
    const {
      chooseRequestType,
      selectedItem,
      errorMessage,
    } = this.state;

    return (
      <React.Fragment>
        <MoveRequestDialog
          open
          request={request}
          onClose={onCancelMove}
          onItemSelected={this.onItemSelected}
        />
        { chooseRequestType &&
          <ChooseRequestTypeDialog
            open={chooseRequestType}
            data-test-choose-request-type-modal
            item={selectedItem}
            onConfirm={this.moveRequest}
            onCancel={this.cancelMoveRequest}
          />
        }
        {
          errorMessage &&
          <ErrorModal
            onClose={this.closeErrorMessage}
            label={<FormattedMessage id="ui-requests.requestNotAllowed" />}
            errorMessage={errorMessage}
          />
        }
      </React.Fragment>
    );
  }
}

export default stripesConnect(MoveRequestManager);
