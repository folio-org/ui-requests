import {
  get,
  includes,
} from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  stripesConnect,
  stripesShape,
} from '@folio/stripes/core';
import {
  getHeaderWithCredentials,
} from '@folio/stripes/util';

import ItemsDialog from '../ItemsDialog/ItemsDialog';
import ChooseRequestTypeDialog from '../../../ChooseRequestTypeDialog';
import ErrorModal from '../../../components/ErrorModal';
import { getRequestTypeOptions } from '../../../utils';
import { REQUEST_OPERATIONS } from '../../../constants';

class MoveRequestManager extends React.Component {
  static propTypes = {
    onCancelMove: PropTypes.func,
    onMove: PropTypes.func,
    request: PropTypes.shape({
      id: PropTypes.string,
      requestType: PropTypes.string,
    }).isRequired,
    mutator: PropTypes.shape({
      move: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
      moveRequest: PropTypes.shape({
        POST: PropTypes.func.isRequired,
      }),
    }).isRequired,
    stripes: stripesShape.isRequired,
  };

  static manifest = {
    moveRequest: {
      type: 'okapi',
      POST: {
        path: 'circulation/requests/!{request.id}/move',
      },
      fetch: false,
      throwErrors: false,
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      moveRequest: true,
      moveInProgress: false,
      requestTypes: [],
      isRequestTypesLoading: false,
    };

    this.steps = [
      {
        validate: this.shouldChooseRequestTypeDialogBeShown,
        exec: () => this.setState({
          chooseRequestType: true,
          moveRequest: false,
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
    const { requestTypes } = this.state;
    const {
      request: {
        requestType,
      },
    } = this.props;

    return !includes(requestTypes, requestType);
  }

  confirmChoosingRequestType = (selectedRequestType) => {
    this.setState({
      selectedRequestType,
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

      this.setState({
        chooseRequestType: false,
      });
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
    this.setState({
      chooseRequestType: false,
      errorMessage,
    });
  }

  onItemSelected = (selectedItem) => {
    const {
      request,
      stripes,
    } = this.props;
    const httpHeadersOptions = {
      ...getHeaderWithCredentials({
        tenant: stripes.okapi.tenant,
        token: stripes.store.getState().okapi.token,
      })
    };
    const url = `${stripes.okapi.url}/circulation/requests/allowed-service-points?requestId=${request.id}&itemId=${selectedItem.id}&operation=${REQUEST_OPERATIONS.MOVE}`;

    this.setState({
      isRequestTypesLoading: true,
      requestTypes: [],
    });

    fetch(url, httpHeadersOptions)
      .then(res => {
        if (res.ok) {
          return res.json();
        }

        return Promise.reject(res);
      })
      .then((res) => {
        this.setState({
          requestTypes: Object.keys(res),
          selectedItem,
        }, () => this.execSteps(0));
      })
      .catch(() => {
        this.execSteps(0);
      })
      .finally(() => {
        this.setState({
          isRequestTypesLoading: false,
        });
      });
  }

  cancelMoveRequest = () => {
    this.setState({
      moveRequest: true,
      chooseRequestType: false,
      selectedRequestType: '',
    });
  }

  closeErrorMessage = () => {
    const { requestTypes } = this.state;
    const state = { errorMessage: null };

    if (requestTypes && requestTypes.length > 1) {
      state.chooseRequestType = true;
    } else {
      state.moveRequest = true;
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
      errorMessage,
      moveRequest,
      moveInProgress,
      requestTypes,
      isRequestTypesLoading,
    } = this.state;
    const isLoading = moveInProgress || isRequestTypesLoading;

    return (
      <>
        <ItemsDialog
          open={moveRequest}
          instanceId={request.instanceId}
          title={request.instance.title}
          isLoading={isLoading}
          onClose={onCancelMove}
          skippedItemId={request.itemId}
          onRowClick={(_, item) => this.onItemSelected(item)}
        />
        {chooseRequestType &&
          <ChooseRequestTypeDialog
            open={chooseRequestType}
            data-test-choose-request-type-modal
            isLoading={isLoading}
            requestTypes={getRequestTypeOptions(requestTypes)}
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
