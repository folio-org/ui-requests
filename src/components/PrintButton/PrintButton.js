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
    onBeforeGetContent: PropTypes.func,
    contentRef: PropTypes.object,
  };

  static defaultProps = {
    onAfterPrint: noop,
    onBeforePrint: noop,
    onBeforeGetContent: noop,
  };

  getContent = () => {
    return this.props.contentRef.current;
  };

  renderTriggerButton = () => {
    const fieldsToSkip = ['contentRef', 'onBeforePrint', 'onAfterPrint', 'onBeforeGetContent'];
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
      onBeforeGetContent,
    } = this.props;

    return (
      <ReactToPrint
        content={this.getContent}
        removeAfterPrint
        trigger={this.renderTriggerButton}
        onAfterPrint={onAfterPrint}
        onBeforePrint={onBeforePrint}
        onBeforeGetContent={onBeforeGetContent}
      />
    );
  }
}

export default PrintButton;
