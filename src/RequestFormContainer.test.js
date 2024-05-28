import {
  render,
  screen,
  fireEvent,
} from '@folio/jest-config-stripes/testing-library/react';

import RequestFormContainer from './RequestFormContainer';
import RequestForm from './RequestForm';
import {
  REQUEST_LEVEL_TYPES,
  fulfillmentTypeMap,
} from './constants';
import { isMultiDataTenant } from './utils';

jest.mock('./RequestForm', () => jest.fn(() => <div />));
jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  isMultiDataTenant: jest.fn(() => false),
}));

const defaultProps = {
  parentResources: {},
  request: {
    item: {},
    instance: {},
    requester: {},
    requesterId: 'requesterId',
    instanceId: 'instanceId',
    holdingsRecordId: '',
  },
  onSubmit: jest.fn(),
};
const testIds = {
  requestForm: 'requestForm',
};

describe('RequestFormContainer', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial render', () => {
    beforeEach(() => {
      render(
        <RequestFormContainer
          {...defaultProps}
        />
      );
    });

    it('should trigger RequestForm with correct props', () => {
      const expectedProps = {
        parentResources: defaultProps.parentResources,
        request: defaultProps.request,
        blocked: false,
        selectedItem: defaultProps.request.item,
        selectedUser: {
          ...defaultProps.request.requester,
          id: defaultProps.request.requesterId,
        },
        selectedInstance: defaultProps.request.instance,
        isPatronBlocksOverridden: false,
        instanceId: '',
        onGetPatronManualBlocks: expect.any(Function),
        onGetAutomatedPatronBlocks: expect.any(Function),
        onSetBlocked: expect.any(Function),
        onSetSelectedItem: expect.any(Function),
        onSetSelectedUser: expect.any(Function),
        onSetSelectedInstance: expect.any(Function),
        onSetIsPatronBlocksOverridden: expect.any(Function),
        onSetInstanceId: expect.any(Function),
        onSubmit: expect.any(Function),
      };

      expect(RequestForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Submit handling', () => {
    const basicSubmitData = {
      requestExpirationDate: null,
      fulfillmentPreference: null,
      holdShelfExpirationDate: null,
      pickupServicePointId: 'pickupServicePointId',
      deliveryAddressTypeId: 'deliveryAddressTypeId',
      holdingsRecordId: null,
      itemRequestCount: null,
      titleRequestCount: null,
      createTitleLevelRequest: false,
      numberOfReorderableRequests: null,
      instance: null,
      keyOfItemBarcodeField: 0,
      keyOfUserBarcodeField: 0,
      keyOfInstanceIdField: 0,
      keyOfRequestTypeField: 0,
    };
    const requester = {
      personal: {},
    };

    describe('When item level request', () => {
      const requestExpirationDate = new Date().toISOString();
      const submitData = {
        ...basicSubmitData,
        requestLevel: REQUEST_LEVEL_TYPES.ITEM,
        fulfillmentPreference: fulfillmentTypeMap.HOLD_SHELF,
        item: {},
        itemId: 'itemId',
        requester,
        requestExpirationDate,
      };
      const props = {
        ...defaultProps,
        itemId: 'itemId',
        item: {
          id: 'id',
        },
      };
      const selectedItem = {
        holdingsRecordId: 'holdingsRecordId',
      };
      const selectItemLabel = 'Select Item';
      const triggerSubmit = () => {
        RequestForm.mockImplementation(({
          onSubmit,
          onSetSelectedItem,
        }) => (
          <>
            <form
              data-testid={testIds.requestForm}
              onSubmit={() => onSubmit(submitData)}
            />
            <button
              type="button"
              onClick={() => onSetSelectedItem(selectedItem)}
            >
              {selectItemLabel}
            </button>
          </>
        ));

        render(
          <RequestFormContainer
            {...props}
          />
        );

        const selectItemButton = screen.getByText(selectItemLabel);

        fireEvent.click(selectItemButton);
      };

      describe('When single tenant env', () => {
        beforeEach(() => {
          triggerSubmit();
        });

        it('should submit form data', () => {
          const expectedArgs = [
            {
              holdingsRecordId: selectedItem.holdingsRecordId,
              fulfillmentPreference: fulfillmentTypeMap.HOLD_SHELF,
              instanceId: defaultProps.request.instanceId,
              requestLevel: REQUEST_LEVEL_TYPES.ITEM,
              pickupServicePointId: submitData.pickupServicePointId,
              item: submitData.item,
              itemId: submitData.itemId,
              requestExpirationDate,
              requester,
            },
            requester.personal,
          ];
          const requestForm = screen.getByTestId(testIds.requestForm);

          fireEvent.submit(requestForm);

          expect(defaultProps.onSubmit).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('When multi tenant env', () => {
        beforeEach(() => {
          isMultiDataTenant.mockReturnValueOnce(true);
          triggerSubmit();
        });

        it('should submit form data', () => {
          const expectedArgs = [
            {
              fulfillmentPreference: fulfillmentTypeMap.HOLD_SHELF,
              instanceId: defaultProps.request.instanceId,
              requestLevel: REQUEST_LEVEL_TYPES.ITEM,
              pickupServicePointId: submitData.pickupServicePointId,
              itemId: submitData.itemId,
              requestExpirationDate,
            },
            requester.personal,
          ];
          const requestForm = screen.getByTestId(testIds.requestForm);

          fireEvent.submit(requestForm);

          expect(defaultProps.onSubmit).toHaveBeenCalledWith(...expectedArgs);
        });
      });
    });

    describe('When title level request', () => {
      const submitData = {
        ...basicSubmitData,
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
        createTitleLevelRequest: true,
        requester,
      };
      const props = {
        ...defaultProps,
        request: {
          ...defaultProps.request,
          instanceId: null,
        },
      };
      const selectedInstance = {
        id: 'selectedInstanceId',
      };
      const selectInstanceLabel = 'Select Instance';

      beforeEach(() => {
        RequestForm.mockImplementation(({
          onSubmit,
          onSetSelectedInstance,
        }) => (
          <>
            <form
              data-testid={testIds.requestForm}
              onSubmit={() => onSubmit(submitData)}
            />
            <button
              type="button"
              onClick={() => onSetSelectedInstance(selectedInstance)}
            >
              {selectInstanceLabel}
            </button>
          </>
        ));

        render(
          <RequestFormContainer
            {...props}
          />
        );

        const selectInstanceButton = screen.getByText(selectInstanceLabel);

        fireEvent.click(selectInstanceButton);
      });

      it('should submit form data', () => {
        const expectedArgs = [
          {
            fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
            instanceId: selectedInstance.id,
            requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            deliveryAddressTypeId: submitData.deliveryAddressTypeId,
            requester,
          },
          requester.personal,
        ];
        const requestForm = screen.getByTestId(testIds.requestForm);

        fireEvent.submit(requestForm);

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(...expectedArgs);
      });
    });

    describe('When patron blocks set to overridden', () => {
      const submitData = {
        ...basicSubmitData,
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
        createTitleLevelRequest: true,
        requester,
      };
      const overridePatronBlocksLabel = 'Override patron blocks';

      beforeEach(() => {
        RequestForm.mockImplementation(({
          onSubmit,
          onSetIsPatronBlocksOverridden,
        }) => (
          <>
            <form
              data-testid={testIds.requestForm}
              onSubmit={() => onSubmit(submitData)}
            />
            <button
              type="button"
              onClick={() => onSetIsPatronBlocksOverridden(true)}
            >
              {overridePatronBlocksLabel}
            </button>
          </>
        ));

        render(
          <RequestFormContainer
            {...defaultProps}
          />
        );

        const overridePatronBlocksButton = screen.getByText(overridePatronBlocksLabel);

        fireEvent.click(overridePatronBlocksButton);
      });

      it('should submit form data', () => {
        const expectedArgs = [
          {
            fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
            instanceId: defaultProps.request.instanceId,
            requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            deliveryAddressTypeId: submitData.deliveryAddressTypeId,
            requestProcessingParameters: {
              overrideBlocks: {
                patronBlock: {},
              },
            },
            requester,
          },
          requester.personal,
        ];
        const requestForm = screen.getByTestId(testIds.requestForm);

        fireEvent.submit(requestForm);

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(...expectedArgs);
      });
    });

    describe('When patron has blocks', () => {
      const submitData = {
        ...basicSubmitData,
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
        createTitleLevelRequest: true,
      };
      const props = {
        ...defaultProps,
        parentResources: {
          patronBlocks: {
            records: [
              {
                requests: true,
                expirationDate: new Date().toISOString(),
              }
            ],
          },
          automatedPatronBlocks: {
            records: [
              {
                blockRequests: {},
                message: 'block message',
              },
              {
                message: 'block message 2',
              }
            ],
          },
        },
      };

      beforeEach(() => {
        RequestForm.mockImplementation(({
          onSubmit,
        }) => (
          <form
            data-testid={testIds.requestForm}
            onSubmit={() => onSubmit(submitData)}
          />
        ));

        render(
          <RequestFormContainer
            {...props}
          />
        );
      });

      it('should not submit form data', () => {
        const requestForm = screen.getByTestId(testIds.requestForm);

        fireEvent.submit(requestForm);

        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });

    describe('When hold shelf expiration date is presented', () => {
      const holdShelfExpirationTime = new Date().toTimeString();
      const submitData = {
        ...basicSubmitData,
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
        createTitleLevelRequest: true,
        holdShelfExpirationDate: new Date().toDateString(),
        holdShelfExpirationTime,
        requester,
      };

      beforeEach(() => {
        RequestForm.mockImplementation(({
          onSubmit,
        }) => (
          <form
            data-testid={testIds.requestForm}
            onSubmit={() => onSubmit(submitData)}
          />
        ));

        render(
          <RequestFormContainer
            {...defaultProps}
          />
        );
      });

      it('should submit form data', () => {
        const expectedArgs = [
          {
            fulfillmentPreference: fulfillmentTypeMap.DELIVERY,
            instanceId: defaultProps.request.instanceId,
            requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            deliveryAddressTypeId: submitData.deliveryAddressTypeId,
            holdShelfExpirationTime,
            holdShelfExpirationDate: expect.any(String),
            requester,
          },
          requester.personal,
        ];
        const requestForm = screen.getByTestId(testIds.requestForm);

        fireEvent.submit(requestForm);

        expect(defaultProps.onSubmit).toHaveBeenCalledWith(...expectedArgs);
      });
    });
  });
});
