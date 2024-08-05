import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import {
  noop,
  omit,
} from 'lodash';

import { Button } from '@folio/stripes/components';

import css from './PrintButton.css';

class PrintButton extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    requestId: PropTypes.string,
    onAfterPrint: PropTypes.func,
    onBeforePrint: PropTypes.func,
    onBeforeGetContent: PropTypes.func,
    contentRef: PropTypes.object,
    disabled: PropTypes.bool,
  };

  static defaultProps = {
    onAfterPrint: noop,
    onBeforePrint: noop,
    onBeforeGetContent: noop,
    contentRef: {},
    disabled: false,
  };

  eventObject = {};

  getContent = () => {
    return this.props.contentRef.current;
  };

  handlePrintBeforeGetContent = () => {
    this.eventObject.event.stopPropagation();
    this.props.onBeforeGetContent();
  }

  handleBeforePrint = () => {
    this.props.onBeforePrint(this.props.requestId);
  }

  renderTriggerButton = () => {
    const fieldsToSkip = ['contentRef', 'onBeforePrint', 'onAfterPrint', 'onBeforeGetContent'];
    const props = omit(this.props, fieldsToSkip);
    const handleClick = (e) => {
      this.eventObject.event = e;
    };

    return (
      <div className={this.props.disabled ? css.disabled : css.enabled}>
        <Button
          {...props}
          onClick={handleClick}
          type="submit"
          bottomMargin0
        >
          {this.props.children}
        </Button>
      </div>
    );
  };

  render() {
    const {
      onAfterPrint,
    } = this.props;

    return (
      <ReactToPrint
        content={this.getContent}
        removeAfterPrint
        trigger={this.renderTriggerButton}
        onAfterPrint={onAfterPrint}
        onBeforePrint={this.handleBeforePrint}
        onBeforeGetContent={this.handlePrintBeforeGetContent}
      />
    );
  }
}

export default PrintButton;
