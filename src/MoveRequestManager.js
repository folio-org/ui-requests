import { get, includes } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { withStripes } from '@folio/stripes/core';

import MoveRequestDialog from './MoveRequestDialog';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';

import { requestTypesByItemStatus } from './constants';

class MoveRequestManager extends React.Component {
  static propTypes = {
    onCancelMove: PropTypes.func,
    onMove: PropTypes.func,
    request: PropTypes.object,
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { stripes: { connect } } = props;

    this.state = {};
    this.cMoveRequestDialog = connect(MoveRequestDialog);
  }

  moveRequest = (requestType, item) => {
    this.props.onMove(requestType, item);
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

  render() {
    const {
      onCancelMove,
      request,
    } = this.props;
    const {
      chooseRequestType,
      selectedItem,
    } = this.state;

    return (
      <React.Fragment>
        <this.cMoveRequestDialog
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
      </React.Fragment>
    );
  }
}

export default withStripes(MoveRequestManager);
