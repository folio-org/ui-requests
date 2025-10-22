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
  isProxyFunctionalityAvailable,
} from './utils';

import {
  UserHighlightBox
} from './components';

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
    const isEditable = !!request;
    const isProxyManagerAvailable = isProxyAvailable && !isEditable;

    const requestUser = { ...user, id : (user?.id ?? request.requesterId) };

    let displayUserId;
    let displayUser;
    if (isProxyAvailable && (request?.proxyUserId || proxy)) {
      displayUserId = request?.proxyUserId;
      displayUser = proxy;
    } else {
      displayUserId = request?.requesterId;
      displayUser = user;
    }

    return (
      <div>
        <UserHighlightBox
          title={<FormattedMessage id="ui-requests.requester.requester" />}
          userId={displayUserId}
          user={displayUser}
        />

        <Row>
          <Col xs={4}>
            <KeyValue label={<FormattedMessage id="ui-requests.requester.patronGroup.group" />} value={patronGroup || '-'} />
          </Col>
        </Row>

        { isProxyAvailable && proxy?.id && proxy.id !== requestUser.id &&
          <UserHighlightBox
            title=<FormattedMessage id="ui-requests.requester.proxy" />
            userId={requestUser.id}
            user={requestUser}
          />
        }

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
