import React, {
  useCallback,
  useMemo,
} from 'react';
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

const EffectiveLocationServicePointFilter = ({
  activeValues,
  servicePoints,
  onChange,
  onClear,
}) => {
  const name = requestFilterTypes.EffLocation_SERVICE_POINT;

  const clearFilter = useCallback(() => {
    onClear(name);
  }, [name, onClear]);

  const filterOptions = useMemo(() => {
    return servicePoints.map(servicePoint => ({
      label: servicePoint.name,
      value: servicePoint.id,
    }));
  }, [servicePoints]);

  return (
    <Accordion
      data-testid="pickupServicePointAccordion1"
      displayClearButton={!isEmpty(activeValues)}
      id={name}
      header={FilterAccordionHeader}
      label="Effective Location Primary Service Point Name"
      name={name}
      separator={false}
      onClearFilter={clearFilter}
    >
      <MultiSelectionFilter
        ariaLabelledBy={`accordion-toggle-button-${name}`}
        dataOptions={filterOptions}
        id="req-pickup-service-point-filter1"
        name={name}
        onChange={onChange}
        selectedValues={activeValues}
      />
    </Accordion>
  );
};

EffectiveLocationServicePointFilter.propTypes = {
  activeValues: PropTypes.arrayOf(PropTypes.string),
  servicePoints: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

EffectiveLocationServicePointFilter.defaultProps = {
  activeValues: [],
  servicePoints: [],
};

export default EffectiveLocationServicePointFilter;
