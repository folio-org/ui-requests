import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  get,
  isEmpty,
  sortBy,
} from 'lodash';

import {
  Accordion,
  AccordionSet,
  FilterAccordionHeader,
} from '@folio/stripes/components';
import {
  CheckboxFilter,
  MultiSelectionFilter,
} from '@folio/stripes/smart-components';

import {
  requestFilterTypes,
  requestStatusFilters,
  requestTypeFilters,
} from '../../constants';

export default class RequestsFilters extends React.Component {
  static propTypes = {
    activeFilters: PropTypes.objectOf(PropTypes.array).isRequired,
    resources: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
  };

  transformRequestFilterOptions = (source = []) => {
    return source.map(({ label, value }) => ({
      label: <FormattedMessage id={label} />,
      value,
    }));
  };

  transformTagsOptions = () => {
    const tags = get(this.props.resources, 'tags.records', [])
      .map(({ label }) => ({ label, value: label }));

    return sortBy(tags, 'label');
  };

  render() {
    const {
      activeFilters: {
        tags = [],
        requestType = [],
        requestStatus = [],
      },
      onChange,
      onClear,
    } = this.props;

    return (
      <AccordionSet>
        <Accordion
          displayClearButton={!isEmpty(requestType)}
          id={requestFilterTypes.REQUEST_TYPE}
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-requests.requestMeta.type" />}
          name={requestFilterTypes.REQUEST_TYPE}
          separator={false}
          onClearFilter={() => onClear(requestFilterTypes.REQUEST_TYPE)}
        >
          <CheckboxFilter
            dataOptions={this.transformRequestFilterOptions(requestTypeFilters)}
            name={requestFilterTypes.REQUEST_TYPE}
            selectedValues={requestType}
            onChange={onChange}
          />
        </Accordion>
        <Accordion
          displayClearButton={!isEmpty(requestStatus)}
          id={requestFilterTypes.REQUEST_STATUS}
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-requests.requestMeta.status" />}
          name={requestFilterTypes.REQUEST_STATUS}
          separator={false}
          onClearFilter={() => onClear(requestFilterTypes.REQUEST_STATUS)}
        >
          <CheckboxFilter
            dataOptions={this.transformRequestFilterOptions(requestStatusFilters)}
            name={requestFilterTypes.REQUEST_STATUS}
            selectedValues={requestStatus}
            onChange={onChange}
          />
        </Accordion>
        <Accordion
          displayClearButton={!isEmpty(tags)}
          id={requestFilterTypes.TAGS}
          header={FilterAccordionHeader}
          label={<FormattedMessage id="ui-requests.requestMeta.tags" />}
          name={requestFilterTypes.TAGS}
          separator={false}
          onClearFilter={() => onClear(requestFilterTypes.TAGS)}
        >
          <MultiSelectionFilter
            dataOptions={this.transformTagsOptions()}
            name={requestFilterTypes.TAGS}
            selectedValues={tags}
            onChange={onChange}
            ariaLabelledBy={requestFilterTypes.TAGS}
          />
        </Accordion>
      </AccordionSet>
    );
  }
}
