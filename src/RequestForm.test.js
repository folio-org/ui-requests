import React from 'react';
import {
  render,
  screen,
} from '@testing-library/react';

import '../test/jest/__mock__';

import { Field } from 'redux-form';

import {
  Checkbox,
} from '@folio/stripes/components';

import RequestForm from './RequestForm';

const mockedTlrSettings = { titleLevelRequestsFeatureEnabled: true };

jest.mock('./utils', () => ({
  ...jest.requireActual('./utils'),
  getTlrSettings: jest.fn(() => (mockedTlrSettings)),
  getRequestLevelValue: jest.fn(),
}));
jest.mock('@folio/stripes/form', () => () => jest.fn((component) => component));
jest.mock('redux-form', () => ({
  Field: jest.fn(() => null),
  getFormValues: jest.fn((formName) => (state) => state[formName]),
}));
jest.mock('./PatronBlockModal', () => jest.fn(() => null));
jest.mock('./CancelRequestDialog', () => jest.fn(() => null));

describe('RequestForm', () => {
  const testIds = {
    tlrCheckbox: 'tlrCheckbox',
  };
  const labelIds = {
    tlrCheckbox: 'ui-requests.requests.createTitleLevelRequest',
    instanceInformation: 'ui-requests.instance.information',
  };
  const fieldCallOrder = {
    tlrCheckbox: 1,
  };
  const mockedRequestForm = {
    createTitleLevelRequest: true,
  };
  const mockedRequest = {
    id: null,
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

      it('should execute `TLR` Field with passed props', () => {
        const expectedResult = {
          name: 'createTitleLevelRequest',
          type: 'checkbox',
          label: labelIds.tlrCheckbox,
          component: Checkbox,
          disabled: false,
        };

        expect(Field).toHaveBeenNthCalledWith(
          fieldCallOrder.tlrCheckbox,
          expectedResult,
          {},
        );
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
      beforeAll(() => {
        mockedRequest.id = 'testId';
      });

      it('should not render `TLR` checkbox section', () => {
        expect(screen.queryByTestId(testIds.tlrCheckbox)).not.toBeInTheDocument();
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
