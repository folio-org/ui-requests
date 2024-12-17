import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import {
  MultiSelectionFilter,
} from '@folio/stripes/smart-components';

import {
  requestFilterTypes,
} from '../../../constants';

import { useRetrievalServicePoints } from '../../../hooks';

const RetrievalServicePointFilter = ({
  activeValues,
  onChange,
  onClear,
}) => {
  const name = requestFilterTypes.RETRIEVAL_SERVICE_POINT;
  const clearFilter = useCallback(() => {
    onClear(name);
  }, [name, onClear]);

  const { retrievalSPsOptions } = useRetrievalServicePoints();

  return (
    <div>
      <Accordion
        data-testid="retrievalServicePointAccordion"
        displayClearButton={!isEmpty(activeValues)}
        id={name}
        header={FilterAccordionHeader}
        label={<FormattedMessage id="ui-requests.requests.retrievalServicePoint" />}
        name={name}
        separator={false}
        onClearFilter={clearFilter}
      >
        <MultiSelectionFilter
          ariaLabelledBy={`accordion-toggle-button-${name}`}
          dataOptions={retrievalSPsOptions}
          id="req-retrieval-service-point-filter"
          name={name}
          onChange={onChange}
          selectedValues={activeValues}
        />
      </Accordion>
    </div>
  );
};

RetrievalServicePointFilter.propTypes = {
  activeValues: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};
export default RetrievalServicePointFilter;
