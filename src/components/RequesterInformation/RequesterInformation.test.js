import { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import { Field } from 'react-final-form';
import {
  Icon,
  TextField,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import RequesterInformation, {
  COLUMN_MAPPING,
  VISIBLE_COLUMNS,
} from './RequesterInformation';
import UserForm from '../../UserForm';
import { isFormEditing } from '../../utils';
import {
  REQUEST_FORM_FIELD_NAMES,
  RESOURCE_KEYS,
  ENTER_EVENT_KEY,
  BASE_SPINNER_PROPS,
} from '../../constants';

jest.mock('../../utils', () => ({
  isFormEditing: jest.fn(() => false),
  memoizeValidation: (fn) => () => fn,
}));
jest.mock('../../UserForm', () => jest.fn(() => <div>User form</div>));

const basicProps = {
  triggerUserBarcodeValidation: jest.fn(),
  findUser: jest.fn(() => null),
  onSetSelectedUser: jest.fn(),
  onSetIsPatronBlocksOverridden: jest.fn(),
  onSetBlocked: jest.fn(),
  onSelectProxy: jest.fn(),
  handleCloseProxy: jest.fn(),
  form: {
    change: jest.fn(),
  },
  values: {
    keyOfUserBarcodeField: 1,
    requester: {
      barcode: 'requesterBarcode',
    },
  },
  request: {
    id: 'requestId',
    requester: {},
  },
  selectedUser: {},
  stripes: {},
  optionLists: {},
  selectedProxy: {},
  patronGroup: {
    group: 'group',
  },
  isLoading: false,
  submitting: false,
};
const labelIds = {
  selectUserError: 'ui-requests.errors.selectUser',
  userBarcodeDoesNotExistError: 'ui-requests.errors.userBarcodeDoesNotExist',
  scanOrEnterBarcodePlaceholder: 'ui-requests.requester.scanOrEnterBarcode',
  requesterBarcodeLabel: 'ui-requests.requester.barcode',
  findUserPluginLabel: 'ui-requests.requester.findUserPluginLabel',
  enterButton: 'ui-requests.enter',
};
const testIds = {
  requesterBarcodeField: 'requesterBarcodeField',
  searchUser: 'searchUser',
  errorMessage: 'errorMessage',
};
const renderRequesterInfoWithBarcode = (onBlur) => {
  Field.mockImplementation(jest.fn(({
    children,
    'data-testid': testId,
    validate,
  }) => {
    return children({
      meta: {},
      input: {
        validate,
        'data-testid': testId,
        value: 'requesterBarcode',
        onBlur,
      },
    });
  }));

  render(
    <RequesterInformation
      {...basicProps}
    />
  );
};

describe('RequesterInformation', () => {
  afterEach(() => {
    Field.mockClear();
    basicProps.onSetSelectedUser.mockReset();
    cleanup();
  });

  describe('when "isFormEditing" returns false', () => {
    beforeEach(() => {
      render(
        <RequesterInformation
          {...basicProps}
        />
      );
    });

    it('should render "scanOrEnterBarcode" placeholder', () => {
      const scanOrEnterBarcodePlaceholder = screen.getByPlaceholderText(labelIds.scanOrEnterBarcodePlaceholder);

      expect(scanOrEnterBarcodePlaceholder).toBeVisible();
    });

    it('should render requester barcode label', () => {
      const requesterBarcodeLabel = screen.getByText(labelIds.requesterBarcodeLabel);

      expect(requesterBarcodeLabel).toBeVisible();
    });

    it('should trigger requester barcode Field with correct props', () => {
      const expectedProps = {
        name: REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE,
        validate: expect.any(Function),
        validateFields: [],
      };

      expect(Field).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger "findUser" when Enter key is pressed', () => {
      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

      fireEvent.keyDown(requesterBarcodeField, { key: ENTER_EVENT_KEY });

      expect(basicProps.findUser).toHaveBeenCalledWith(RESOURCE_KEYS.barcode, basicProps.values.requester.barcode);
    });

    it('should not trigger "findUser" when Control key is pressed', () => {
      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

      fireEvent.keyDown(requesterBarcodeField, { key: 'Control' });

      expect(basicProps.findUser).not.toHaveBeenCalledWith();
    });

    it('should trigger "form.change" with correct arguments', () => {
      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);
      const event = {
        target: {
          value: 'requesterBarcode',
        },
      };

      fireEvent.change(requesterBarcodeField, event);

      expect(basicProps.form.change).toHaveBeenCalledWith(REQUEST_FORM_FIELD_NAMES.REQUESTER_BARCODE, event.target.value);
    });

    it('should trigger "TextField" with correct props', () => {
      const expectedProps = {
        required: true,
        error: null,
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        onKeyDown: expect.any(Function),
      };

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "TextField" with validation error', () => {
      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);
      const enterButton = screen.getByText(labelIds.enterButton);
      const error = 'error';
      const event = {
        target: {
          value: 'barcode',
        },
      };

      Field.mockImplementationOnce(jest.fn(({
        children,
        'data-testid': testId,
        validate,
      }) => {
        return children({
          meta: {
            touched: true,
            error,
          },
          input: {
            validate,
            'data-testid': testId,
          },
        });
      }));

      fireEvent.click(enterButton);
      fireEvent.change(requesterBarcodeField, event);

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining({ error }), {});
    });

    it('should render "Enter" button', () => {
      const enterButton = screen.getByText(labelIds.enterButton);

      expect(enterButton).toBeVisible();
    });

    it('should trigger "onSetSelectedUser" with correct argument', () => {
      const enterButton = screen.getByText(labelIds.enterButton);

      fireEvent.click(enterButton);

      expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(null);
    });

    it('should trigger "findUser" with correct arguments', () => {
      const enterButton = screen.getByText(labelIds.enterButton);

      fireEvent.click(enterButton);

      expect(basicProps.findUser).toHaveBeenCalledWith(RESOURCE_KEYS.barcode, basicProps.values.requester.barcode);
    });
  });

  describe('when "isFormEditing" returns true', () => {
    beforeEach(() => {
      isFormEditing.mockReturnValueOnce(true);
    });

    it('should trigger "UserForm" with correct props', () => {
      const props = {
        ...basicProps,
        selectedUser: {
          id: 'selectedUserId',
        },
      };
      const expectedProps = {
        user: basicProps.request.requester,
        stripes: basicProps.stripes,
        request: basicProps.request,
        patronGroup: basicProps.patronGroup.group,
        proxy: basicProps.selectedProxy,
        onSelectProxy: basicProps.onSelectProxy,
        onCloseProxy: basicProps.handleCloseProxy,
      };

      render(
        <RequesterInformation
          {...props}
        />
      );

      expect(UserForm).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should trigger "UserForm" with "selectedUser"', () => {
      const props = {
        ...basicProps,
        request: undefined,
        selectedUser: {
          id: 'selectedUserId',
        },
      };
      const expectedProps = {
        user: props.selectedUser,
      };

      render(
        <RequesterInformation
          {...props}
        />
      );

      expect(UserForm).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Validation', () => {
    afterEach(() => {
      TextField.mockClear();
      basicProps.findUser.mockClear();
    });

    beforeEach(() => {
      TextField.mockImplementation(({
        onChange,
        validate,
        ...rest
      }) => {
        const [error, setError] = useState('');
        const handleChange = async (e) => {
          setError(await validate(e.target.value));
          onChange(e);
        };

        return (
          <div>
            <input
              {...rest}
              value="test"
              onChange={handleChange}
            />
            <span data-testid={testIds.errorMessage}>{error}</span>
          </div>
        );
      });
    });

    describe('when "barcode" is not presented', () => {
      const event = {
        target: {
          value: '',
        },
      };

      it('should not render error message', async () => {
        const props = {
          ...basicProps,
          selectedUser: {
            id: 'selectedUserId',
          },
        };

        render(
          <RequesterInformation
            {...props}
          />
        );

        const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

        fireEvent.change(requesterBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "selectUser" error message', async () => {
        render(
          <RequesterInformation
            {...basicProps}
          />
        );

        const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

        fireEvent.change(requesterBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.selectUserError);

          expect(errorMessage).toBeVisible();
        });
      });
    });

    describe('when "barcode" is presented', () => {
      const event = {
        target: {
          value: 'barcode',
        },
      };

      beforeEach(() => {
        render(
          <RequesterInformation
            {...basicProps}
          />
        );
      });

      it('should not render error message', async () => {
        const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

        fireEvent.change(requesterBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "userBarcodeDoesNotExist" error message', async () => {
        const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

        fireEvent.keyDown(requesterBarcodeField, { key: ENTER_EVENT_KEY });
        fireEvent.change(requesterBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.userBarcodeDoesNotExistError);

          expect(errorMessage).toBeVisible();
        });
      });

      it('should not render error message if requester found', async () => {
        basicProps.findUser.mockReturnValue({});

        const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

        fireEvent.keyDown(requesterBarcodeField, { key: ENTER_EVENT_KEY });
        fireEvent.change(requesterBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });
    });
  });

  describe('handleBlur', () => {
    const onBlur = jest.fn();

    afterEach(() => {
      onBlur.mockClear();
    });

    it('should trigger "input.onBlur" if requester barcode is presented', () => {
      renderRequesterInfoWithBarcode(onBlur);

      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

      fireEvent.click(requesterBarcodeField);
      fireEvent.blur(requesterBarcodeField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should trigger "input.onBlur" if there is no requester barcode', () => {
      Field.mockImplementationOnce(({
        children,
        'data-testid': testId,
        validate,
      }) => {
        return children({
          meta: {},
          input: {
            validate,
            'data-testid': testId,
            value: '',
            onBlur,
          },
        });
      });

      render(
        <RequesterInformation
          {...basicProps}
        />
      );

      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

      fireEvent.click(requesterBarcodeField);
      fireEvent.blur(requesterBarcodeField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should not trigger "input.onBlur" if requester barcode was validated previously', () => {
      renderRequesterInfoWithBarcode(onBlur);

      const requesterBarcodeField = screen.getByTestId(testIds.requesterBarcodeField);

      // first input focus
      fireEvent.click(requesterBarcodeField);
      fireEvent.blur(requesterBarcodeField);
      onBlur.mockClear();

      // second input focus after validation of initial value
      fireEvent.click(requesterBarcodeField);
      fireEvent.blur(requesterBarcodeField);

      expect(onBlur).not.toHaveBeenCalled();
    });
  });

  describe('Pluggable', () => {
    describe('when user is not presented', () => {
      beforeEach(() => {
        render(
          <RequesterInformation
            {...basicProps}
          />
        );
      });

      it('should render user lookup plugin label', () => {
        const findUserPluginLabel = screen.getByText(labelIds.findUserPluginLabel);

        expect(findUserPluginLabel).toBeVisible();
      });

      it('should trigger "Pluggable" with correct props', () => {
        const expectedProps = {
          'aria-haspopup': 'true',
          searchButtonStyle: 'link',
          type: 'find-user',
          dataKey: 'users',
          selectUser: expect.any(Function),
          visibleColumns: VISIBLE_COLUMNS,
          columnMapping: COLUMN_MAPPING,
          disableRecordCreation: true,
          marginTop0: true,
        };

        expect(Pluggable).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should not trigger "onSetSelectedUser"', () => {
        const searchButtonLabel = 'Search';
        const searchButton = screen.getByText(searchButtonLabel);

        fireEvent.click(searchButton);

        expect(basicProps.onSetSelectedUser).not.toHaveBeenCalled();
      });
    });

    describe('when user has a barcode', () => {
      const user = {
        barcode: 'userBarcode',
      };

      beforeEach(() => {
        Pluggable.mockImplementationOnce(({
          selectUser,
        }) => (
          <button
            type="button"
            data-testid={testIds.searchUser}
            onClick={() => selectUser(user)}
          >
            Search
          </button>
        ));

        render(
          <RequesterInformation
            {...basicProps}
          />
        );

        const searchButton = screen.getByTestId(testIds.searchUser);

        fireEvent.click(searchButton);
      });

      it('should trigger "onSetSelectedUser" with correct argument', () => {
        expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(null);
      });

      it('should trigger "findUser" with correct arguments', () => {
        const expectedArgs = [RESOURCE_KEYS.barcode, user.barcode];

        expect(basicProps.findUser).toHaveBeenCalledWith(...expectedArgs);
      });
    });

    describe('when user does not have a barcode', () => {
      const user = {
        id: 'userId',
      };

      beforeEach(() => {
        Pluggable.mockImplementationOnce(({
          selectUser,
        }) => (
          <button
            type="button"
            onClick={() => selectUser(user)}
            data-testid={testIds.searchUser}
          >
            Search
          </button>
        ));

        render(
          <RequesterInformation
            {...basicProps}
          />
        );

        const searchButton = screen.getByTestId(testIds.searchUser);

        fireEvent.click(searchButton);
      });

      it('should trigger "onSetSelectedUser" with correct argument', () => {
        expect(basicProps.onSetSelectedUser).toHaveBeenCalledWith(null);
      });

      it('should trigger "findUser" with correct arguments', () => {
        const expectedArgs = [RESOURCE_KEYS.id, user.id];

        expect(basicProps.findUser).toHaveBeenCalledWith(...expectedArgs);
      });
    });
  });

  describe('Spinner', () => {
    afterEach(() => {
      Icon.mockClear();
    });

    describe('when data is loading', () => {
      const props = {
        ...basicProps,
        isLoading: true,
      };

      beforeEach(() => {
        render(
          <RequesterInformation
            {...props}
          />
        );
      });

      it('should render loading "Icon" with correct props', () => {
        expect(Icon).toHaveBeenCalledWith(BASE_SPINNER_PROPS, {});
      });
    });

    describe('when data is not loading', () => {
      beforeEach(() => {
        render(
          <RequesterInformation
            {...basicProps}
          />
        );
      });

      it('should not render loading "Icon"', () => {
        expect(Icon).not.toHaveBeenCalled();
      });
    });
  });
});
