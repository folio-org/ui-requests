import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { Checkbox } from '@folio/stripes/components';

const CheckboxColumn = ({
  rq,
  selectedRows,
  toggleRowSelection,
}) => {
  const {
    id,
    ...rowData
  } = rq;
  const handleClick = (e) => {
    e.stopPropagation();
  };
  const handleRowSelectionToggle = () => {
    toggleRowSelection({
      id,
      ...rowData
    });
  };

  return (
    <div  // eslint-disable-line jsx-a11y/click-events-have-key-events
      tabIndex="0"
      role="button"
      onClick={handleClick}
    >
      <Checkbox
        checked={Boolean(selectedRows[id])}
        aria-label={<FormattedMessage id="ui-inventory.instances.rows.select" />}
        onChange={handleRowSelectionToggle}
      />
    </div>
  );
};

CheckboxColumn.propTypes = {
  rq: PropTypes.shape({
    id: PropTypes.string.isRequired
  }),
  selectedRows: PropTypes.func.isRequired,
  toggleRowSelection: PropTypes.func.isRequired,
};
export default CheckboxColumn;
