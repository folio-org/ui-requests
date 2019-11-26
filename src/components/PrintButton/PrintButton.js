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
    dataSource: PropTypes.arrayOf(PropTypes.object).isRequired,
    template: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
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
      <React.Fragment>
        <ReactToPrint
          removeAfterPrint
          trigger={this.renderTriggerButton}
          content={this.getContent}
          onBeforePrint={onBeforePrint}
          onAfterPrint={onAfterPrint}
        />
        <div className={css.hiddenContent}>
          <div ref={this.printContentRef}>
            {dataSource.map(source => {
              return (
                <div
                  key={source['request.requestID']}
                  style={{ pageBreakBefore: 'always' }}
                >
                  <ComponentToPrint
                    template={template}
                    dataSource={source}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PrintButton;
