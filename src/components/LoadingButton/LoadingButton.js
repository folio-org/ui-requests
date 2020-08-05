import React from 'react';
import PropTypes from 'prop-types';

import { Button, Icon } from '@folio/stripes/components';

const LoadingButton = ({ children }) => (
  <Button
    buttonStyle="dropdownItem"
    disabled
  >
    <Icon icon="spinner-ellipsis" width="10px" />
    {children}
  </Button>
);

LoadingButton.propTypes = {
  children: PropTypes.node.isRequired,
};

export default LoadingButton;
