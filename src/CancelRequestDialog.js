import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Modal,
  ModalFooter,
  Select,
  TextArea,
  Button,
} from '@folio/stripes/components';

class CancelRequestDialog extends React.Component {
  static manifest = {
    cancellationReasons: {
      type: 'okapi',
      path: 'cancellation-reason-storage/cancellation-reasons',
      records: 'cancellationReasons',
    },
  }

  static propTypes = {
    onCancelRequest: PropTypes.func.isRequired,
    onClose: PropTypes.func,
    open: PropTypes.bool,
    request: PropTypes.shape({
      item: PropTypes.shape({
        title: PropTypes.string
      })
    }),
    resources: PropTypes.shape({
      cancellationReasons: PropTypes.shape({
        records: PropTypes.array,
      }),
    }),
    stripes: PropTypes.shape({
      user: PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.string,
        })
      })
    }),
  }

  static defaultProps = {
    onClose: () => {},
  }

  constructor(props) {
    super(props);

    this.state = {
      reasons: [],
      reason: { label: '', value: '' },
      cancelInProgress: false,
      // notify: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const reasonRecords = get(props.resources, ['cancellationReasons', 'records'], []);
    if (state.reasons.length !== reasonRecords.length) {
      const reasons = reasonRecords.map(r => ({
        label: r.name,
        value: r.id,
        requiresAdditionalInformation: r.requiresAdditionalInformation,
      })).sort((a, b) => a.label > b.label);

      return {
        reasons,
        reason: reasons[0] || {},
      };
    }

    return null;
  }

  onCancelRequestHandler = () => {
    const {
      additionalInfo,
      reason,
    } = this.state;

    const {
      stripes,
      onCancelRequest,
    } = this.props;

    this.setState({
      cancelInProgress: true,
    });

    const cancellationInfo = {
      cancelledByUserId: stripes.user.user.id,
      cancellationReasonId: reason.value,
      cancellationAdditionalInformation: additionalInfo,
      cancelledDate: new Date().toISOString(),
      status: 'Closed - Cancelled',
    };

    onCancelRequest(cancellationInfo);
  }

  onChangeAdditionalInfo = (e) => {
    this.setState({ additionalInfo: e.target.value });
  }

  onChangeReason = (e) => {
    const value = e.target.value;
    this.setState(({ reasons }) => ({
      reason: reasons.find(r => r.value === value)
    }));
  }

  render() {
    const {
      request,
      open,
      onClose,
    } = this.props;

    const {
      reason,
      reasons,
      additionalInfo,
      cancelInProgress,
    } = this.state;

    const additionalInfoPlaceholder = reason.requiresAdditionalInformation
      ? 'ui-requests.cancel.additionalInfoPlaceholderRequired'
      : 'ui-requests.cancel.additionalInfoPlaceholderOptional';

    if (!request) return null;

    const isCancelBbnDisabled = cancelInProgress ||
      (reason.requiresAdditionalInformation && !additionalInfo);

    const footer = (
      <ModalFooter>
        <Button
          data-test-confirm-cancel-request
          buttonStyle="primary"
          onClick={this.onCancelRequestHandler}
          disabled={isCancelBbnDisabled}
        >
          <FormattedMessage id="stripes-core.button.confirm" />
        </Button>
        <Button
          data-test-cancel-cancel-request
          onClick={onClose}
        >
          <FormattedMessage id="stripes-core.button.back" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        data-test-cancel-request-modal
        label={<FormattedMessage id="ui-requests.cancel.modalLabel" />}
        open={open}
        onClose={onClose}
        footer={footer}
      >
        <p>
          <SafeHTMLMessage
            id="ui-requests.cancel.requestWillBeCancelled"
            values={{ title: request.item.title }}
          />
        </p>
        <Select
          data-test-select-cancelation-reason
          label={<FormattedMessage id="ui-requests.cancel.reasonLabel" />}
          dataOptions={reasons}
          value={reason.value}
          onChange={this.onChangeReason}
        />
        <FormattedMessage id={additionalInfoPlaceholder}>
          {placeholder => (
            <TextArea
              label={
                <FormattedMessage
                  id="ui-requests.cancel.additionalInfoLabel"
                  values={{
                    required: reason.requiresAdditionalInformation ? '*' : ' '
                  }}
                />
              }
              placeholder={placeholder}
              value={additionalInfo}
              onChange={this.onChangeAdditionalInfo}
            />
          )}
        </FormattedMessage>
      </Modal>
    );
  }
}

export default CancelRequestDialog;
