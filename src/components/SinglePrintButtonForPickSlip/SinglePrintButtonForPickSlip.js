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
  isViewPrintDetailsEnabled,
  onBeforeGetContentForSinglePrintButton,
  onBeforePrintForSinglePrintButton,
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
      isViewPrintDetailsEnabled={isViewPrintDetailsEnabled}
      onBeforeGetContent={onBeforeGetContentForSinglePrintButton}
      onBeforePrint={onBeforePrintForSinglePrintButton}
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
  pickSlipsToCheck: PropTypes.object.isRequired,
  pickSlipsPrintTemplate: PropTypes.object.isRequired,
  pickSlipsData: PropTypes.object.isRequired,
  isViewPrintDetailsEnabled: PropTypes.bool.isRequired,
  onBeforeGetContentForSinglePrintButton: PropTypes.func.isRequired,
  onBeforePrintForSinglePrintButton: PropTypes.func.isRequired,
  getPrintContentRef: PropTypes.object.isRequired,
};

export default SinglePrintButtonForPickSlip;
