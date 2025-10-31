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

import UserHighlightBox from './components/UserHighlightBox';
import {
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
      isEcsTlrSettingEnabled,
    } = this.props;
    const isProxyAvailable = isProxyFunctionalityAvailable(isEcsTlrSettingEnabled);
    const id = user?.id ?? request.requesterId;
    const isEditable = !!request;
    const isProxyManagerAvailable = isProxyAvailable && !isEditable;

    let proxyId;
    if (isProxyAvailable && proxy) {
      proxyId = proxy.id;
    }

    const proxySection = proxyId && proxyId !== id
      ? <UserHighlightBox
        title={<FormattedMessage id="ui-requests.requester.proxy" />}
        userId={id}
        user={user}
      />
      : null;

    const userSection = proxyId
      ? <UserHighlightBox
        title={<FormattedMessage id="ui-requests.requester.requester" />}
        userId={proxyId}
        user={proxy}
      />
      : <UserHighlightBox
        title={<FormattedMessage id="ui-requests.requester.requester" />}
        userId={id}
        user={user}
      />;

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
            proxy={proxy}
            onSelectPatron={this.props.onSelectProxy}
            onClose={this.props.onCloseProxy}
          /> }
      </div>
    );
  }
}

export default UserForm;
