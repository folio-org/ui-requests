import React from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Button from '@folio/stripes-components/lib/Button';
// import Checkbox from '@folio/stripes-components/lib/Checkbox';
import Layout from '@folio/stripes-components/lib/Layout';
import Modal from '@folio/stripes-components/lib/Modal';
import Select from '@folio/stripes-components/lib/Select';
import TextArea from '@folio/stripes-components/lib/TextArea';

class CancelRequestDialog extends React.Component {
  static manifest = {
    cancellationReasons: {
      type: 'okapi',
      path: 'cancellation-reason-storage/cancellation-reasons',
      records: 'cancellationReasons',
    },
  }

  static propTypes = {
    intl: PropTypes.shape({
      formatDate: PropTypes.func,
      formatMessage: PropTypes.func.isRequired,
    }),
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
        label: r.description,
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
    const reason = this.state.reasons.find(r => r.value === value);
    this.setState({ reason });
  }

  render() {
    const { request, intl } = this.props;
    const { reason, reasons, /* notify, */ additionalInfo } = this.state;
    const { formatMessage } = intl;

    if (!request) return null;

    return (
      <Modal
        label={formatMessage({ id: 'ui-requests.cancel.modalLabel' })}
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
          label={formatMessage({ id: 'ui-requests.cancel.reasonLabel' })}
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
        <TextArea
          label={formatMessage(
            { id: 'ui-requests.cancel.additionalInfoLabel' },
            { required: reason.requiresAdditionalInformation ? '*' : ' ' }
          )}
          placeholder={
            reason.requiresAdditionalInformation ?
              formatMessage({ id: 'ui-requests.cancel.additionalInfoPlaceholderRequired' }) :
              formatMessage({ id: 'ui-requests.cancel.additionalInfoPlaceholderOptional' })
          }
          value={additionalInfo}
          onChange={this.onChangeAdditionalInfo}
        />
        <Layout className="textRight">
          <Button onClick={this.props.onClose}>
            {formatMessage({ id: 'stripes-core.button.back' })}
          </Button>
          <Button
            buttonStyle="primary"
            disabled={reason.requiresAdditionalInformation && !additionalInfo}
            onClick={this.onCancelRequest}
          >
            {formatMessage({ id: 'stripes-core.button.confirm' })}
          </Button>
        </Layout>
      </Modal>

    );
  }
}

export default CancelRequestDialog;
