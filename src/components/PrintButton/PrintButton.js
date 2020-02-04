import React from 'react';
import PropTypes from 'prop-types';
import ReactToPrint from 'react-to-print';
import {
  noop,
  omit,
} from 'lodash';

import { Button } from '@folio/stripes/components';

import ComponentToPrint from '../ComponentToPrint';

import css from './PrintButton.css';

class PrintButton extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
    template: PropTypes.string.isRequired,
    onAfterPrint: PropTypes.func,
    onBeforePrint: PropTypes.func,
  };

  static defaultProps = {
    onAfterPrint: noop,
    onBeforePrint: noop,
  };

  printContentRef = React.createRef();

  getContent = () => {
    return this.printContentRef.current;
  };

  renderTriggerButton = () => {
    const filedsToSkip = ['dataSource', 'template', 'onBeforePrint', 'onAfterPrint'];
    const props = omit(this.props, filedsToSkip);

    return (
      <Button {...props}>
        {this.props.children}
      </Button>
    );
  };

  render() {
    const {
      dataSource,
      template,
      onAfterPrint,
      onBeforePrint,
    } = this.props;

    return (
      <>
        <ReactToPrint
          content={this.getContent}
          removeAfterPrint
          trigger={this.renderTriggerButton}
          onAfterPrint={onAfterPrint}
          onBeforePrint={onBeforePrint}
        />
        <div className={css.hiddenContent}>
          <div ref={this.printContentRef}>
            {dataSource.map(source => (
              <div
                key={source['request.requestID']}
                style={{ pageBreakAfter: 'always' }}
              >
                <ComponentToPrint
                  dataSource={source}
                  template={template}
                />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }
}

export default PrintButton;
