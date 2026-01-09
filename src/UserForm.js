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
  computeUserDisplayForRequest,
  userHighlightBox2,
  isProxyFunctionalityAvailable,
} from './utils';

class UserForm extends React.Component {
  static propTypes = {
    onCloseProxy: PropTypes.func.isRequired,
    onSelectProxy: PropTypes.func.isRequired,
    patronGroup: PropTypes.string,
    proxy: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }),
    stripes: PropTypes.shape({
      connect: PropTypes.func,
    }).isRequired,
    user: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
    }).isRequired,
    isEcsTlrSettingEnabled: PropTypes.bool,
    request: PropTypes.shape({
      requesterId: PropTypes.string,
    }),
  };

  static defaultProps = {
    patronGroup: '',
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
      isEcsTlrSettingEnabled,
    } = this.props;
    const isProxyAvailable = isProxyFunctionalityAvailable(isEcsTlrSettingEnabled);
    const pseudoRequest = {
      ...(request || {}),
      requesterId: user?.id ?? request.requesterId,
      requester: user,
    };
    const isEditable = !!request;
    const isProxyManagerAvailable = isProxyAvailable && !isEditable;

    if (isProxyAvailable && proxy) {
      pseudoRequest.proxyUserId = proxy.id;
      pseudoRequest.proxy = proxy;
    }

    const userDisplay = computeUserDisplayForRequest(pseudoRequest);

    const proxySection = userDisplay.proxy && pseudoRequest.proxyUserId !== pseudoRequest.requesterId
      ? userHighlightBox2(<FormattedMessage id="ui-requests.requester.proxy" />, userDisplay.requesterNameLink, userDisplay.requesterBarcodeLink)
      : null;

    const userSection = userDisplay.proxy
      ? userHighlightBox2(<FormattedMessage id="ui-requests.requester.requester" />, userDisplay.proxy.proxyNameLink, userDisplay.proxy.proxyBarcodeLink)
      : userHighlightBox2(<FormattedMessage id="ui-requests.requester.requester" />, userDisplay.requesterNameLink, userDisplay.requesterBarcodeLink);

    return (
      <div>
        {userSection}
        <Row>
          <Col xs={4}>
            <KeyValue label={<FormattedMessage id="ui-requests.requester.patronGroup.group" />} value={patronGroup || '-'} />
          </Col>
        </Row>

        {proxySection}

        {isProxyManagerAvailable &&
          <this.connectedProxyManager
            patron={user}
            proxy={proxy || {}}
            onSelectPatron={this.props.onSelectProxy}
            onClose={this.props.onCloseProxy}
          /> }
      </div>
    );
  }
}

export default UserForm;
