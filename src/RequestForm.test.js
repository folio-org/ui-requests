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

const mockedTlrSettings = { titleLevelRequestsFeatureEnabled: true };

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
  const mockedRequestForm = {
    createTitleLevelRequest: true,
  };
  const mockedRequest = {
    id: null,
    instance: null,
    instanceId: null,
    requestLevel: null,
    position: 'test',
    item: null,
    itemId: null,
    requestCount: 'requestCount',
  };
  const mockedQuery = {
    itemId: null,
    itemBarcode: null,
    instanceId: null,
  };
  const mockedChangeFunction = jest.fn();
  const defaultProps = {
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
    request: mockedRequest,
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
    query: mockedQuery,
    onSubmit: jest.fn(),
    parentResources: {
      patronBlocks: {
        records: [],
      },
    },
  };

  beforeEach(() => {
    render(
      <RequestForm
        {...defaultProps}
      />
    );
  });

  afterEach(() => {
    Field.mockClear();
    mockedChangeFunction.mockClear();
  });

  describe('when `TLR` in enabled', () => {
    beforeAll(() => {
      mockedTlrSettings.titleLevelRequestsFeatureEnabled = true;
    });

    describe('when `isEdit` is false', () => {
      beforeAll(() => {
        mockedRequest.id = null;
      });

      it('should render `TLR` checkbox section', () => {
        expect(screen.getByTestId(testIds.tlrCheckbox)).toBeVisible();
      });

      it('should execute `TLR`checkbox Field with passed props', () => {
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
        fireEvent.click(screen.getByTestId(testIds.tlrCheckbox));

        expect(mockedChangeFunction).toBeCalledWith('item.barcode', null);
        expect(mockedChangeFunction).toBeCalledWith('instance.hrid', null);
        expect(mockedChangeFunction).toBeCalledWith('instanceId', null);
      });

      describe('`TLR` checkbox handle on first render', () => {
        afterAll(() => {
          mockedQuery.itemId = null;
          mockedQuery.itemBarcode = null;
          mockedQuery.instanceId = null;
        });

        describe('when only `itemId` is passed in query', () => {
          beforeAll(() => {
            mockedQuery.itemId = 'itemId';
            mockedQuery.itemBarcode = null;
            mockedQuery.instanceId = null;
          });

          it('should set form `createTitleLevelRequest` value to false', () => {
            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
          });
        });

        describe('when only `itemBarcode` is passed in query', () => {
          beforeAll(() => {
            mockedQuery.itemId = null;
            mockedQuery.itemBarcode = 'itemBarcode';
            mockedQuery.instanceId = null;
          });

          it('should set form `createTitleLevelRequest` value to false', () => {
            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
          });
        });

        describe('when only `instanceId` is passed in query', () => {
          beforeAll(() => {
            mockedQuery.itemId = null;
            mockedQuery.itemBarcode = null;
            mockedQuery.instanceId = 'instanceId';
          });

          it('should set form `createTitleLevelRequest` value to true', () => {
            expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', true);
          });
        });
      });

      describe('when `TLR` checkbox is checked', () => {
        beforeAll(() => {
          mockedRequestForm.createTitleLevelRequest = true;
        });

        it('should render Accordion with `Instance` information', () => {
          expect(screen.getByText(new RegExp(labelIds.instanceInformation))).toBeVisible();
        });

        it('should render search filed for instance', () => {
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
        beforeAll(() => {
          mockedRequestForm.createTitleLevelRequest = false;
        });

        it('should not render Accordion with `Instance` information', () => {
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

      beforeAll(() => {
        mockedRequest.instance = mockedInstance;
        mockedRequest.id = 'testId';
        mockedRequest.instanceId = 'instanceId';
      });

      it('should not render `TLR` checkbox section', () => {
        expect(screen.queryByTestId(testIds.tlrCheckbox)).not.toBeInTheDocument();
      });

      describe('when `Title level` request is editing', () => {
        beforeAll(() => {
          mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.TITLE;
        });

        it('should execute `TitleInformation` with passed props', () => {
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

        beforeAll(() => {
          mockedRequest.requestLevel = REQUEST_LEVEL_TYPES.ITEM;
          mockedRequest.item = mockedItem;
          mockedRequest.itemId = 'itemId';
        });

        it('should execute `ItemDetail` with passed props', () => {
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
      mockedTlrSettings.titleLevelRequestsFeatureEnabled = false;
      mockedRequest.id = null;
    });

    it('should not display `TLR` checkbox', () => {
      expect(screen.queryByTestId(testIds.tlrCheckbox)).not.toBeInTheDocument();
    });

    it('should set form `createTitleLevelRequest` value to false', () => {
      expect(mockedChangeFunction).toHaveBeenCalledWith('createTitleLevelRequest', false);
    });
  });
});
