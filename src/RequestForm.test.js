import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import {
  render,
  screen,
  within,
  fireEvent,
} from '@testing-library/react';

import '../test/jest/__mock__';

import { Field } from 'react-final-form';

import {
  Checkbox,
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';

import RequestForm, {
  getRequestInformation,
  getResourceTypeId,
  ID_TYPE_MAP,
} from './RequestForm';
import TitleInformation from './components/TitleInformation';
import FulfilmentPreference from './components/FulfilmentPreference';
import ItemDetail from './ItemDetail';

import {
  REQUEST_LEVEL_TYPES,
  createModes,
  RESOURCE_TYPES, REQUEST_LAYERS,
  REQUEST_FORM_FIELD_NAMES,
  DEFAULT_REQUEST_TYPE_VALUE,
} from './constants';

let mockedTlrSettings;

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getTlrSettings: jest.fn(() => (mockedTlrSettings)),
  getRequestLevelValue: jest.fn(),
}));
jest.mock('./components/FulfilmentPreference', () => jest.fn(() => null));
jest.mock('@folio/stripes/final-form', () => () => jest.fn((component) => component));
jest.mock('react-final-form', () => ({
  ...jest.requireActual('react-final-form'),
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  Field: jest.fn(({ onChange, ...rest }) => <div onClick={onChange} {...rest} />),
}));
jest.mock('./PatronBlockModal', () => jest.fn(() => null));
jest.mock('./CancelRequestDialog', () => jest.fn(() => null));
jest.mock('./components/TitleInformation', () => jest.fn(() => null));
jest.mock('./ItemDetail', () => jest.fn(() => null));
jest.mock('./ItemsDialog', () => jest.fn(() => null));
jest.mock('./PositionLink', () => jest.fn(() => null));
jest.mock('./UserForm', () => jest.fn(({
  onChangeAddress,
  onChangeFulfillment,
}) => (
  <>
    <input
      data-testid="fulfillmentInput"
      onChange={onChangeFulfillment}
    />
    <input
      data-testid="addressInput"
      onChange={onChangeAddress}
    />
  </>
)));

describe('RequestForm', () => {
  const testIds = {
    tlrCheckbox: 'tlrCheckbox',
    instanceInfoSection: 'instanceInfoSection',
    fulfillmentInput: 'fulfillmentInput',
    addressInput: 'addressInput'
  };
  const labelIds = {
    tlrCheckbox: 'ui-requests.requests.createTitleLevelRequest',
    instanceInformation: 'ui-requests.instance.information',
    enterButton:'ui-requests.enter',
  };
  const fieldCallOrder = {
    tlrCheckbox: 1,
    instanceHrid: 2,
  };
  const mockedChangeFunction = jest.fn();
  const findResourceMock = jest.fn(() => new Promise((resolve) => resolve()));
  const valuesMock = {
    deliveryAddressTypeId: '',
    pickupServicePointId: '',
    createTitleLevelRequest: '',
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
    form: {
      change: mockedChangeFunction,
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
    },
    intl: {
      formatMessage: ({ id }) => id,
    },
    stripes: {
      connect: jest.fn((component) => component),
    },
  };

  const renderComponent = (passedProps = {}) => {
    const {
      mockedRequestForm = {},
      mockedRequest = {},
      mockedQuery = {},
      history = createMemoryHistory(),
      values = valuesMock,
      selectedItem,
      selectedUser = { id: 'id' },
      selectedInstance,
      isPatronBlocksOverridden = false,
      isErrorModalOpen = false,
      instanceId = '',
      blocked = false,
    } = passedProps;

    const props = {
      ...basicProps,
      stripes: {
        ...basicProps.stripes,
        store: {
          getState: jest.fn().mockReturnValue({
            requestForm: mockedRequestForm,
          }),
        },
      },
      values,
      findResource: findResourceMock,
      request: mockedRequest,
      query: mockedQuery,
      selectedItem,
      selectedUser,
      selectedInstance,
      isPatronBlocksOverridden,
      isErrorModalOpen,
      instanceId,
      blocked,
    };

    const { rerender } = render(
      <CommandList commands={defaultKeyboardShortcuts}>
        <Router history={history}>
          <RequestForm
            {...props}
          />
        </Router>
      </CommandList>
    );

    return rerender;
  };

  afterEach(() => {
    Field.mockClear();
    mockedChangeFunction.mockClear();
  });

  describe('when `TLR` in enabled', () => {
    beforeAll(() => {
      mockedTlrSettings = {
        titleLevelRequestsFeatureEnabled: true,
      };
    });

    describe('when `isEdit` is false', () => {
      it('should render `TLR` checkbox section', () => {
        renderComponent();

        expect(screen.getByTestId(testIds.tlrCheckbox)).toBeVisible();
      });

      it('should execute `TLR`checkbox Field with passed props', () => {
        renderComponent();

        const expectedResult = {
          name: 'createTitleLevelRequest',
          type: 'checkbox',
          label: labelIds.tlrCheckbox,
          component: Checkbox,
          disabled: false,
        };

        expect(Field).toHaveBeenNthCalledWith(
          fieldCallOrder.tlrCheckbox,
          expect.objectContaining(expectedResult),
          {},
        );
      });

      it('should reset instance and item info on TLR checkbox change', () => {
        renderComponent();

        fireEvent.click(screen.getByTestId(testIds.tlrCheckbox));

        expect(mockedChangeFunction).toBeCalledWith('item.barcode', null);
        expect(mockedChangeFunction).toBeCalledWith('instance.hrid', null);
        expect(mockedChangeFunction).toBeCalledWith('instanceId', null);
      });

      describe('`TLR` checkbox handle on first render', () => {
        describe('when only `itemId` is passed in query', () => {
          const mockedQuery = {
            itemId: 'itemId',
          };

          it('should set form `createTitleLevelRequest` value to false', () => {
            renderComponent({
              mockedQuery,
            });

            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
          });
        });

        describe('when only `itemBarcode` is passed in query', () => {
          const mockedQuery = {
            itemBarcode: 'itemBarcode',
          };

          it('should set form `createTitleLevelRequest` value to false', () => {
            renderComponent({
              mockedQuery,
            });

            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
          });
        });

        describe('when only `instanceId` is passed in query', () => {
          const mockedQuery = {
            instanceId: 'instanceId',
          };

          it('should set form `createTitleLevelRequest` value to true', () => {
            renderComponent({
              mockedQuery,
            });

            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', true);
          });
        });
      });

      describe('when `TLR` checkbox is checked', () => {
        const mockedRequestForm = {
          createTitleLevelRequest: true,
        };

        it('should render Accordion with `Instance` information', () => {
          renderComponent({
            values: mockedRequestForm,
          });

          expect(screen.getByText(new RegExp(labelIds.instanceInformation))).toBeVisible();
        });

        it('should render search filed for instance', () => {
          renderComponent({
            values: mockedRequestForm,
          });

          const instanceSection = screen.getByTestId(testIds.instanceInfoSection);
          const expectedResult = {
            name: 'instance.hrid',
            children: expect.any(Function),
            validateFields: [],
            validate: expect.any(Function),
          };

          expect(Field).toHaveBeenNthCalledWith(fieldCallOrder.instanceHrid, expect.objectContaining(expectedResult), {});
          expect(within(instanceSection).getByText(labelIds.enterButton)).toBeVisible();
        });
      });

      describe('when `TLR` checkbox is unchecked', () => {
        const mockedRequestForm = {
          createTitleLevelRequest: false,
        };

        it('should not render Accordion with `Instance` information', () => {
          renderComponent({
            values: mockedRequestForm,
          });

          expect(screen.queryByText(new RegExp(labelIds.instanceInformation))).not.toBeInTheDocument();
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

      it('should not render `TLR` checkbox section', () => {
        renderComponent({
          mockedRequest,
        });

        expect(screen.queryByTestId(testIds.tlrCheckbox)).not.toBeInTheDocument();
      });

      describe('when `Title level` request is editing', () => {
        it('should execute `TitleInformation` with passed props', () => {
          renderComponent({
            mockedRequest: {
              ...mockedRequest,
              requestLevel: REQUEST_LEVEL_TYPES.TITLE,
            },
            selectedInstance: mockedInstance,
          });

          const expectedResult = {
            instanceId: mockedInstance.id,
            titleLevelRequestsCount: mockedRequest.position,
            title: mockedInstance.title,
            contributors: mockedInstance.contributors,
            publications: mockedInstance.publication,
            editions: mockedInstance.editions,
            identifiers: mockedInstance.identifiers,
          };

          expect(TitleInformation).toHaveBeenCalledWith(expectedResult, {});
        });
      });

      describe('when `Item level` request is editing', () => {
        const mockedItem = {
          barcode: 'itemBarcode',
        };


        it('should execute `ItemDetail` with passed props', () => {
          const newMockedRequest = {
            ...mockedRequest,
            item: mockedItem,
            requestLevel: REQUEST_LEVEL_TYPES.ITEM,
          };

          renderComponent({
            mockedRequest: newMockedRequest,
            selectedItem: mockedItem,
          });

          const expectedResult = {
            request: newMockedRequest,
            item: mockedItem,
          };

          expect(ItemDetail).toHaveBeenCalledWith(expect.objectContaining(expectedResult), {});
        });
      });
    });
  });

  describe('when `TLR` is disabled', () => {
    beforeAll(() => {
      mockedTlrSettings = {
        titleLevelRequestsFeatureEnabled: false,
      };
    });

    it('should not display `TLR` checkbox', () => {
      render(
        renderComponent()
      );

      expect(screen.queryByTestId(testIds.tlrCheckbox)).not.toBeInTheDocument();
    });

    it('should set form `createTitleLevelRequest` value to false', () => {
      render(
        renderComponent()
      );

      expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
    });
  });

  describe('when duplicate a request', () => {
    const props = {
      mockedQuery: {
        mode: createModes.DUPLICATE,
      },
      selectedUser: {
        id: 'userId',
      },
      mockedRequest: {
        requestLevel: REQUEST_LEVEL_TYPES.TITLE,
      },
    };
    beforeEach(() => {
      mockedTlrSettings = {
        titleLevelRequestsFeatureEnabled: true,
      };
    });

    it('should trigger "findResource" to find request types', () => {
      const newProps = {
        ...basicProps,
        selectedInstance: {
          id: 'instanceId',
        },
        query: {
          mode: createModes.DUPLICATE,
        },
        selectedUser: {
          id: 'userId',
        },
        request: {
          requestLevel: REQUEST_LEVEL_TYPES.TITLE,
        },
        values: valuesMock,
        findResource: findResourceMock,
      };
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

      expect(findResourceMock).toHaveBeenCalledWith(RESOURCE_TYPES.REQUEST_TYPES, {
        [ID_TYPE_MAP.INSTANCE_ID]: newProps.selectedInstance.id,
        requesterId: newProps.selectedUser.id,
      });
    });
  });

  describe('User information', () => {
    const instanceId = 'instanceId';
    const requesterId = 'requesterId';

    beforeEach(() => {
      mockedTlrSettings = {
        titleLevelRequestsFeatureEnabled: true,
      };

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
          ...valuesMock,
          requestType: 'requestType',
          createTitleLevelRequest: true,
        },
        findResource: findResourceMock,
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

    it('should trigger "FulfilmentPreference"', () => {
      expect(FulfilmentPreference).toHaveBeenCalled();
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
        }
      ];

      expect(findResourceMock).toHaveBeenCalledWith(...expectedArgs);
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
