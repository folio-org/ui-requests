import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import {
  noop,
  omit,
} from 'lodash';

import { Button } from '@folio/stripes/components';

class PrintButton extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onAfterPrint: PropTypes.func,
    onBeforePrint: PropTypes.func,
    contentRef: PropTypes.object,
  };

  static defaultProps = {
    onAfterPrint: noop,
    onBeforePrint: noop,
  };

  getContent = () => {
    return this.props.contentRef.current;
  };

  renderTriggerButton = () => {
    const fieldsToSkip = ['contentRef', 'onBeforePrint', 'onAfterPrint'];
    const props = omit(this.props, fieldsToSkip);

    return (
      <Button {...props}>
        {this.props.children}
      </Button>
    );
  };

  render() {
    const {
      onAfterPrint,
      onBeforePrint,
    } = this.props;

    return (
      <ReactToPrint
        content={this.getContent}
        removeAfterPrint
        trigger={this.renderTriggerButton}
        onAfterPrint={onAfterPrint}
        onBeforePrint={onBeforePrint}
      />
    );
  }
}

export default PrintButton;
