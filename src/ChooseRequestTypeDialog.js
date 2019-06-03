import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,
  Button,
  Select
} from '@folio/stripes/components';

class ChooseRequestTypeDialog extends React.Component {
  static propTypes = {
    requestTypes: PropTypes.arrayOf(PropTypes.object),
    onConfirm: PropTypes.func,
    onCancel: PropTypes.func,
    open: PropTypes.bool,
  };

  render() {
    const {
      open,
      onCancel,
      onConfirm,
      requestTypes,
    } = this.props;

    const footer = (
      <ModalFooter>
        <Button
          data-test-confirm-request-type
          buttonStyle="primary"
          onClick={onConfirm}
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
        data-test-move-request-modal
        label={<FormattedMessage id="ui-requests.moveRequest.selectItem" />}
        open={open}
        onClose={onCancel}
        footer={footer}
      >
        <FormattedMessage id="ui-requests.moveRequest.chooseRequestTypeHeading" />

        <Select
          label={<FormattedMessage id="ui-requests.requestType" />}
          name="requestType"
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
      </Modal>
    );
  }
}

export default ChooseRequestTypeDialog;
