import React from 'react';
import PropTypes from 'prop-types';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
import { hot } from 'react-hot-loader';
import { FormattedMessage } from 'react-intl';
import Requests from './Requests';

class RequestsRouting extends React.Component {
  static propTypes = {
    stripes: PropTypes.shape({
      connect: PropTypes.func.isRequired,
    }).isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.connectedApp = props.stripes.connect(Requests);
  }

  NoMatch() {
    return (
      <div>
        <h2><FormattedMessage id="ui-requests.routingErrorOops" /></h2>
        <p>
          <FormattedMessage
            id="ui-requests.routingError"
            values={{ pathname: <tt>{this.props.location.pathname}</tt> }}
          />
        </p>
      </div>
    );
  }

  render() {
    return (
      <Switch>
        <Route
          path={this.props.match.path}
          render={() => <this.connectedApp {...this.props} />}
        />
        <Route component={() => { this.NoMatch(); }} />
      </Switch>
    );
  }
}

export default hot(module)(RequestsRouting);
