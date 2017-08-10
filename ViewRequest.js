import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';

import Pane from '@folio/stripes-components/lib/Pane';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';

class ViewRequest extends React.Component {

  constructor(props) {
    super(props);

  }

  render() {
    return (
      <Pane defaultWidth={this.props.paneWidth} paneTitle="Request Detail" dismissible onClose={this.props.onClose}>
      
      </Pane>
    );
  }
}

export default ViewRequest;
