import React from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { PrintButton, PrintContent } from '..';
import { getSelectedSlipData, isPrintable } from '../../utils';

const SinglePrintButtonForPickSlip = ({
  rq,
  pickSlipsToCheck,
  pickSlipsPrintTemplate,
  pickSlipsData,
  onBeforeGetContentForSinglePrintButton,
  getPrintContentRef,
}) => {
  const disabled = !isPrintable(rq.id, pickSlipsToCheck);
  const selectedSlipData = getSelectedSlipData(pickSlipsData, rq.id);

  return (
    <PrintButton
      id="singlePrintPickSlipsBtn"
      disabled={disabled}
      template={pickSlipsPrintTemplate}
      contentRef={getPrintContentRef(rq.id)}
      requestId={rq.id}
      onBeforeGetContent={onBeforeGetContentForSinglePrintButton}
    >
      <FormattedMessage id="ui-requests.requests.printButtonLabel" />
      <PrintContent
        ref={getPrintContentRef(rq.id)}
        template={pickSlipsPrintTemplate}
        dataSource={selectedSlipData}
      />
    </PrintButton>
  );
};

SinglePrintButtonForPickSlip.propTypes = {
  rq: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  pickSlipsToCheck: PropTypes.object.isRequired,
  pickSlipsPrintTemplate: PropTypes.object.isRequired,
  pickSlipsData: PropTypes.object.isRequired,
  onBeforeGetContentForSinglePrintButton: PropTypes.func.isRequired,
  getPrintContentRef: PropTypes.object.isRequired,
};

export default SinglePrintButtonForPickSlip;
