import React from 'react';
import {
  render,
  screen,
  within,
  fireEvent,
} from '@testing-library/react';

import '../test/jest/__mock__';

import { Field } from 'redux-form';

import {
  Checkbox,
  TextField,
} from '@folio/stripes/components';

import RequestForm from './RequestForm';
import TitleInformation from './components/TitleInformation';
import ItemDetail from './ItemDetail';

import { REQUEST_LEVEL_TYPES } from './constants';

let mockedTlrSettings;

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getTlrSettings: jest.fn(() => (mockedTlrSettings)),
  getRequestLevelValue: jest.fn(),
}));
jest.mock('@folio/stripes/form', () => () => jest.fn((component) => component));
jest.mock('redux-form', () => ({
  // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
  Field: jest.fn(({ onChange, ...rest }) => <div onClick={onChange} {...rest} />),
  getFormValues: jest.fn((formName) => (state) => state[formName]),
}));
jest.mock('./PatronBlockModal', () => jest.fn(() => null));
jest.mock('./CancelRequestDialog', () => jest.fn(() => null));
jest.mock('./components/TitleInformation', () => jest.fn(() => null));
jest.mock('./ItemDetail', () => jest.fn(() => null));
jest.mock('./PositionLink', () => jest.fn(() => null));

describe('RequestForm', () => {
  const testIds = {
    tlrCheckbox: 'tlrCheckbox',
    instanceInfoSection: 'instanceInfoSection',
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

  const renderComponent = (passedProps = {}) => {
    const {
      mockedRequestForm = {},
      mockedRequest = {},
      mockedQuery = {},
    } = passedProps;

    const props = {
      stripes: {
        connect: jest.fn((component) => component),
        store: {
          getState: jest.fn().mockReturnValue({
            requestForm: mockedRequestForm,
          }),
        },
      },
      change: mockedChangeFunction,
      handleSubmit: jest.fn(),
      asyncValidate: jest.fn(),
      findResource: jest.fn(() => new Promise((resolve) => resolve({}))),
      request: mockedRequest || {},
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
      query: mockedQuery || {},
      onSubmit: jest.fn(),
      parentResources: {
        patronBlocks: {
          records: [],
        },
      },
    };

    render(
      <RequestForm
        {...props}
      />
    );
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
            mockedRequestForm,
          });

          expect(screen.getByText(new RegExp(labelIds.instanceInformation))).toBeVisible();
        });

        it('should render search filed for instance', () => {
          renderComponent({
            mockedRequestForm,
          });

          const instanceSection = screen.getByTestId(testIds.instanceInfoSection);
          const expectedResult = {
            name: 'instance.hrid',
            component: TextField,
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
            mockedRequestForm,
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
          renderComponent({
            mockedRequest: {
              ...mockedRequest,
              item: mockedItem,
              requestLevel: REQUEST_LEVEL_TYPES.ITEM,
            },
          });

          const expectedResult = {
            item: {
              id: mockedRequest.itemId,
              instanceId: mockedRequest.instanceId,
              ...mockedItem,
              ...mockedInstance,
            },
            requestCount: mockedRequest.requestCount,
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
});
