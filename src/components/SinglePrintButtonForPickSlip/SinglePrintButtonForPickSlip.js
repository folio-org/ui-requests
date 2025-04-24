import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';

import PrintButton from '../PrintButton';
import PrintContent from '../PrintContent';
import {
  getSelectedSlipData,
  isPrintable,
} from '../../utils';

const SinglePrintButtonForPickSlip = ({
  request,
  pickSlipsToCheck,
  pickSlipsPrintTemplate,
  pickSlipsData,
  onBeforeGetContentForSinglePrintButton,
  onBeforePrintForSinglePrintButton,
  onAfterPrintForSinglePrintButton,
  getPrintContentRef,
}) => {
  const disabled = !isPrintable(request.id, pickSlipsToCheck);
  const selectedSlipData = getSelectedSlipData(pickSlipsData, request.id);

  return (
    <PrintButton
      id="singlePrintPickSlipsButton"
      disabled={disabled}
      contentRef={getPrintContentRef(request.id)}
      requestId={request.id}
      onBeforeGetContent={onBeforeGetContentForSinglePrintButton}
      onBeforePrint={onBeforePrintForSinglePrintButton}
      onAfterPrint={onAfterPrintForSinglePrintButton}
    >
      <FormattedMessage id="ui-requests.requests.printButtonLabel" />
      <PrintContent
        ref={getPrintContentRef(request.id)}
        template={pickSlipsPrintTemplate}
        dataSource={selectedSlipData}
      />
    </PrintButton>
  );
};

SinglePrintButtonForPickSlip.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }),
  pickSlipsToCheck: PropTypes.arrayOf(
    PropTypes.shape({
      request: PropTypes.shape({
        requestID: PropTypes.string,
      }),
    })
  ).isRequired,
  pickSlipsPrintTemplate: PropTypes.string.isRequired,
  pickSlipsData: PropTypes.arrayOf(
    PropTypes.shape({
      request: PropTypes.shape({
        requestID: PropTypes.string,
      }),
    })
  ).isRequired,
  onBeforeGetContentForSinglePrintButton: PropTypes.func.isRequired,
  onBeforePrintForSinglePrintButton: PropTypes.func,
  onAfterPrintForSinglePrintButton: PropTypes.func,
  getPrintContentRef: PropTypes.func.isRequired,
};

export default SinglePrintButtonForPickSlip;
