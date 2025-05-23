import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Modal,
  ModalFooter,
  Button,
  Select
} from '@folio/stripes/components';

import { Loading } from './components';

class ChooseRequestTypeDialog extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    requestTypes: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      value: PropTypes.string,
    })),
    open: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    this.state = {
      requestType: props.requestTypes[0]?.value,
    };
  }

  selectRequestType = (e) => {
    const requestType = e.target.value;
    this.setState({ requestType });
  }

  onConfirm = () => {
    const { onConfirm } = this.props;
    const { requestType } = this.state;

    onConfirm(requestType);
  }

  render() {
    const {
      open,
      onCancel,
      isLoading,
      requestTypes,
    } = this.props;
    const isRequestTypeDisabled = requestTypes.length === 0;
    const isConfirmButtonDisabled = isRequestTypeDisabled || isLoading;
    const requestTypesError = isRequestTypeDisabled ? <FormattedMessage id="ui-requests.moveRequest.error.itemLevelRequest" /> : null;
    const footer = (
      <ModalFooter>
        <Button
          data-test-confirm-request-type
          buttonStyle="primary"
          onClick={this.onConfirm}
          disabled={isConfirmButtonDisabled}
        >
          <FormattedMessage id="ui-requests.moveRequest.confirm" />
        </Button>
        <Button
          data-test-cancel-move-request
          onClick={onCancel}
          disabled={isLoading}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        data-test-choose-request-type-modal
        label={<FormattedMessage id="ui-requests.moveRequest.chooseRequestType" />}
        open={open}
        onClose={onCancel}
        footer={footer}
      >
        {isLoading ?
          <Loading data-testid="loading" /> :
          <Select
            data-testid="requestType"
            label={<FormattedMessage id="ui-requests.moveRequest.chooseRequestMessage" />}
            name="requestType"
            onChange={this.selectRequestType}
            disabled={isRequestTypeDisabled}
            error={requestTypesError}
          >
            {requestTypes.map(({ id, value }) => (
              <FormattedMessage id={id} key={id}>
                {translatedLabel => (
                  <option
                    value={value}
                  >
                    {translatedLabel}
                  </option>
                )}
              </FormattedMessage>
            ))}
          </Select>
        }
      </Modal>
    );
  }
}

export default ChooseRequestTypeDialog;
