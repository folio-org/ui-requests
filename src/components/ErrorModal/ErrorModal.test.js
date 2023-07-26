import React from 'react';
import {
  render,
  screen,
  fireEvent
} from '@testing-library/react';

import { runAxeTest } from '@folio/stripes-testing';

import '../../../test/jest/__mock__';

import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {
  const closeModal = jest.fn();
  const testIds = {
    errorModal: 'errorModal',
    footerCloseButton: 'footerCloseButton',
  };
  const labelIds = {
    footerMessageId: 'ui-requests.close',
  };
  const baseConfig = {
    onClose: closeModal,
    label: 'Sample label',
    errorMessage: 'Error message',
  };
  const renderComponent = ({
    onClose,
    label,
    errorMessage,
  }) => {
    render(
      <ErrorModal
        onClose={onClose}
        label={label}
        errorMessage={errorMessage}
      />
    );
  };

  beforeEach(() => renderComponent(baseConfig));

  it('should be rendered', () => {
    expect(screen.getByTestId(testIds.errorModal)).toBeInTheDocument();
  });

  it('should render with no axe errors', async () => {
    await runAxeTest({
      rootNode: document.body,
    });
  });

  it('should have corresponding footer message', () => {
    expect(screen.getByText(labelIds.footerMessageId)).toBeInTheDocument();
  });

  it('should have corresponding label', () => {
    expect(screen.getByText(baseConfig.label)).toBeInTheDocument();
  });

  it('should have corresponding error message', () => {
    expect(screen.getByText(baseConfig.errorMessage)).toBeInTheDocument();
  });

  it('should be called after clicking the close button', () => {
    fireEvent.click(screen.getByTestId(testIds.footerCloseButton));

    expect(closeModal).toHaveBeenCalled();
  });
});
