import React from 'react';
import PropTypes from 'prop-types';

import {
  checkScope,
  HasCommand,
  expandAllSections,
  collapseAllSections,
} from '@folio/stripes/components';
import { handleKeyCommand } from '../../utils';

const ViewRequestShortcutsWrapper = ({
  children,
  onEdit,
  onDuplicate,
  stripes,
  accordionStatusRef,
  isEditingDisabled,
  isDuplicatingDisabled,
}) => {
  const keyCommands = [
    {
      name: 'edit',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-requests.edit')) onEdit();
      }, { disabled: isEditingDisabled }),
    },
    {
      name: 'duplicateRecord',
      handler: handleKeyCommand(() => {
        if (stripes.hasPerm('ui-requests.create')) onDuplicate();
      }, { disabled: isDuplicatingDisabled }),
    },
    {
      name: 'expandAllSections',
      handler: (e) => expandAllSections(e, accordionStatusRef),
    },
    {
      name: 'collapseAllSections',
      handler: (e) => collapseAllSections(e, accordionStatusRef),
    },
  ];

  return (
    <HasCommand
      commands={keyCommands}
      isWithinScope={checkScope}
      scope={document.body}
    >
      {children}
    </HasCommand>
  );
};

ViewRequestShortcutsWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  accordionStatusRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) })
  ]),
  isEditingDisabled: PropTypes.bool.isRequired,
  isDuplicatingDisabled: PropTypes.bool.isRequired,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default ViewRequestShortcutsWrapper;
