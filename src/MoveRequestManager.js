import {
  get,
  includes,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { stripesConnect } from '@folio/stripes/core';

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
      moveRequest: PropTypes.shape({
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
    this.state = {
      moveRequest: true,
      moveInProgress: false,
    };

    this.steps = [
      {
        validate: this.shouldChooseRequestTypeDialogBeShown,
        exec: () => this.setState({
          chooseRequestType: true,
          moveRequest: false
        }),
      },
    ];
  }

  execSteps = (start) => {
    for (let i = start; i < this.steps.length; i++) {
      const step = this.steps[i];
      if (step.validate()) {
        return step.exec();
      }
    }

    return this.moveRequest();
  }

  shouldChooseRequestTypeDialogBeShown = () => {
    const { selectedItem } = this.state;
    const { request: { requestType } } = this.props;
    const requestTypes = this.getPossibleRequestTypes(selectedItem);

    return !includes(requestTypes, requestType);
  }

  confirmChoosingRequestType = (selectedRequestType) => {
    this.setState({
      selectedRequestType,
      chooseRequestType: false
    }, () => this.execSteps(1));
  }

  moveRequest = async () => {
    const {
      selectedItem,
      selectedRequestType,
    } = this.state;
    const {
      mutator: {
        moveRequest: { POST },
      },
      request,
    } = this.props;
    const requestType = selectedRequestType || request.requestType;
    const destinationItemId = selectedItem.id;
    const data = {
      destinationItemId,
      requestType,
    };

    this.setState({ moveInProgress: true });

    try {
      const movedRequest = await POST(data);
      this.props.onMove(movedRequest);
    } catch (resp) {
      this.processError(resp);
    } finally {
      this.setState({ moveInProgress: false });
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

  getPossibleRequestTypes(item) {
    const itemStatus = get(item, 'status.name');
    return requestTypesByItemStatus[itemStatus] || [];
  }

  onItemSelected = (selectedItem) => {
    this.setState({
      selectedItem,
    }, () => this.execSteps(0));
  }

  cancelMoveRequest = () => {
    this.setState({
      moveRequest: true,
      chooseRequestType: false,
    });
  }

  closeErrorMessage = () => {
    const { selectedItem } = this.state;
    const requestTypes = this.getPossibleRequestTypes(selectedItem);
    const state = { errorMessage: null };

    if (requestTypes && requestTypes.length) {
      state.chooseRequestType = true;
    }

    this.setState(state);
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
      moveRequest,
      moveInProgress,
    } = this.state;

    return (
      <>
        <MoveRequestDialog
          open={moveRequest || moveInProgress}
          request={request}
          moveInProgress={moveInProgress}
          onClose={onCancelMove}
          onItemSelected={this.onItemSelected}
        />
        {chooseRequestType &&
          <ChooseRequestTypeDialog
            open={chooseRequestType}
            data-test-choose-request-type-modal
            item={selectedItem}
            onConfirm={this.confirmChoosingRequestType}
            onCancel={this.cancelMoveRequest}
          /> }
        {errorMessage &&
          <ErrorModal
            onClose={this.closeErrorMessage}
            label={<FormattedMessage id="ui-requests.requestNotAllowed" />}
            errorMessage={errorMessage}
          /> }
      </>
    );
  }
}

export default stripesConnect(MoveRequestManager);
