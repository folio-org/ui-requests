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

  eventObject = {};

  getContent = () => {
    return this.props.contentRef.current;
  };

  handlePrintBeforeGetContent = () => {
    this.eventObject.event.stopPropagation();
    this.props.onBeforeGetContent();
  }

  renderTriggerButton = () => {
    const fieldsToSkip = ['contentRef', 'onBeforePrint', 'onAfterPrint', 'onBeforeGetContent'];
    const props = omit(this.props, fieldsToSkip);
    const handleClick = (e) => {
      this.eventObject.event = e;
    };

    return (
      // eslint-disable-next-line react/prop-types
      <div style={{ pointerEvents: this.props.disabled ? 'none' : 'auto' }}>
        <Button {...props} onClick={handleClick} type="submit">
          {this.props.children}
        </Button>
      </div>
    );
  };

  render() {
    const {
      onAfterPrint,
      onBeforePrint
    } = this.props;

    return (
      <ReactToPrint
        content={this.getContent}
        removeAfterPrint
        trigger={this.renderTriggerButton}
        onAfterPrint={onAfterPrint}
        onBeforePrint={onBeforePrint}
        onBeforeGetContent={this.handlePrintBeforeGetContent}
      />
    );
  }
}

export default PrintButton;
