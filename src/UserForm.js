import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Col,
  KeyValue,
  Row,
} from '@folio/stripes/components';
import { ProxyManager } from '@folio/stripes/smart-components';

import {
  getFullName,
  userHighlightBox,
} from './utils';

class UserForm extends React.Component {
  static propTypes = {
    onCloseProxy: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    patronGroup: PropTypes.string,
    proxy: PropTypes.object,
    stripes: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    request: PropTypes.object,
  };

  static defaultProps = {
    patronGroup: '',
    proxy: {},
  };

  constructor(props) {
    super(props);
    this.connectedProxyManager = props.stripes.connect(ProxyManager);
  }

  render() {
    const {
      user,
      proxy,
      patronGroup,
      request,
    } = this.props;

    const id = user?.id ?? request.requesterId;
    const name = getFullName(user);
    const barcode = user.barcode;
    const isEditable = !!request;

    let proxyName;
    let proxyBarcode;
    let proxyId;
    if (proxy) {
      proxyName = getFullName(proxy);
      proxyBarcode = proxy?.barcode || '-';
      proxyId = proxy.id;
    }

    const proxySection = proxyId && proxyId !== id
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.proxy" />, name, id, barcode)
      : null;

    const userSection = proxyId
      ? userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, proxyName, proxyId, proxyBarcode)
      : userHighlightBox(<FormattedMessage id="ui-requests.requester.requester" />, name, id, barcode);

    return (
      <div>
        {userSection}
        <Row>
          <Col xs={4}>
            <KeyValue label={<FormattedMessage id="ui-requests.requester.patronGroup.group" />} value={patronGroup || '-'} />
          </Col>
        </Row>

        {proxySection}

        { !isEditable &&
          <this.connectedProxyManager
            patron={user}
            proxy={proxy}
            onSelectPatron={this.props.onSelectProxy}
            onClose={this.props.onCloseProxy}
          /> }
      </div>
    );
  }
}

export default UserForm;
