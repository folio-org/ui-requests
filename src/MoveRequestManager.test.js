import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';

import '../test/jest/__mock__';

import MoveRequestManager from './MoveRequestManager';
import ItemsDialog from './ItemsDialog';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';
import ErrorModal from './components/ErrorModal';
import { requestTypesMap } from './constants';

const labelIds = {
  requestNotAllowed: 'ui-requests.requestNotAllowed',
};
const testIds = {
  rowButton: 'rowButton',
  confirmButton: 'confirmButton',
  cancelButton: 'cancelButton',
  chooseRequestTypeDialog: 'chooseRequestTypeDialog',
  errorModal: 'errorModal',
  closeErrorModalButton: 'closeErrorModalButton',
};
const movedRequest = {};
const basicProps = {
  onCancelMove: jest.fn(),
  onMove: jest.fn(),
  request: {
    requestType: requestTypesMap.PAGE,
    instanceId: 'instanceId',
    itemId: 'itemId',
    instance: {
      title: 'instanceTitle',
    },
  },
  mutator: {
    move: {
      POST: jest.fn(),
    },
    moveRequest: {
      POST: jest.fn(async () => movedRequest),
    },
  },
};

jest.mock('./ItemsDialog', () => jest.fn(({
  children,
  onRowClick,
}) => {
  const selectedItem = {
    id: 'selectedItemId',
    status: {
      name: 'Checked out',
    },
  };

  return (
    <div>
      <button
        type="button"
        data-testid={testIds.rowButton}
        onClick={() => onRowClick('item', selectedItem)}
      >Click
      </button>
      {children}
    </div>
  );
}));
jest.mock('./ChooseRequestTypeDialog', () => jest.fn(({
  onConfirm,
  onCancel
}) => (
  <div data-testid={testIds.chooseRequestTypeDialog}>
    <button
      type="button"
      data-testid={testIds.cancelButton}
      onClick={onCancel}
    >Cancel
    </button>
    <button
      type="button"
      data-testid={testIds.confirmButton}
      onClick={() => onConfirm({})}
    >Confirm
    </button>
  </div>
)));
jest.mock('./components/ErrorModal', () => jest.fn(({
  label,
  onClose,
}) => (
  <div data-testid={testIds.errorModal}>
    <p>{label}</p>
    <button
      type="button"
      data-testid={testIds.closeErrorModalButton}
      onClick={onClose}
    >Close
    </button>
  </div>
)));

describe('MoveRequestManager', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup();
  });

  describe('Initial rendering', () => {
    beforeEach(() => {
      render(
        <MoveRequestManager
          {...basicProps}
        />
      );
    });

    it('should render "ItemsDialog" with correct props', () => {
      const expectedProps = {
        open: true,
        instanceId: basicProps.request.instanceId,
        title: basicProps.request.instance.title,
        isLoading: false,
        onClose: basicProps.onCancelMove,
        skippedItemId: basicProps.request.itemId,
        onRowClick: expect.any(Function),
      };

      expect(ItemsDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should not render "ChooseRequestTypeDialog"', () => {
      expect(ChooseRequestTypeDialog).not.toHaveBeenCalled();
    });

    it('should not render "ErrorModal"', () => {
      expect(ErrorModal).not.toHaveBeenCalled();
    });
  });

  describe('Request type dialog', () => {
    beforeEach(() => {
      render(
        <MoveRequestManager
          {...basicProps}
        />
      );

      const rowButton = screen.getByTestId(testIds.rowButton);

      fireEvent.click(rowButton);
    });

    it('should render "ChooseRequestTypeDialog" with correct props', async () => {
      const expectedProps = {
        open: true,
        'data-test-choose-request-type-modal': true,
        onConfirm: expect.any(Function),
        onCancel: expect.any(Function),
        isLoading: false,
        item: {
          id: 'selectedItemId',
          status: {
            name: 'Checked out',
          },
        },
      };

      await waitFor(() => expect(ChooseRequestTypeDialog).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {}));
    });

    it('should hide request type dialog after clicking on "Cancel" button', async () => {
      const cancelButton = screen.getByTestId(testIds.cancelButton);
      const chooseRequestTypeDialog = screen.getByTestId(testIds.chooseRequestTypeDialog);

      fireEvent.click(cancelButton);

      await waitFor(() => expect(chooseRequestTypeDialog).not.toBeInTheDocument());
    });

    it('should trigger "moveRequest.POST" after clicking on "Confirm" button', () => {
      const confirmButton = screen.getByTestId(testIds.confirmButton);

      fireEvent.click(confirmButton);

      expect(basicProps.mutator.moveRequest.POST).toHaveBeenCalled();
    });

    it('should trigger "onMove" with correct argument after clicking on "Confirm" button', async () => {
      const confirmButton = screen.getByTestId(testIds.confirmButton);

      fireEvent.click(confirmButton);

      await waitFor(() => expect(basicProps.onMove).toHaveBeenCalledWith(movedRequest));
    });
  });

  describe('Error modal', () => {
    describe('When response content type is "application/json"', () => {
      const error = {
        errors: [
          {
            message: 'Error message',
          }
        ]
      };
      const get = jest.fn(() => 'application/json');
      const json = jest.fn(() => new Promise(res => res(error)));

      beforeEach(() => {
        const props = {
          ...basicProps,
          mutator: {
            ...basicProps.mutator,
            moveRequest: {
              POST: () => {
                const errorToThrow = new Error('message');

                errorToThrow.headers = {
                  get,
                };
                errorToThrow.json = json;

                throw errorToThrow;
              },
            },
          },
        };

        render(
          <MoveRequestManager
            {...props}
          />
        );

        const rowButton = screen.getByTestId(testIds.rowButton);

        fireEvent.click(rowButton);

        const confirmButton = screen.getByTestId(testIds.confirmButton);

        fireEvent.click(confirmButton);
      });

      it('should render "ErrorModal" with correct props', async () => {
        const expectedProps = {
          onClose: expect.any(Function),
          errorMessage: error.errors[0].message,
        };

        await waitFor(() => expect(ErrorModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {}));
      });

      it('should render "ErrorModal" label', async () => {
        const requestNotAllowedLabel = screen.getByText(labelIds.requestNotAllowed);

        await waitFor(() => expect(requestNotAllowedLabel).toBeInTheDocument());
      });

      it('should not render "ChooseRequestTypeDialog"', async () => {
        const chooseRequestTypeDialog = screen.queryByTestId(testIds.chooseRequestTypeDialog);

        await waitFor(() => expect(chooseRequestTypeDialog).not.toBeInTheDocument());
      });

      it('should hide "ErrorModal"', async () => {
        const errorModal = screen.getByTestId(testIds.errorModal);
        const closeErrorModalButton = screen.getByTestId(testIds.closeErrorModalButton);

        fireEvent.click(closeErrorModalButton);

        await waitFor(() => expect(errorModal).not.toBeInTheDocument());
      });

      it('should render "ChooseRequestTypeDialog" after closing error modal', async () => {
        const closeErrorModalButton = screen.getByTestId(testIds.closeErrorModalButton);

        fireEvent.click(closeErrorModalButton);

        const chooseRequestTypeDialog = screen.queryByTestId(testIds.chooseRequestTypeDialog);

        await waitFor(() => expect(chooseRequestTypeDialog).toBeInTheDocument());
      });
    });

    describe('When response content type is not "application/json"', () => {
      const error = 'Test error';
      const get = jest.fn(() => '');
      const text = jest.fn(() => new Promise(res => res(error)));

      beforeEach(() => {
        const props = {
          ...basicProps,
          mutator: {
            ...basicProps.mutator,
            moveRequest: {
              POST: () => {
                const errorToThrow = new Error('message');

                errorToThrow.text = text;
                errorToThrow.headers = {
                  get,
                };

                throw errorToThrow;
              },
            },
          },
        };

        render(
          <MoveRequestManager
            {...props}
          />
        );

        const rowButton = screen.getByTestId(testIds.rowButton);

        fireEvent.click(rowButton);

        const confirmButton = screen.getByTestId(testIds.confirmButton);

        fireEvent.click(confirmButton);
      });

      it('should render "ErrorModal" with correct props', async () => {
        const expectedProps = {
          onClose: expect.any(Function),
          errorMessage: error,
        };

        await waitFor(() => expect(ErrorModal).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {}));
      });
    });
  });
});
