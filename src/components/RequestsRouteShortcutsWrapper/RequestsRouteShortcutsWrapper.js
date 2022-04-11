import React from 'react';
import PropTypes from 'prop-types';

import {
  checkScope,
  HasCommand,
} from '@folio/stripes/components';
import { handleKeyCommand } from '../../utils';

const RequestsRouteShortcutsWrapper = ({
  children,
  history,
  location,
  stripes,
}) => {
  const focusSearchField = () => {
    const searchInput = document.querySelector('#input-request-search');
    const openSearchBtn = document.querySelector('.noResultsMessageButton---itbez');
    if (searchInput) {
      searchInput.focus();
    } else if (openSearchBtn) {
      openSearchBtn.click();
    }
  };

  const keyCommands = [
    {
      name: 'new',
      handler: handleKeyCommand(() => {
        if (stripes?.hasPerm('ui-requests.create')) history.push(`${location.pathname}?layer=create`);
      }),
    },
    {
      name: 'search',
      handler: handleKeyCommand(focusSearchField),
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

RequestsRouteShortcutsWrapper.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.func,
  ]).isRequired,
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  location: PropTypes.oneOfType([
    PropTypes.shape({
      search: PropTypes.string.isRequired,
      pathname: PropTypes.string.isRequired,
    }).isRequired,
    PropTypes.string.isRequired,
  ]).isRequired,
  stripes: PropTypes.shape({
    hasPerm: PropTypes.func.isRequired,
  }).isRequired,
};

export default RequestsRouteShortcutsWrapper;
