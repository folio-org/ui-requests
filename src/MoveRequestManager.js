import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  ConfirmationModal,
} from '@folio/stripes/components';

import {
  getRequestTypeOptions,
} from './utils';

import MoveRequestDialog from './MoveRequestDialog';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';

class MoveRequestManager extends React.Component {
  static propTypes = {
    onClose: PropTypes.func,
    request: PropTypes.object,
    stripes: PropTypes.object,
  };

  constructor(props) {
    super(props);
    const { stripes: { connect } } = props;

    this.state = {};
    this.cMoveRequestDialog = connect(MoveRequestDialog);
  }

  moveRequest = () => {
    const { selectedItem } = this.state;
    this.props.onClose();
    // TODO: perform move
  }

  onItemSelected = (selectedItem) => {
    this.setState({ selectedItem });

    const requestTypes = getRequestTypeOptions(selectedItem);

    if (requestTypes.length === 1) {
      this.setState({
        changeRequestType: true,
        requestType: requestTypes[0].value,
      });
    } else {
      this.setState({
        chooseRequestType: true,
        requestTypes,
      });
    }
  }

  cancelMoveRequest = () => {
    this.setState({
      changeRequestType: false,
      chooseRequestType: false,
    });
  }

  render() {
    const { onClose, request, stripes } = this.props;
    const {
      changeRequestType,
      chooseRequestType,
      requestTypes,
      requestType,
    } = this.state;

    return (
      <React.Fragment>
        <this.cMoveRequestDialog
          open
          request={request}
          onClose={onClose}
          stripes={stripes}
          onItemSelected={this.onItemSelected}
        />
        { changeRequestType &&
          <ConfirmationModal
            open={changeRequestType}
            data-test-confirm-request-type-change-modal
            heading={<FormattedMessage id="ui-requests.moveRequest.requestTypeChangeHeading" />}
            message={<SafeHTMLMessage id="ui-requests.moveRequest.requestTypeChangeMessage" values={{ requestType }} />}
            onConfirm={this.moveRequest}
            onCancel={this.cancelMoveRequest}
            confirmLabel={<FormattedMessage id="ui-requests.moveRequest.confirm" />}
          />
        }
        { chooseRequestType &&
          <ChooseRequestTypeDialog
            open={chooseRequestType}
            data-test-choose-request-type-modal
            requestTypes={requestTypes}
            onConfirm={this.moveRequest}
            onCancel={this.cancelMoveRequest}
          />
        }
      </React.Fragment>
    );
  }
}

export default MoveRequestManager;
