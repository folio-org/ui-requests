import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { PrintButton, PrintContent } from '../index';
import { getSelectedSlipData, isPrintable } from '../../utils';


class SinglePrintButtonForPickSlip extends React.Component {
  render() {
    const { rq, pickSlipsToCheck, pickSlipsPrintTemplate, pickSlipsData, onBeforeGetContentForSinglePrintButton, getPrintContentRef } = this.props;

    return (
      <PrintButton
        id="singlePrintPickSlipsBtn"
        disabled={!isPrintable(rq.id, pickSlipsToCheck)}
        template={pickSlipsPrintTemplate}
        contentRef={getPrintContentRef(rq.id)}
        requestId={rq.id}
        onBeforeGetContent={onBeforeGetContentForSinglePrintButton}
      >
        <FormattedMessage id="ui-requests.requests.printButtonLabel" />

        <PrintContent
          ref={getPrintContentRef(rq.id)}
          template={pickSlipsPrintTemplate}
          dataSource={getSelectedSlipData(pickSlipsData, rq.id)}
        />
      </PrintButton>
    );
  }
}
SinglePrintButtonForPickSlip.propTypes = {
  rq: PropTypes.object.isRequired,
  pickSlipsToCheck: PropTypes.object.isRequired,
  pickSlipsPrintTemplate: PropTypes.object.isRequired,
  pickSlipsData: PropTypes.object.isRequired,
  onBeforeGetContentForSinglePrintButton: PropTypes.func.isRequired,
  getPrintContentRef: PropTypes.object.isRequired
};
export default SinglePrintButtonForPickSlip;
