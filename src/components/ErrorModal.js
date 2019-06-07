import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Modal,
  ModalFooter
} from '@folio/stripes/components';

const ErrorModal = (props) => {
  const {
    errorMessage,
    onClose,
    label,
  } = props;

  const footer = (
    <ModalFooter>
      <Button
        data-test-error-modal-close-button
        onClick={onClose}
      >
        <FormattedMessage id="ui-requests.close" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      data-test-error-modal
      open
      size="small"
      label={label}
      footer={footer}
      dismissible
      onClose={onClose}
    >
      <div data-test-error-modal-content>
        {errorMessage}
      </div>
    </Modal>
  );
};

ErrorModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  label: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  errorMessage: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
};

export default ErrorModal;
