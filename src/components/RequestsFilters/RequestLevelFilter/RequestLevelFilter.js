import React, {
  useCallback,
  useMemo,
} from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';

import {
  Accordion,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import { CheckboxFilter } from '@folio/stripes/smart-components';

import {
  requestFilterTypes,
  requestLevelFilters,
} from '../../../constants';

const RequestLevelFilter = ({
  activeValues = [],
  onChange,
  onClear,
}) => {
  const { formatMessage } = useIntl();
  const name = requestFilterTypes.REQUEST_LEVELS;

  const clearFilter = useCallback(() => {
    onClear(name);
  }, [name, onClear]);

  const filterOptions = useMemo(() => (
    requestLevelFilters.map(({ label, value }) => ({
      label: formatMessage({ id: label }),
      value,
    }))
  ), [formatMessage]);

  return (
    <Accordion
      displayClearButton={!isEmpty(activeValues)}
      id={name}
      data-testid="requestLevelFilter"
      header={FilterAccordionHeader}
      label={formatMessage({ id: 'ui-requests.requestLevel' })}
      name={name}
      separator={false}
      onClearFilter={clearFilter}
    >
      <CheckboxFilter
        dataOptions={filterOptions}
        name={name}
        selectedValues={activeValues}
        onChange={onChange}
      />
    </Accordion>
  );
};

RequestLevelFilter.propTypes = {
  activeValues: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default RequestLevelFilter;
