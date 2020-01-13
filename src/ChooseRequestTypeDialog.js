import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';

import {
  Modal,
  ModalFooter,
  Button,
  Select
} from '@folio/stripes/components';

import {
  getRequestTypeOptions,
} from './utils';

class ChooseRequestTypeDialog extends React.Component {
  static propTypes = {
    item: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    open: PropTypes.bool,
  };

  constructor(props) {
    super(props);

    const { item } = this.props;

    this.options = getRequestTypeOptions(item);
    this.state = {
      requestType: this.options[0].value,
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
    } = this.props;
    const { requestType } = this.state;
    const footer = (
      <ModalFooter>
        <Button
          data-test-confirm-request-type
          buttonStyle="primary"
          onClick={this.onConfirm}
        >
          <FormattedMessage id="ui-requests.moveRequest.confirm" />
        </Button>
        <Button
          data-test-cancel-move-request
          onClick={onCancel}
        >
          <FormattedMessage id="stripes-core.button.cancel" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        data-test-choose-request-type-modal
        label={<FormattedMessage id="ui-requests.moveRequest.requestTypeChangeHeading" />}
        open={open}
        onClose={onCancel}
        footer={footer}
      >
        {this.options.length > 1 ?
          <Select
            label={<FormattedMessage id="ui-requests.moveRequest.chooseRequestMessage" />}
            name="requestType"
            onChange={this.selectRequestType}
          >
            {this.options.map(({ id, value }) => (
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
          : <SafeHTMLMessage id="ui-requests.moveRequest.requestTypeChangeMessage" values={{ requestType }} />}
      </Modal>
    );
  }
}

export default ChooseRequestTypeDialog;
