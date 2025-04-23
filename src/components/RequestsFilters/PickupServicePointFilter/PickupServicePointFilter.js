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

const PickupServicePointFilter = ({
  activeValues = [],
  servicePoints = [],
  onChange,
  onClear,
}) => {
  const name = requestFilterTypes.PICKUP_SERVICE_POINT;

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
      data-testid="pickupServicePointAccordion"
      displayClearButton={!isEmpty(activeValues)}
      id={name}
      header={FilterAccordionHeader}
      label={<FormattedMessage id="ui-requests.pickupServicePoint.name" />}
      name={name}
      separator={false}
      onClearFilter={clearFilter}
    >
      <MultiSelectionFilter
        ariaLabelledBy={`accordion-toggle-button-${name}`}
        dataOptions={filterOptions}
        id="req-pickup-service-point-filter"
        name={name}
        onChange={onChange}
        selectedValues={activeValues}
      />
    </Accordion>
  );
};

PickupServicePointFilter.propTypes = {
  activeValues: PropTypes.arrayOf(PropTypes.string),
  servicePoints: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    })
  ),
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
};

export default PickupServicePointFilter;
