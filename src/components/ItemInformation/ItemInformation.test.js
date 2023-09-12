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

import ItemInformation from './ItemInformation';
import ItemDetail from '../../ItemDetail';
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
jest.mock('../../ItemDetail', () => jest.fn(() => <div>Item Details</div>));

const basicProps = {
  triggerValidation: jest.fn(),
  findItem: jest.fn(() => null),
  onSetSelectedItem: jest.fn(),
  form: {
    change: jest.fn(),
  },
  values: {
    item: {
      barcode: 'itemBarcode',
    },
    keyOfItemBarcodeField: 1,
  },
  request: {
    id: 'requestId',
  },
  selectedLoan: {},
  selectedItem: {},
  itemRequestCount: 1,
  instanceId: 'instanceId',
  isLoading: false,
  submitting: false,
  isItemIdRequest: true,
};
const labelIds = {
  scanOrEnterBarcode: 'ui-requests.item.scanOrEnterBarcode',
  itemBarcode: 'ui-requests.item.barcode',
  enterButton: 'ui-requests.enter',
  selectItemRequired: 'ui-requests.errors.selectItemRequired',
  itemBarcodeDoesNotExist: 'ui-requests.errors.itemBarcodeDoesNotExist',
};
const testIds = {
  itemBarcodeField: 'itemBarcodeField',
  errorMessage: 'errorMessage',
};
const renderItemInfoWithBarcode = (onBlur) => {
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
        value: 'itemBarcode',
        onBlur,
      },
    });
  }));

  render(
    <ItemInformation
      {...basicProps}
    />
  );
};

describe('ItemInformation', () => {
  afterEach(() => {
    basicProps.onSetSelectedItem.mockClear();
    Field.mockClear();
    cleanup();
  });

  describe('when "isFormEditing" returns false', () => {
    beforeEach(() => {
      render(
        <ItemInformation
          {...basicProps}
        />
      );
    });

    it('should render "scanOrEnterBarcode" placeholder', () => {
      const scanOrEnterBarcodePlaceholder = screen.getByPlaceholderText(labelIds.scanOrEnterBarcode);

      expect(scanOrEnterBarcodePlaceholder).toBeVisible();
    });

    it('should render item barcode field', () => {
      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      expect(itemBarcodeField).toBeVisible();
    });

    it('should render item barcode "Field" with correct props', () => {
      const expectedProps = {
        name: REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE,
        validate: expect.any(Function),
        validateFields: [],
      };

      expect(Field).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render item barcode label', () => {
      const itemBarcodeLabel = screen.getByText(labelIds.itemBarcode);

      expect(itemBarcodeLabel).toBeVisible();
    });

    it('should trigger "findItem" when Enter key is pressed', () => {
      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      fireEvent.keyDown(itemBarcodeField, { key: ENTER_EVENT_KEY });

      expect(basicProps.findItem).toHaveBeenCalledWith(RESOURCE_KEYS.barcode, basicProps.values.item.barcode);
    });

    it('should not trigger "findItem" when Control key is pressed', () => {
      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      fireEvent.keyDown(itemBarcodeField, { key: 'Control' });

      expect(basicProps.findItem).not.toHaveBeenCalledWith();
    });

    it('should trigger "form.change" with correct arguments', () => {
      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);
      const event = {
        target: {
          value: 'itemBarcode',
        },
      };

      fireEvent.change(itemBarcodeField, event);

      expect(basicProps.form.change).toHaveBeenCalledWith(REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, event.target.value);
    });

    it('should render "TextField" with correct props', () => {
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
      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);
      const enterButton = screen.getByText(labelIds.enterButton);
      const event = {
        target: {
          value: 'itemBarcode',
        },
      };
      const error = 'error';

      Field.mockImplementationOnce(jest.fn(({
        children,
        'data-testid': testId,
        validate,
      }) => {
        return children({
          meta: {
            error: 'error',
            touched: true,
          },
          input: {
            validate,
            'data-testid': testId,
          },
        });
      }));

      fireEvent.click(enterButton);
      fireEvent.change(itemBarcodeField, event);

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining({ error }), {});
    });
  });

  describe('when "isFormEditing" returns true', () => {
    beforeEach(() => {
      isFormEditing.mockReturnValueOnce(true);

      render(
        <ItemInformation
          {...basicProps}
        />
      );
    });

    it('should not render "scanOrEnterBarcode" placeholder', () => {
      const scanOrEnterBarcodePlaceholder = screen.queryByPlaceholderText(labelIds.scanOrEnterBarcode);

      expect(scanOrEnterBarcodePlaceholder).not.toBeInTheDocument();
    });

    it('should not render item barcode field', () => {
      const itemBarcodeField = screen.queryByTestId(testIds.itemBarcodeField);

      expect(itemBarcodeField).not.toBeInTheDocument();
    });

    it('should not render item barcode label', () => {
      const itemBarcodeLabel = screen.queryByText(labelIds.itemBarcode);

      expect(itemBarcodeLabel).not.toBeInTheDocument();
    });
  });

  describe('handleBlur', () => {
    const onBlur = jest.fn();

    afterEach(() => {
      onBlur.mockClear();
    });

    it('should trigger "input.onBlur" if item barcode is presented', () => {
      renderItemInfoWithBarcode(onBlur);

      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      fireEvent.click(itemBarcodeField);
      fireEvent.blur(itemBarcodeField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should trigger "input.onBlur" if there is no item barcode', () => {
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
            value: '',
            onBlur,
          },
        });
      }));

      render(
        <ItemInformation
          {...basicProps}
        />
      );

      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      fireEvent.click(itemBarcodeField);
      fireEvent.blur(itemBarcodeField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should not trigger "input.onBlur" if item barcode was validated previously', () => {
      renderItemInfoWithBarcode(onBlur);

      const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

      // first input focus
      fireEvent.click(itemBarcodeField);
      fireEvent.blur(itemBarcodeField);
      onBlur.mockClear();

      // second input focus after validation of initial value
      fireEvent.click(itemBarcodeField);
      fireEvent.blur(itemBarcodeField);

      expect(onBlur).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    afterEach(() => {
      TextField.mockClear();
      basicProps.findItem.mockClear();
    });

    beforeEach(() => {
      TextField.mockImplementation(jest.fn(({
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
              value="test"
              onChange={handleChange}
              {...rest}
            />
            <span data-testid="errorMessage">{error}</span>
          </div>
        );
      }));
    });

    describe('when "barcode" is not presented', () => {
      const event = {
        target: {
          value: '',
        },
      };

      it('should not render error message', async () => {
        render(
          <ItemInformation
            {...basicProps}
          />
        );

        const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

        fireEvent.change(itemBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "selectItemRequired" error message', async () => {
        const props = {
          ...basicProps,
          isItemIdRequest: false,
        };

        render(
          <ItemInformation
            {...props}
          />
        );

        const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

        fireEvent.change(itemBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.selectItemRequired);

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
          <ItemInformation
            {...basicProps}
          />
        );
      });

      it('should not render error message', async () => {
        const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

        fireEvent.change(itemBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "itemBarcodeDoesNotExist" error message', async () => {
        const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

        fireEvent.keyDown(itemBarcodeField, { key: ENTER_EVENT_KEY });
        fireEvent.change(itemBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.itemBarcodeDoesNotExist);

          expect(errorMessage).toBeVisible();
        });
      });

      it('should not render error message if item found', async () => {
        const itemBarcodeField = screen.getByTestId(testIds.itemBarcodeField);

        basicProps.findItem.mockReturnValue({});
        fireEvent.keyDown(itemBarcodeField, { key: ENTER_EVENT_KEY });
        fireEvent.change(itemBarcodeField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });
    });
  });

  describe('"Enter" button', () => {
    describe('when barcode is presented', () => {
      beforeEach(() => {
        render(
          <ItemInformation
            {...basicProps}
          />
        );
      });

      it('should render "Enter" button', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        expect(enterButton).toBeVisible();
      });

      it('should trigger "onSetSelectedItem" with correct argument', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.onSetSelectedItem).toHaveBeenCalledWith(null);
      });

      it('should trigger "findItem" with correct arguments', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.findItem).toHaveBeenCalledWith(RESOURCE_KEYS.barcode, basicProps.values.item.barcode);
      });
    });

    describe('when barcode is not presented', () => {
      const props = {
        ...basicProps,
        values: {
          item: {
            barcode: '',
          },
        },
      };

      beforeEach(() => {
        render(
          <ItemInformation
            {...props}
          />
        );
      });

      it('should not trigger "onSetSelectedItem"', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.onSetSelectedItem).not.toHaveBeenCalled();
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
          <ItemInformation
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
          <ItemInformation
            {...basicProps}
          />
        );
      });

      it('should not render loading "Icon"', () => {
        expect(Icon).not.toHaveBeenCalled();
      });
    });
  });

  describe('ItemDetails', () => {
    afterEach(() => {
      ItemDetail.mockClear();
    });

    describe('when item is selected', () => {
      beforeEach(() => {
        render(
          <ItemInformation
            {...basicProps}
          />
        );
      });

      it('should render "ItemDetail" with correct props', () => {
        const expectedProps = {
          request: basicProps.request,
          currentInstanceId: basicProps.instanceId,
          item: basicProps.selectedItem,
          loan: basicProps.selectedLoan,
          requestCount: basicProps.itemRequestCount,
        };

        expect(ItemDetail).toHaveBeenCalledWith(expectedProps, {});
      });
    });

    describe('when item is not selected', () => {
      const props = {
        ...basicProps,
        selectedItem: undefined,
      };

      beforeEach(() => {
        render(
          <ItemInformation
            {...props}
          />
        );
      });

      it('should not render "ItemDetail"', () => {
        expect(ItemDetail).not.toHaveBeenCalled();
      });
    });
  });
});
