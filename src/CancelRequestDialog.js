import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { FormattedMessage } from 'react-intl';
import SafeHTMLMessage from '@folio/react-intl-safe-html';
import {
  Button,
  Layout,
  Modal,
  Select,
  TextArea,
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

  onCancelRequest = () => {
    const { additionalInfo, reason } = this.state;
    const { stripes } = this.props;

    const cancellationInfo = {
      cancelledByUserId: stripes.user.user.id,
      cancellationReasonId: reason.value,
      cancellationAdditionalInformation: additionalInfo,
      cancelledDate: new Date().toISOString(),
      status: 'Closed - Cancelled',
    };

    this.props.onCancelRequest(cancellationInfo);
  }

  onChangeAdditionalInfo = (e) => this.setState({ additionalInfo: e.target.value })

  // onChangeNotify = () => this.setState(prevState => ({ notify: !prevState.notify }))

  onChangeReason = (e) => {
    const value = e.target.value;
    this.setState(({ reasons }) => ({
      reason: reasons.find(r => r.value === value)
    }));
  }

  render() {
    const {
      request,
    } = this.props;

    const {
      reason,
      reasons,
      additionalInfo,
    } = this.state;

    const additionalInfoPlaceholder = reason.requiresAdditionalInformation
      ? 'ui-requests.cancel.additionalInfoPlaceholderRequired'
      : 'ui-requests.cancel.additionalInfoPlaceholderOptional';

    if (!request) return null;

    return (
      <Modal
        label={<FormattedMessage id="ui-requests.cancel.modalLabel" />}
        open={this.props.open}
        onClose={this.props.onClose}
      >
        <p>
          <SafeHTMLMessage
            id="ui-requests.cancel.requestWillBeCancelled"
            values={{ title: request.item.title }}
          />
        </p>
        <Select
          label={<FormattedMessage id="ui-requests.cancel.reasonLabel" />}
          dataOptions={reasons}
          value={reason.value}
          onChange={this.onChangeReason}
        />
        {/*
        <Checkbox
          id="notify-patron-checkbox"
          label={formatMessage({ id: 'ui-requests.cancel.notifyLabel' })}
          checked={notify}
          onChange={this.onChangeNotify}
        />
        */}
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
        <Layout className="textRight">
          <Button onClick={this.props.onClose}>
            <FormattedMessage id="stripes-core.button.back" />
          </Button>
          <Button
            buttonStyle="primary"
            disabled={reason.requiresAdditionalInformation && !additionalInfo}
            onClick={this.onCancelRequest}
          >
            <FormattedMessage id="stripes-core.button.confirm" />
          </Button>
        </Layout>
      </Modal>

    );
  }
}

export default CancelRequestDialog;
