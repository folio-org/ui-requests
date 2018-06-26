import React from 'react';
import PropTypes from 'prop-types';

import SafeHTMLMessage from '@folio/react-intl-safe-html';
import Button from '@folio/stripes-components/lib/Button';
import Checkbox from '@folio/stripes-components/lib/Checkbox';
import Layout from '@folio/stripes-components/lib/Layout';
import Modal from '@folio/stripes-components/lib/Modal';
import Select from '@folio/stripes-components/lib/Select';
import TextArea from '@folio/stripes-components/lib/TextArea';

class CancelRequestDialog extends React.Component { // eslint-disable-line
  static propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    request: PropTypes.shape({
      item: PropTypes.shape({
        title: PropTypes.string
      })
    }),
  }

  static contextTypes = {
    intl: PropTypes.shape({
      formatMessage: PropTypes.func,
    })
  }

  constructor(props) {
    super(props);

    this.state = {
      reason: 'itemNeededForCourseReserves',
      notify: false,
    };
  }

  // Not translating. Eventually this will be pulled from a controlled vocab list.
  cancellationReasons = [
    { value: 'itemNeededForCourseReserves', label: 'Item is needed for course reserves' },
    { value: 'cancelledByPatron', label: 'Cancelled at patron\'s request' },
    { value: 'noLongerAvailable', label: 'Item is no longer available' },
    { value: 'other', label: 'Other' },
  ]

  onCancelRequest = () => {
    console.log(this.state); // eslint-disable-line
  }

  onChangeAdditionalInfo = (e) => this.setState({ additionalInfo: e.target.value })

  onChangeNotify = () => this.setState(prevState => ({ notify: !prevState.notify }))

  onChangeReason = (e) => this.setState({ reason: e.target.value })

  render() {
    const { request } = this.props;
    const { reason, notify, additionalInfo } = this.state;
    const { intl: { formatMessage } } = this.context;

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
          dataOptions={this.cancellationReasons}
          value={reason}
          onChange={this.onChangeReason}
        />
        <Checkbox
          id="notify-patron-checkbox"
          label={formatMessage({ id: 'ui-requests.cancel.notifyLabel' })}
          checked={notify}
          onChange={this.onChangeNotify}
        />
        <TextArea
          label={formatMessage(
            { id: 'ui-requests.cancel.additionalInfoLabel' },
            { required: reason === 'other' ? '*' : ' ' }
          )}
          placeholder={
            reason === 'other' ?
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
            disabled={reason === 'other' && !additionalInfo}
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
