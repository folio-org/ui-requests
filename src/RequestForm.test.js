import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';
import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';

import RequestForm, {
  getRequestInformation,
  getResourceTypeId,
  ID_TYPE_MAP,
} from './RequestForm';
import FulfilmentPreference from './components/FulfilmentPreference';
import RequesterInformation from './components/RequesterInformation';

import {
  REQUEST_LEVEL_TYPES,
  createModes,
  RESOURCE_TYPES, REQUEST_LAYERS,
  REQUEST_FORM_FIELD_NAMES,
  DEFAULT_REQUEST_TYPE_VALUE,
  RESOURCE_KEYS,
  REQUEST_OPERATIONS,
} from './constants';
import {
  getTlrSettings,
  getDefaultRequestPreferences,
  isFormEditing,
  getFulfillmentPreference,
  resetFieldState,
  getRequester,
} from './utils';

const testIds = {
  tlrCheckbox: 'tlrCheckbox',
  instanceInfoSection: 'instanceInfoSection',
  fulfilmentPreferenceField: 'fulfilmentPreferenceField',
  addressFiled: 'addressFiled',
  itemField: 'itemField',
  requesterField: 'requesterField',
  instanceField: 'instanceField',
  selectProxyButton: 'selectProxyButton',
  closeProxyButton: 'closeProxyButton',
  overridePatronButton: 'overridePatronButton',
  closePatronModalButton: 'closePatronModalButton',
  itemDialogCloseButton: 'itemDialogCloseButton',
  itemDialogRow: 'itemDialogRow',
};
const fieldValue = 'value';
const idResourceType = 'id';
const instanceId = 'instanceId';
const item = {
  id: 'itemId',
  barcode: 'itemBarcode',
};

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getTlrSettings: jest.fn(() => ({
    titleLevelRequestsFeatureEnabled: true,
  })),
  getRequestLevelValue: jest.fn(),
  resetFieldState: jest.fn(),
  getDefaultRequestPreferences: jest.fn(),
  isFormEditing: jest.fn(),
  getFulfillmentPreference: jest.fn(),
  getRequester: jest.fn((proxy, selectedUser) => selectedUser),
}));
jest.mock('./components/FulfilmentPreference', () => jest.fn(({
  changeDeliveryAddress,
  onChangeAddress,
}) => {
  const handleFulfilmentPreferences = () => {
    changeDeliveryAddress(true);
  };

  return (
    <>
      <input
        onChange={handleFulfilmentPreferences}
        data-testid={testIds.fulfilmentPreferenceField}
        type="text"
      />
      <input
        onChange={onChangeAddress}
        data-testid={testIds.addressFiled}
        type="text"
      />
    </>
  );
}));
jest.mock('./components/RequesterInformation', () => jest.fn(({
  findUser,
}) => {
  const handleChange = () => {
    findUser(idResourceType, fieldValue, true);
  };

  return (
    <input
      data-testid={testIds.requesterField}
      onChange={handleChange}
      type="text"
    />
  );
}));
jest.mock('./components/RequestInformation', () => jest.fn(() => <div />));
jest.mock('./components/ItemInformation', () => jest.fn(({
  findItem,
  triggerValidation,
}) => {
  const handleChange = () => {
    triggerValidation();
    findItem(idResourceType, fieldValue, true);
  };

  return (
    <input
      data-testid={testIds.itemField}
      onChange={handleChange}
      type="text"
    />
  );
}));
jest.mock('./components/InstanceInformation', () => jest.fn(({
  findInstance,
  triggerValidation,
}) => {
  const handleChange = () => {
    triggerValidation();
    findInstance(instanceId, null, true);
  };

  return (
    <input
      data-testid={testIds.instanceField}
      onChange={handleChange}
      type="text"
    />
  );
}));
jest.mock('@folio/stripes/final-form', () => () => jest.fn((component) => component));
jest.mock('./PatronBlockModal', () => jest.fn(({
  onOverride,
  onClose,
}) => (
  <>
    <button
      data-testid={testIds.overridePatronButton}
      onClick={onOverride}
      type="button"
    >
      Override
    </button>
    <button
      data-testid={testIds.closePatronModalButton}
      onClick={onClose}
      type="button"
    >
      Close
    </button>
  </>
)));
jest.mock('./CancelRequestDialog', () => jest.fn(() => <div />));
jest.mock('./components/TitleInformation', () => jest.fn(() => <div />));
jest.mock('./ItemDetail', () => jest.fn(() => <div />));
jest.mock('./ItemsDialog', () => jest.fn(({
  onClose,
  onRowClick,
}) => {
  const handleRowClick = () => {
    onRowClick({}, item);
  };

  return (
    <>
      <button
        data-testid={testIds.itemDialogRow}
        type="button"
        onClick={handleRowClick}
      >
        Item
      </button>
      <button
        data-testid={testIds.itemDialogCloseButton}
        onClick={onClose}
        type="button"
      >
        Close
      </button>
    </>
  );
}));
jest.mock('./PositionLink', () => jest.fn(() => <div />));

describe('RequestForm', () => {
  const labelIds = {
    tlrCheckbox: 'ui-requests.requests.createTitleLevelRequest',
    instanceInformation: 'ui-requests.instance.information',
    enterButton:'ui-requests.enter',
    requestInfoAccordion: 'ui-requests.requestMeta.information',
    requesterInfoAccordion: 'ui-requests.requester.information',
  };
  const basicProps = {
    onGetPatronManualBlocks: jest.fn(),
    onGetAutomatedPatronBlocks: jest.fn(),
    onSetSelectedInstance: jest.fn(),
    onSetSelectedItem: jest.fn(),
    onSetSelectedUser: jest.fn(),
    onSetInstanceId: jest.fn(),
    onSetIsPatronBlocksOverridden: jest.fn(),
    onSetBlocked: jest.fn(),
    onShowErrorModal: jest.fn(),
    onHideErrorModal: jest.fn(),
    onChangePatron: jest.fn(),
    form: {
      change: jest.fn(),
    },
    handleSubmit: jest.fn(),
    asyncValidate: jest.fn(),
    initialValues: {},
    location: {
      pathname: 'pathname',
    },
    onCancel: jest.fn(),
    parentMutator: {
      proxy: {
        reset: jest.fn(),
        GET: jest.fn(),
      },
    },
    onSubmit: jest.fn(),
    parentResources: {
      patronBlocks: {
        records: [],
      },
      automatedPatronBlocks: {
        isPending: false,
      },
    },
    intl: {
      formatMessage: ({ id }) => id,
    },
    stripes: {
      connect: jest.fn((component) => component),
      store: {
        getState: jest.fn(),
      },
    },
    values: {
      deliveryAddressTypeId: '',
      pickupServicePointId: '',
      createTitleLevelRequest: '',
    },
    findResource: jest.fn(() => new Promise((resolve) => resolve())),
    request: {},
    query: {},
    selectedItem: {},
    selectedUser: {},
    selectedInstance: {},
    isPatronBlocksOverridden: false,
    isErrorModalOpen: false,
    blocked: false,
    optionLists: {
      addressTypes: [
        {
          id: 'addressTypeId',
          addressType: 'Home',
        }
      ],
    },
  };
  const defaultPreferences = {
    defaultServicePointId: 'defaultServicePointId',
    defaultDeliveryAddressTypeId: 'defaultDeliveryAddressTypeId',
  };
  const fulfillmentPreference = {};
  const renderComponent = (passedProps = basicProps) => {
    const history = createMemoryHistory();
    const { rerender } = render(
      <CommandList commands={defaultKeyboardShortcuts}>
        <Router history={history}>
          <RequestForm
            {...passedProps}
          />
        </Router>
      </CommandList>
    );

    return rerender;
  };

  getDefaultRequestPreferences.mockReturnValue(defaultPreferences);
  getFulfillmentPreference.mockReturnValue(fulfillmentPreference);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when `TLR` in enabled', () => {
    describe('when `isEdit` is false', () => {
      beforeEach(() => {
        isFormEditing.mockReturnValue(false);
      });

      describe('Initial render', () => {
        const selectedItem = {
          instanceId: 'instanceId',
          holdingsRecordId: 'holdingsRecordId',
        };
        let findResource;

        beforeEach(() => {
          findResource = jest.fn().mockResolvedValueOnce(null);

          const props = {
            ...basicProps,
            selectedItem,
            findResource,
          };

          renderComponent(props);
        });

        it('should render `TLR` checkbox section', () => {
          const tlrCheckbox = screen.getByTestId(testIds.tlrCheckbox);

          expect(tlrCheckbox).toBeVisible();
        });

        it('should reset instance and item info on TLR checkbox change', () => {
          const expectedArgs = [
            ['item.barcode', null],
            ['instance.hrid', null],
            ['instanceId', null]
          ];
          const tlrCheckbox = screen.getByTestId(testIds.tlrCheckbox);

          fireEvent.click(tlrCheckbox);

          expectedArgs.forEach(args => {
            expect(basicProps.form.change).toBeCalledWith(...args);
          });
        });

        it('should reset selected item', () => {
          const tlrCheckbox = screen.getByTestId(testIds.tlrCheckbox);

          fireEvent.click(tlrCheckbox);

          expect(basicProps.onSetSelectedItem).toHaveBeenCalledWith(undefined);
        });

        it('should get instance information', () => {
          const expectedArgs = [RESOURCE_TYPES.INSTANCE, selectedItem.instanceId];
          const tlrCheckbox = screen.getByTestId(testIds.tlrCheckbox);

          fireEvent.click(tlrCheckbox);

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('`TLR` checkbox handle on first render', () => {
        describe('when only `itemId` is passed in query', () => {
          const props = {
            ...basicProps,
            query: {
              itemId: 'itemId',
            }
          };

          it('should set form `createTitleLevelRequest` value to false', () => {
            const expectedArgs = ['createTitleLevelRequest', false];

            renderComponent(props);

            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        describe('when only `itemBarcode` is passed in query', () => {
          const props = {
            ...basicProps,
            query: {
              itemBarcode: 'itemBarcode',
            }
          };

          it('should set form `createTitleLevelRequest` value to false', () => {
            const expectedArgs = ['createTitleLevelRequest', false];

            renderComponent(props);

            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        describe('when only `instanceId` is passed in query', () => {
          const props = {
            ...basicProps,
            query: {
              instanceId: 'instanceId',
            }
          };

          it('should set form `createTitleLevelRequest` value to true', () => {
            const expectedArgs = ['createTitleLevelRequest', true];

            renderComponent(props);

            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });
      });

      describe('when `TLR` checkbox is checked', () => {
        const props = {
          ...basicProps,
          values: {
            ...basicProps.values,
            createTitleLevelRequest: true,
          },
        };

        beforeEach(() => {
          renderComponent(props);
        });

        it('should render Accordion with `Instance` information', () => {
          const instanceInformation = screen.getByText(labelIds.instanceInformation);

          expect(instanceInformation).toBeVisible();
        });
      });

      describe('when `TLR` checkbox is unchecked', () => {
        const props = {
          ...basicProps,
          values: {
            ...basicProps.values,
            createTitleLevelRequest: false,
          },
        };

        it('should not render Accordion with `Instance` information', () => {
          renderComponent(props);

          const instanceInformation = screen.queryByText(labelIds.instanceInformation);

          expect(instanceInformation).not.toBeInTheDocument();
        });
      });
    });

    describe('when `isEdit` is true', () => {
      const mockedInstance = {
        id: 'instanceId',
        title: 'instanceTitle',
        contributors: 'instanceContributors',
        publication: 'instancePublication',
        editions: 'instanceEditions',
        identifiers: 'instanceIdentifiers',
      };
      const mockedRequest = {
        instance : mockedInstance,
        id : 'testId',
        instanceId : 'instanceId',
        requestType: 'Hold',
        status: 'Open - Awaiting delivery',
      };

      beforeEach(() => {
        isFormEditing.mockReturnValue(true);
      });

      it('should not render `TLR` checkbox section', () => {
        const props = {
          ...basicProps,
          request: mockedRequest,
        };

        renderComponent(props);

        const tlrCheckbox = screen.queryByTestId(testIds.tlrCheckbox);

        expect(tlrCheckbox).not.toBeInTheDocument();
      });
    });
  });

  describe('when `TLR` is disabled', () => {
    beforeEach(() => {
      getTlrSettings.mockReturnValue({
        titleLevelRequestsFeatureEnabled: false,
      });
      renderComponent();
    });

    it('should not display `TLR` checkbox', () => {
      const tlrCheckbox = screen.queryByTestId(testIds.tlrCheckbox);

      expect(tlrCheckbox).not.toBeInTheDocument();
    });

    it('should set form `createTitleLevelRequest` value to false', () => {
      const expectedArgs = ['createTitleLevelRequest', false];

      expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
    });
  });

  describe('when duplicate a request', () => {
    const initialProps = {
      ...basicProps,
      query: {
        mode: createModes.DUPLICATE,
      },
      selectedUser: {
        id: 'userId',
      },
      request: {
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
      },
      initialValues: {
        item: {
          id: 'itemId',
        },
      },
    };
    const findResource = jest.fn().mockResolvedValue({});
    const newProps = {
      ...initialProps,
      selectedInstance: {
        id: 'instanceId',
      },
      selectedItem: null,
      findResource,
    };

    beforeEach(() => {
      const rerender = renderComponent(initialProps);

      isFormEditing.mockReturnValue(false);

      rerender(
        <CommandList commands={defaultKeyboardShortcuts}>
          <Router history={createMemoryHistory()}>
            <RequestForm
              {...newProps}
            />
          </Router>
        </CommandList>
      );
    });

    it('should trigger "findResource" to find request types', () => {
      expect(findResource).toHaveBeenCalledWith(RESOURCE_TYPES.REQUEST_TYPES, {
        [ID_TYPE_MAP.INSTANCE_ID]: newProps.selectedInstance.id,
        requesterId: newProps.selectedUser.id,
        operation: REQUEST_OPERATIONS.CREATE,
      });
    });

    it('should set selected item', () => {
      expect(basicProps.onSetSelectedItem).toHaveBeenCalledWith(initialProps.initialValues.item);
    });

    it('should trigger item barcode field validation', () => {
      const expectedArgs = ['keyOfItemBarcodeField', expect.any(Number)];

      expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
    });
  });

  describe('Request information', () => {
    const requesterId = 'requesterId';

    beforeEach(() => {
      const newProps = {
        ...basicProps,
        query: {
          layer: REQUEST_LAYERS.EDIT,
        },
        request: {
          requestLevel: REQUEST_LEVEL_TYPES.TITLE,
          requester: {},
          requesterId,
          instanceId,
        },
        values: {
          ...basicProps.values,
          requestType: 'requestType',
          createTitleLevelRequest: true,
        },
        selectedUser: {
          id: 'userId',
          personal: {
            addresses: [
              {
                addressTypeId: basicProps.optionLists.addressTypes[0].id,
              }
            ],
          },
        },
      };
      const rerender = renderComponent();

      rerender(
        <CommandList commands={defaultKeyboardShortcuts}>
          <Router history={createMemoryHistory()}>
            <RequestForm
              {...newProps}
            />
          </Router>
        </CommandList>
      );
    });

    it('should render request information accordion', () => {
      const requestInfoAccordion = screen.getByText(labelIds.requestInfoAccordion);

      expect(requestInfoAccordion).toBeInTheDocument();
    });

    it('should trigger "FulfilmentPreference" with provided delivery locations', async () => {
      const expectedProps = {
        deliveryLocations: [
          {
            label: basicProps.optionLists.addressTypes[0].addressType,
            value: basicProps.optionLists.addressTypes[0].id,
          }
        ],
      };

      await waitFor(() => {
        expect(FulfilmentPreference).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    it('should handle changing of address field', async () => {
      const addressField = await screen.findByTestId(testIds.addressFiled);
      const event = {
        target: {
          value: 'selectedAddressTypeId',
        },
      };
      const expectedArgs = [REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, event.target.value];

      fireEvent.change(addressField, event);

      expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
    });

    it('should handle changing of fulfilment preferences field', async () => {
      const fulfilmentPreferenceField = await screen.findByTestId(testIds.fulfilmentPreferenceField);
      const event = {
        target: {
          value: 'fulfilmentPreferences',
        },
      };
      const expectedArgs = [
        [REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, defaultPreferences.defaultDeliveryAddressTypeId],
        [REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, '']
      ];

      fireEvent.change(fulfilmentPreferenceField, event);

      expectedArgs.forEach(args => {
        expect(basicProps.form.change).toHaveBeenCalledWith(...args);
      });
    });

    it('should trigger "form.change" with correct arguments', () => {
      const expectedArgs = [REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE, DEFAULT_REQUEST_TYPE_VALUE];

      expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
    });

    it('should trigger "findResource" with correct arguments', () => {
      const expectedArgs = [
        RESOURCE_TYPES.REQUEST_TYPES,
        {
          [ID_TYPE_MAP.INSTANCE_ID]: instanceId,
          requesterId,
          operation: REQUEST_OPERATIONS.CREATE,
        }
      ];

      expect(basicProps.findResource).toHaveBeenCalledWith(...expectedArgs);
    });
  });

  describe('Requester information', () => {
    const requestPreferencesResult = {
      requestPreferences: [
        {
          delivery: true,
        }
      ],
    };
    const manualBlocks = [
      {
        userId: 'id',
      }
    ];
    const userResult = {
      totalRecords: 1,
      users: [
        {
          id: 'userId',
        }
      ],
    };

    beforeEach(() => {
      isFormEditing.mockReturnValue(false);
      basicProps.onGetPatronManualBlocks.mockReturnValue(manualBlocks);
    });

    describe('When userId is presented', () => {
      const initialUserId = 'userId';
      const updatedUserId = 'updatedUserId';

      describe('Initial rendering', () => {
        const automatedBlocks = [{}];
        const userProxies = [];
        let findResource;

        beforeEach(() => {
          basicProps.onGetAutomatedPatronBlocks.mockReturnValue(automatedBlocks);
          basicProps.parentMutator.proxy.GET.mockResolvedValue(userProxies);
          findResource = jest.fn()
            .mockResolvedValueOnce(userResult)
            .mockResolvedValueOnce(requestPreferencesResult)
            .mockResolvedValue({});

          const props = {
            ...basicProps,
            findResource,
            query: {
              layer: REQUEST_LAYERS.CREATE,
              userId: initialUserId,
            },
          };

          renderComponent(props);
        });

        it('should render requester information accordion', () => {
          const requesterInfoAccordion = screen.getByText(labelIds.requesterInfoAccordion);

          expect(requesterInfoAccordion).toBeInTheDocument();
        });

        it('should reset user related fields', () => {
          const expectedArgs = [
            [REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, undefined],
            [REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, undefined],
            [REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, undefined]
          ];

          expectedArgs.forEach(args => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...args);
          });
        });

        it('should set user related information', () => {
          const expectedArgs = [
            [REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, userResult.users[0].id],
            [REQUEST_FORM_FIELD_NAMES.REQUESTER, userResult.users[0]]
          ];

          expectedArgs.forEach(args => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...args);
          });
        });

        it('should get user data using user id', () => {
          const expectedArgs = [
            RESOURCE_TYPES.USER,
            initialUserId,
            RESOURCE_KEYS.id,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should get manual blocks information', () => {
          expect(basicProps.onGetPatronManualBlocks).toHaveBeenCalledWith(basicProps.parentResources);
        });

        it('should get automated blocks information', () => {
          expect(basicProps.onGetAutomatedPatronBlocks).toHaveBeenCalledWith(basicProps.parentResources);
        });

        it('should change patron information', () => {
          expect(basicProps.onChangePatron).toHaveBeenCalledWith(userResult.users[0]);
        });

        it('should set selected user', () => {
          expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(userResult.users[0]);
        });

        it('should trigger validation of user barcode field', () => {
          const expectedArg = ['keyOfUserBarcodeField', 1];

          expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArg);
        });

        it('should get request preferences data', () => {
          const expectedArgs = [
            'requestPreferences',
            userResult.users[0].id,
            'userId',
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should set fulfilment preference information', async () => {
          const expectedArgs = [
            REQUEST_FORM_FIELD_NAMES.FULFILLMENT_PREFERENCE,
            fulfillmentPreference
          ];

          await waitFor(() => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        it('should set blocked to true', () => {
          expect(basicProps.onSetBlocked).toHaveBeenCalledWith(true);
        });

        it('should set isPatronBlocksOverridden to false', () => {
          expect(basicProps.onSetIsPatronBlocksOverridden).toHaveBeenCalledWith(false);
        });

        it('should set default service point', async () => {
          const expectedArgs = [
            REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID,
            defaultPreferences.defaultServicePointId
          ];

          await waitFor(() => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        it('should reset delivery address type id', async () => {
          const expectedArgs = [
            REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID,
            ''
          ];

          await waitFor(() => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        it('should reset proxy information', () => {
          expect(basicProps.parentMutator.proxy.reset).toHaveBeenCalled();
        });

        it('should get proxy information', () => {
          const expectedArg = {
            params: {
              query: `query=(proxyUserId==${userResult.users[0].id})`,
            },
          };

          expect(basicProps.parentMutator.proxy.GET).toHaveBeenCalledWith(expectedArg);
        });

        it('should handle requester barcode field change', () => {
          const expectedArgs = [RESOURCE_TYPES.USER, fieldValue, RESOURCE_KEYS.id];
          const requesterField = screen.getByTestId(testIds.requesterField);
          const event = {
            target: {
              value: 'value',
            },
          };

          fireEvent.change(requesterField, event);

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('Component updating', () => {
        const findResource = jest.fn(() => Promise.resolve({}));
        const props = {
          ...basicProps,
          query: {
            layer: REQUEST_LAYERS.CREATE,
            userId: initialUserId,
          },
          findResource,
        };
        const newProps = {
          ...basicProps,
          values: {},
          request: {},
          query: {
            layer: REQUEST_LAYERS.CREATE,
            userId: updatedUserId,
          },
          findResource,
        };

        beforeEach(() => {
          const rerender = renderComponent(props);

          rerender(
            <CommandList commands={defaultKeyboardShortcuts}>
              <Router history={createMemoryHistory()}>
                <RequestForm
                  {...newProps}
                />
              </Router>
            </CommandList>
          );
        });

        it('should get user data by user id', () => {
          const expectedArgs = [
            RESOURCE_TYPES.USER,
            updatedUserId,
            RESOURCE_KEYS.id,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('Proxy handling', () => {
        const selectedUser = {
          id: 'userId',
        };
        let findResource;

        beforeEach(() => {
          const automatedBlocks = [];

          findResource = jest.fn()
            .mockResolvedValueOnce(userResult)
            .mockResolvedValueOnce(requestPreferencesResult);
          basicProps.onGetAutomatedPatronBlocks.mockReturnValue(automatedBlocks);
        });

        describe('When user acts as a proxy', () => {
          const proxy = {
            id: 'proxyId',
          };

          beforeEach(() => {
            const props = {
              ...basicProps,
              query: {
                layer: REQUEST_LAYERS.CREATE,
                userId: initialUserId,
              },
              selectedUser,
              findResource,
            };
            const userProxies = [
              {
                ...proxy,
              }
            ];

            RequesterInformation.mockImplementation(({
              onSelectProxy,
              handleCloseProxy,
            }) => {
              const handleSelectProxy = () => {
                onSelectProxy(proxy);
              };

              return (
                <>
                  <button
                    data-testid={testIds.selectProxyButton}
                    type="button"
                    onClick={handleSelectProxy}
                  >
                    Select Proxy
                  </button>
                  <button
                    data-testid={testIds.closeProxyButton}
                    type="button"
                    onClick={handleCloseProxy}
                  >
                    Close Proxy
                  </button>
                </>
              );
            });
            basicProps.parentMutator.proxy.GET.mockResolvedValue(userProxies);

            renderComponent(props);
          });

          it('should set selected user', () => {
            const selectProxyButton = screen.getByTestId(testIds.selectProxyButton);

            fireEvent.click(selectProxyButton);

            expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(selectedUser);
          });

          it('should change requester related fields', () => {
            const expectedArgs = [
              [REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, proxy.id],
              [REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, selectedUser.id]
            ];
            const selectProxyButton = screen.getByTestId(testIds.selectProxyButton);

            fireEvent.click(selectProxyButton);

            expectedArgs.forEach(args => {
              expect(basicProps.form.change).toHaveBeenCalledWith(...args);
            });
          });

          it('should set selected user to null', () => {
            const closeProxyButton = screen.getByTestId(testIds.closeProxyButton);

            fireEvent.click(closeProxyButton);

            expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(null);
          });
        });

        describe('When user acts as himself', () => {
          const proxy = {
            id: selectedUser.id,
          };

          beforeEach(() => {
            const props = {
              ...basicProps,
              query: {
                layer: REQUEST_LAYERS.CREATE,
                userId: initialUserId,
              },
              selectedUser,
              findResource,
            };
            const userProxies = [
              {
                ...proxy,
              }
            ];

            RequesterInformation.mockImplementation(({
              onSelectProxy,
            }) => {
              const handleSelectProxy = () => {
                onSelectProxy(proxy);
              };

              return (
                <>
                  <button
                    data-testid={testIds.selectProxyButton}
                    type="button"
                    onClick={handleSelectProxy}
                  >
                    Select Proxy
                  </button>
                </>
              );
            });
            basicProps.parentMutator.proxy.GET.mockResolvedValue(userProxies);

            renderComponent(props);
          });

          it('should change requester related fields', () => {
            const expectedArgs = [REQUEST_FORM_FIELD_NAMES.REQUESTER_ID, selectedUser.id];
            const selectProxyButton = screen.getByTestId(testIds.selectProxyButton);

            fireEvent.click(selectProxyButton);

            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });
      });
    });

    describe('When userBarcode is presented', () => {
      const initialUserBarcode = 'userBarcode';
      const updatedUserBarcode = 'updatedUserBarcode';

      describe('Initial rendering', () => {
        const automatedBlocks = [];
        const userProxies = [{}];
        let findResource;

        beforeEach(() => {
          basicProps.onGetAutomatedPatronBlocks.mockReturnValue(automatedBlocks);
          basicProps.parentMutator.proxy.GET.mockResolvedValue(userProxies);
          findResource = jest.fn()
            .mockResolvedValueOnce(userResult)
            .mockResolvedValueOnce(requestPreferencesResult);

          const props = {
            ...basicProps,
            query: {
              layer: REQUEST_LAYERS.CREATE,
              userBarcode: initialUserBarcode,
            },
            findResource,
          };

          renderComponent(props);
        });

        it('should reset user related fields', () => {
          const expectedArgs = [
            [REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, undefined],
            [REQUEST_FORM_FIELD_NAMES.DELIVERY_ADDRESS_TYPE_ID, undefined],
            [REQUEST_FORM_FIELD_NAMES.PROXY_USER_ID, undefined]
          ];

          expectedArgs.forEach(args => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...args);
          });
        });

        it('should get user data using barcode', () => {
          const expectedArgs = [
            RESOURCE_TYPES.USER,
            initialUserBarcode,
            RESOURCE_KEYS.barcode,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should not trigger validation of user barcode field', () => {
          const expectedArg = ['keyOfUserBarcodeField', expect.any(Number)];

          expect(basicProps.form.change).not.toHaveBeenCalledWith(...expectedArg);
        });

        it('should not set blocked to true', () => {
          expect(basicProps.onSetBlocked).not.toHaveBeenCalledWith(true);
        });

        it('should not set isPatronBlocksOverridden to false', () => {
          expect(basicProps.onSetIsPatronBlocksOverridden).not.toHaveBeenCalledWith(false);
        });
      });

      describe('Component updating', () => {
        const findResource = jest.fn(() => Promise.resolve({}));
        const props = {
          ...basicProps,
          findResource,
          query: {
            layer: REQUEST_LAYERS.CREATE,
            userBarcode: initialUserBarcode,
          },
        };
        const newProps = {
          ...basicProps,
          findResource,
          query: {
            layer: REQUEST_LAYERS.CREATE,
            userBarcode: updatedUserBarcode,
          },
        };

        beforeEach(() => {
          const rerender = renderComponent(props);

          rerender(
            <CommandList commands={defaultKeyboardShortcuts}>
              <Router history={createMemoryHistory()}>
                <RequestForm
                  {...newProps}
                />
              </Router>
            </CommandList>
          );
        });

        it('should get user data by user barcode', () => {
          const expectedArgs = [
            RESOURCE_TYPES.USER,
            updatedUserBarcode,
            RESOURCE_KEYS.barcode,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });
    });
  });

  describe('Item information', () => {
    describe('When item barcode is presented', () => {
      const initialItemBarcode = 'itemBarcode';
      const updatedItemBarcode = 'updatedItemBarcode';

      describe('Initial render', () => {
        const requestPreferencesResult = {};

        beforeEach(() => {
          isFormEditing.mockReturnValue(true);
        });

        describe('When item is found', () => {
          const event = {
            target: {
              value: 'barcode',
            },
          };
          const itemResult = {
            items: [
              {
                id: 'itemId',
                barcode: initialItemBarcode,
                holdingsRecordId: 'holdingsRecordId',
              }
            ],
          };
          const requestTypesResult = {
            'Page': [
              {
                id: 'id',
                name: 'Circ Desk 1',
              }
            ]
          };
          const loanResult = {
            loans: [
              {
                id: 'loanId',
              }
            ],
          };
          const itemRequestsResult = {
            requests: [],
          };
          const holdingsRecordResult = {
            holdingsRecords: [
              {
                instanceId,
              }
            ],
          };
          let findResource;

          beforeEach(() => {
            findResource = jest.fn()
              .mockResolvedValueOnce(itemResult)
              .mockResolvedValueOnce(requestPreferencesResult)
              .mockResolvedValueOnce(requestTypesResult)
              .mockResolvedValueOnce(loanResult)
              .mockResolvedValueOnce(itemRequestsResult)
              .mockResolvedValueOnce(holdingsRecordResult)
              .mockResolvedValue({});

            const props = {
              ...basicProps,
              selectedUser: {
                id: 'selectedUserId',
              },
              query: {
                itemBarcode: initialItemBarcode,
              },
              request: {
                id: 'requestId',
              },
              findResource,
            };

            renderComponent(props);
          });

          it('should get information about requested item', () => {
            const expectedArgs = [
              RESOURCE_TYPES.ITEM,
              initialItemBarcode,
              RESOURCE_KEYS.barcode
            ];

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should set item information', () => {
            const expectedArgs = [
              [REQUEST_FORM_FIELD_NAMES.ITEM_ID, itemResult.items[0].id],
              [REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, itemResult.items[0].barcode]
            ];

            expectedArgs.forEach(args => {
              expect(basicProps.form.change).toHaveBeenCalledWith(...args);
            });
          });

          it('should reset field state for request type', () => {
            const expectedArgs = [basicProps.form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE];

            expect(resetFieldState).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should get requester information', () => {
            expect(getRequester).toHaveBeenCalled();
          });

          it('should get information about loans', () => {
            const expectedArgs = [
              'loan',
              itemResult.items[0].id
            ];

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should get information about open item requests', () => {
            const expectedArgs = [
              'requestsForItem',
              itemResult.items[0].id
            ];

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should get information about holdings', () => {
            const expectedArgs = [
              RESOURCE_TYPES.HOLDING,
              itemResult.items[0].holdingsRecordId
            ];

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should set instance id', () => {
            expect(basicProps.onSetInstanceId).toHaveBeenCalledWith(holdingsRecordResult.holdingsRecords[0].instanceId);
          });

          it('should handle item barcode field change', () => {
            const expectedArgs = [RESOURCE_TYPES.ITEM, fieldValue, RESOURCE_KEYS.id];
            const itemField = screen.getByTestId(testIds.itemField);

            fireEvent.change(itemField, event);

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should trigger item barcode field validation', () => {
            const expectedArgs = ['keyOfItemBarcodeField', expect.any(Number)];
            const itemField = screen.getByTestId(testIds.itemField);

            fireEvent.change(itemField, event);

            expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
          });
        });

        describe('When item is not found', () => {
          const itemResult = {
            items: [],
          };
          let findResource;

          beforeEach(() => {
            findResource = jest.fn()
              .mockResolvedValueOnce(itemResult)
              .mockResolvedValueOnce(requestPreferencesResult);

            const props = {
              ...basicProps,
              selectedUser: {
                id: 'selectedUserId',
              },
              query: {
                itemBarcode: initialItemBarcode,
              },
              request: {
                id: 'requestId',
              },
              findResource,
            };

            renderComponent(props);
          });

          it('should get information about requested item', () => {
            const expectedArgs = [
              RESOURCE_TYPES.ITEM,
              initialItemBarcode,
              RESOURCE_KEYS.barcode
            ];

            expect(findResource).toHaveBeenCalledWith(...expectedArgs);
          });

          it('should not reset field state for request type', () => {
            const expectedArgs = [basicProps.form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE];

            expect(resetFieldState).not.toHaveBeenCalledWith(...expectedArgs);
          });

          it('should not get request types information', () => {
            const expectedArgs = [RESOURCE_TYPES.REQUEST_TYPES, expect.any(Object)];

            expect(findResource).not.toHaveBeenCalledWith(...expectedArgs);
          });
        });
      });

      describe('Component updating', () => {
        const findResource = jest.fn(() => Promise.resolve());
        const props = {
          ...basicProps,
          query: {
            itemBarcode: initialItemBarcode,
          },
          findResource,
        };
        const newProps = {
          ...basicProps,
          query: {
            itemBarcode: updatedItemBarcode,
          },
          findResource,
        };

        beforeEach(() => {
          const rerender = renderComponent(props);

          rerender(
            <CommandList commands={defaultKeyboardShortcuts}>
              <Router history={createMemoryHistory()}>
                <RequestForm
                  {...newProps}
                />
              </Router>
            </CommandList>
          );
        });

        it('should get item data by item barcode', () => {
          const expectedArgs = [
            RESOURCE_TYPES.ITEM,
            updatedItemBarcode,
            RESOURCE_KEYS.barcode,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });
    });

    describe('When item id is presented', () => {
      const initialItemId = 'itemId';
      const updatedItemId = 'updatedItemId';
      const itemResult = {
        items: [],
      };

      describe('Initial render', () => {
        const findResource = jest.fn().mockResolvedValueOnce(itemResult);
        const props = {
          ...basicProps,
          query: {
            itemId: initialItemId,
          },
          findResource,
        };

        beforeEach(() => {
          renderComponent(props);
        });

        it('should get information about requested item by item id', () => {
          const expectedArgs = [
            RESOURCE_TYPES.ITEM,
            initialItemId,
            RESOURCE_KEYS.id
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('Component updating', () => {
        const findResource = jest.fn().mockResolvedValue(itemResult);
        const props = {
          ...basicProps,
          query: {
            itemId: initialItemId,
          },
          findResource,
        };
        const newProps = {
          ...basicProps,
          query: {
            itemId: updatedItemId,
          },
          findResource,
        };

        beforeEach(() => {
          const rerender = renderComponent(props);

          rerender(
            <CommandList commands={defaultKeyboardShortcuts}>
              <Router history={createMemoryHistory()}>
                <RequestForm
                  {...newProps}
                />
              </Router>
            </CommandList>
          );
        });

        it('should get information about requested item after component updating', () => {
          const expectedArgs = [
            RESOURCE_TYPES.ITEM,
            updatedItemId,
            RESOURCE_KEYS.id
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });
      });
    });
  });

  describe('Instance information', () => {
    const initialInstanceId = 'instanceId';
    const updatedInstanceId = 'updatedInstanceId';

    describe('Initial render', () => {
      describe('When instance is found', () => {
        const event = {
          target: {
            value: 'value',
          },
        };
        const instanceResult = {
          id: initialInstanceId,
          hrid: 'hrid',
        };
        const requestTypesResult = {
          'Page': [
            {
              id: 'id',
              name: 'Circ Desk 1',
            }
          ]
        };
        const instanceRequestsResult = {
          requests: [
            {
              requestLevel: REQUEST_LEVEL_TYPES.ITEM,
            }
          ],
        };
        let findResource;

        beforeEach(() => {
          findResource = jest.fn()
            .mockResolvedValueOnce(instanceResult)
            .mockResolvedValueOnce(requestTypesResult)
            .mockResolvedValue(instanceRequestsResult);

          const props = {
            ...basicProps,
            selectedUser: {
              id: 'selectedUserId',
            },
            query: {
              instanceId: initialInstanceId,
            },
            request: {
              requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            },
            findResource,
          };

          renderComponent(props);
        });

        it('should get information about requested instance', () => {
          const expectedArgs = [
            RESOURCE_TYPES.INSTANCE,
            initialInstanceId,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should set instance information', () => {
          const expectedArgs = [
            [REQUEST_FORM_FIELD_NAMES.INSTANCE_ID, instanceResult.id],
            [REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, instanceResult.hrid]
          ];

          expectedArgs.forEach(args => {
            expect(basicProps.form.change).toHaveBeenCalledWith(...args);
          });
        });

        it('should reset field state for request type', () => {
          const expectedArgs = [basicProps.form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE];

          expect(resetFieldState).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should get requester information', () => {
          expect(getRequester).toHaveBeenCalled();
        });

        it('should get information about open instance requests', () => {
          const expectedArgs = [
            'requestsForInstance',
            instanceResult.id
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should set selected instance', () => {
          expect(basicProps.onSetSelectedInstance).toHaveBeenCalledWith(instanceResult);
        });

        it('should handle instance id field change', () => {
          const expectedArgs = [RESOURCE_TYPES.INSTANCE, instanceId];
          const instanceField = screen.getByTestId(testIds.instanceField);

          fireEvent.change(instanceField, event);

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should trigger instance id field validation', () => {
          const expectedArgs = ['keyOfInstanceIdField', expect.any(Number)];
          const instanceField = screen.getByTestId(testIds.instanceField);

          fireEvent.change(instanceField, event);

          expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
        });
      });

      describe('When instance is not found', () => {
        const instanceResult = {};
        let findResource;

        beforeEach(() => {
          findResource = jest.fn().mockResolvedValueOnce(instanceResult);

          const props = {
            ...basicProps,
            query: {
              instanceId: initialInstanceId,
            },
            findResource,
          };

          renderComponent(props);
        });

        it('should get information about requested instance', () => {
          const expectedArgs = [
            RESOURCE_TYPES.INSTANCE,
            initialInstanceId,
          ];

          expect(findResource).toHaveBeenCalledWith(...expectedArgs);
        });

        it('should not get request types information', () => {
          const expectedArgs = [RESOURCE_TYPES.REQUEST_TYPES, expect.any(Object)];

          expect(findResource).not.toHaveBeenCalledWith(...expectedArgs);
        });

        it('should not reset field state for request type', () => {
          const expectedArgs = [basicProps.form, REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE];

          expect(resetFieldState).not.toHaveBeenCalledWith(...expectedArgs);
        });
      });
    });

    describe('Component updating', () => {
      const findResource = jest.fn(() => Promise.resolve());
      const props = {
        ...basicProps,
        findResource,
        query: {
          instanceId: initialInstanceId,
        },
      };
      const newProps = {
        ...basicProps,
        findResource,
        query: {
          instanceId: updatedInstanceId,
        },
      };

      beforeEach(() => {
        const rerender = renderComponent(props);

        rerender(
          <CommandList commands={defaultKeyboardShortcuts}>
            <Router history={createMemoryHistory()}>
              <RequestForm
                {...newProps}
              />
            </Router>
          </CommandList>
        );
      });

      it('should get information about requested instance after component updating', () => {
        const expectedArgs = [
          RESOURCE_TYPES.INSTANCE,
          updatedInstanceId
        ];

        expect(findResource).toHaveBeenCalledWith(...expectedArgs);
      });
    });
  });

  describe('Patron block modal', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('should set isPatronBlocksOverridden to true', () => {
      const overridePatronButton = screen.getByTestId(testIds.overridePatronButton);

      fireEvent.click(overridePatronButton);

      expect(basicProps.onSetIsPatronBlocksOverridden).toHaveBeenCalledWith(true);
    });

    it('should set blocked to false', () => {
      const closePatronModalButton = screen.getByTestId(testIds.closePatronModalButton);

      fireEvent.click(closePatronModalButton);

      expect(basicProps.onSetBlocked).toHaveBeenCalledWith(false);
    });
  });

  describe('Items dialog', () => {
    beforeEach(() => {
      renderComponent();
    });

    it('should get information about selected item', () => {
      const expectedArgs = [RESOURCE_TYPES.ITEM, item.id, RESOURCE_KEYS.id];
      const itemDialogRow = screen.getByTestId(testIds.itemDialogRow);

      fireEvent.click(itemDialogRow);

      expect(basicProps.findResource).toHaveBeenCalledWith(...expectedArgs);
    });

    it('should reset selected instance', () => {
      const itemDialogCloseButton = screen.getByTestId(testIds.itemDialogCloseButton);

      fireEvent.click(itemDialogCloseButton);

      expect(basicProps.onSetSelectedInstance).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getResourceTypeId', () => {
    it('should return instance id type', () => {
      expect(getResourceTypeId(true)).toBe(ID_TYPE_MAP.INSTANCE_ID);
    });

    it('should return item id type', () => {
      expect(getResourceTypeId(false)).toBe(ID_TYPE_MAP.ITEM_ID);
    });
  });

  describe('getRequestInformation', () => {
    describe('when title level request', () => {
      const selectedInstance = {
        id: 'instanceId',
      };
      const args = [
        {},
        selectedInstance,
        {},
        {
          requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        },
      ];

      it('should return correct data', () => {
        const expectedResult = {
          isTitleLevelRequest: true,
          selectedResource: selectedInstance,
        };

        expect(getRequestInformation(...args)).toEqual(expectedResult);
      });
    });

    describe('when item level request', () => {
      const selectedItem = {
        id: 'itemId',
      };
      const args = [
        {},
        {},
        selectedItem,
        {
          requestLevel: REQUEST_LEVEL_TYPES.ITEM,
        },
      ];

      it('should return correct data', () => {
        const expectedResult = {
          isTitleLevelRequest: false,
          selectedResource: selectedItem,
        };

        expect(getRequestInformation(...args)).toEqual(expectedResult);
      });
    });
  });
});
