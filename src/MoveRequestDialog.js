import React from 'react';
import PropTypes from 'prop-types';
import { countBy } from 'lodash';
import { FormattedMessage } from 'react-intl';
import {
  Modal,
  ModalFooter,

  Button,
} from '@folio/stripes/components';

class MoveRequestDialog extends React.Component {
  static manifest = {
    holdings: {
      type: 'okapi',
      records: 'holdingsRecords',
      path: 'holdings-storage/holdings',
      accumulate: 'true',
      fetch: false,
    },
    items: {
      type: 'okapi',
      records: 'items',
      path: 'inventory/items',
      accumulate: 'true',
      fetch: false,
    },
    requests: {
      type: 'okapi',
      path: 'circulation/requests',
      records: 'requests',
      accumulate: 'true',
      fetch: false,
    },
  };

  static propTypes = {
    onClose: PropTypes.func,
    open: PropTypes.bool,
    request: PropTypes.object,
    resources: PropTypes.shape({
      holdings: PropTypes.shape({
        records: PropTypes.array,
      }),
      items: PropTypes.shape({
        records: PropTypes.array,
      }),
      requests: PropTypes.shape({
        records: PropTypes.array,
      }),
    }),
    mutator: PropTypes.shape({
      holdings: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      items: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
      requests: PropTypes.shape({
        GET: PropTypes.func.isRequired,
        reset: PropTypes.func.isRequired,
      }),
    }),

  };

  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };
  }

  async componentDidMount() {
    const {
      mutator,
      request: { item: { instanceId } }
    } = this.props;

    let query = `instanceId==${instanceId}`;
    mutator.holdings.reset();
    const holdings = await mutator.holdings.GET({ params: { query } });
    query = holdings.map(h => `holdingsRecordId==${h.id}`).join(' or ');
    const items = await mutator.items.GET({ params: { query } });
    query = items.map(i => `itemId==${i.id}`).join(' or ');
    query = `(${query}) and (status="Open")`;
    const requests = await mutator.requests.GET({ params: { query } });
    const requestMap = countBy(requests, 'itemId');

    items.forEach(item => {
      item.requestCount = requestMap[item.id] || 0;
    });

    this.setState({ items });
  }

  render() {
    const {
      open,
      onClose,
    } = this.props;

    const { items } = this.state;

    const footer = (
      <ModalFooter>
        <Button
          data-test-cancel-move-request
          buttonStyle="primary"
          onClick={onClose}
        >
          <FormattedMessage id="stripes-core.button.back" />
        </Button>
      </ModalFooter>
    );

    return (
      <Modal
        data-test-move-request-modal
        label={<FormattedMessage id="ui-requests.move.selectItem" />}
        open={open}
        onClose={onClose}
        footer={footer}
        dismissible
      >
        <p />
      </Modal>
    );
  }
}

export default MoveRequestDialog;
