import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import '../test/jest/__mock__';

import { Modal } from '@folio/stripes/components';

import PatronBlockModal from './PatronBlockModal';

const basicProps = {
  open: true,
  onClose: jest.fn(),
  onOverride: jest.fn(),
  viewUserPath: jest.fn(),
  patronBlocks: [
    {
      metadata: {
        updatedDate: '02/02/2023',
      },
    },
    {
      metadata: {
        updatedDate: '03/02/2023',
      },
      desc: 'desc',
    },
    {
      metadata: {
        updatedDate: '04/02/2023',
      },
    },
  ],
  automatedPatronBlocks: ['test'],
};
const labelIds = {
  blockModal: 'ui-requests.blockModal',
  blockedLabel: 'ui-requests.blockedLabel',
  additionalReasons: 'ui-requests.additionalReasons',
  overrideButton: 'ui-requests.override',
  closeButton: 'ui-requests.close',
  detailsButton: 'ui-requests.detailsButton',
};

describe('PatronBlockModal', () => {
  afterEach(cleanup);

  describe('when patron blocks provided', () => {
    beforeEach(() => {
      render(
        <PatronBlockModal {...basicProps} />
      );
    });

    it('should render "Modal" with correct props', () => {
      const expectedProps = {
        open: basicProps.open,
        dismissible: true,
        onClose: basicProps.onClose,
      };

      expect(Modal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render modal label', () => {
      const modalLabel = screen.getByText(labelIds.blockModal);

      expect(modalLabel).toBeVisible();
    });

    it('should render blocked label', () => {
      const blockedLabel = screen.getByText(labelIds.blockedLabel, {
        exact: false,
      });

      expect(blockedLabel).toBeVisible();
    });

    it('should render information from "patronBlocks" prop', () => {
      const patronBlockInfo = screen.getByText(basicProps.patronBlocks[1].desc);

      expect(patronBlockInfo).toBeVisible();
    });

    it('should render information from "automatedPatronBlocks" prop', () => {
      const automatedPatronBlockInfo = screen.getByText(basicProps.automatedPatronBlocks[0]);

      expect(automatedPatronBlockInfo).toBeVisible();
    });

    it('should render additional reasons label', () => {
      const additionalReasonsLabel = screen.getByText(labelIds.additionalReasons);

      expect(additionalReasonsLabel).toBeVisible();
    });

    it('should render override button label', () => {
      const overrideButtonLabel = screen.getByText(labelIds.overrideButton);

      expect(overrideButtonLabel).toBeVisible();
    });

    it('should render close button label', () => {
      const closeButtonLabel = screen.getByText(labelIds.closeButton);

      expect(closeButtonLabel).toBeVisible();
    });

    it('should render details button label', () => {
      const detailsButtonLabel = screen.getByText(labelIds.detailsButton);

      expect(detailsButtonLabel).toBeVisible();
    });

    it('should trigger "onOverride"', () => {
      const overrideButton = screen.getByText(labelIds.overrideButton);

      fireEvent.click(overrideButton);

      expect(basicProps.onOverride).toHaveBeenCalled();
    });

    it('should trigger "onClose"', () => {
      const closeButton = screen.getByText(labelIds.closeButton);

      fireEvent.click(closeButton);

      expect(basicProps.onClose).toHaveBeenCalled();
    });

    it('should trigger "viewUserPath"', () => {
      const detailsButton = screen.getByText(labelIds.detailsButton);

      fireEvent.click(detailsButton);

      expect(basicProps.viewUserPath).toHaveBeenCalled();
    });
  });

  describe('when there are no patron blocks', () => {
    const props = {
      ...basicProps,
      automatedPatronBlocks: [],
      patronBlocks: [],
    };

    beforeEach(() => {
      render(
        <PatronBlockModal {...props} />
      );
    });

    it('should not render additional reasons label', () => {
      const additionalReasonsLabel = screen.queryByText(labelIds.additionalReasons);

      expect(additionalReasonsLabel).toBeNull();
    });
  });
});
