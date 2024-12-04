import React, {
  useCallback,
  useMemo,
} from 'react';
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

const RetrievalServicePointFilter = ({
  activeValues,
  onChange,
  onClear,
}) => {
  const name = requestFilterTypes.RETRIEVAL_SERVICE_POINT;
  const clearFilter = useCallback(() => {
    onClear(name);
  }, [name, onClear]);

  const filterOptions = [];

  return (
    <div>
      <Accordion
        displayClearButton={!isEmpty(activeValues)}
        id={name}
        header={FilterAccordionHeader}
        label={<FormattedMessage id="ui-requests.retrievalServicePoint.name" />}
        name={name}
        separator={false}
        onClearFilter={clearFilter}
      >
        <MultiSelectionFilter
          ariaLabelledBy={`accordion-toggle-button-${name}`}
          dataOptions={filterOptions}
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
