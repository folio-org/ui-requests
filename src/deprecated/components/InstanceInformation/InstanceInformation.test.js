import { useState } from 'react';
import { Field } from 'react-final-form';

import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  Icon,
  TextField,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import InstanceInformation, {
  INSTANCE_SEGMENT_FOR_PLUGIN,
} from './InstanceInformation';
import { TitleInformation } from '../../../components';
import { isFormEditing } from '../../../utils';
import {
  BASE_SPINNER_PROPS,
  ENTER_EVENT_KEY,
  REQUEST_FORM_FIELD_NAMES,
} from '../../constants';

jest.mock('../../../utils', () => ({
  memoizeValidation: (fn) => () => fn,
  isFormEditing: jest.fn(() => false),
}));
jest.mock('../../../components', () => ({
  TitleInformation: jest.fn(() => <div>TitleInformation</div>),
}));

const basicProps = {
  triggerValidation: jest.fn(),
  findInstance: jest.fn(() => null),
  onSetSelectedInstance: jest.fn(),
  form: {
    change: jest.fn(),
  },
  values: {
    instance: {
      hrid: 'hrid',
    },
    keyOfInstanceIdField: 1,
  },
  request: {
    id: 'requestId',
  },
  selectedInstance: {
    title: 'instance title',
    contributors: {},
    publication: {},
    editions: {},
    identifiers: {},
  },
  instanceRequestCount: 1,
  instanceId: 'instanceId',
  isLoading: false,
  submitting: false,
};
const labelIds = {
  scanOrEnterBarcode: 'ui-requests.instance.scanOrEnterBarcode',
  instanceHrid: 'ui-requests.instance.value',
  enterButton: 'ui-requests.enter',
  selectInstanceRequired: 'ui-requests.errors.selectInstanceRequired',
  instanceUuidOrHridDoesNotExist: 'ui-requests.errors.instanceUuidOrHridDoesNotExist',
  titleLookupPlugin: 'ui-requests.titleLookupPlugin',
};
const testIds = {
  instanceHridField: 'instanceHridField',
  errorMessage: 'errorMessage',
};
const renderInstanceInfoWithHrid = (onBlur) => {
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
        value: 'hrid',
        onBlur,
      },
    });
  }));

  render(
    <InstanceInformation
      {...basicProps}
    />
  );
};

describe('InstanceInformation', () => {
  afterEach(() => {
    basicProps.onSetSelectedInstance.mockClear();
    Field.mockClear();
    cleanup();
  });

  describe('when "isFormEditing" returns false', () => {
    beforeEach(() => {
      render(
        <InstanceInformation
          {...basicProps}
        />
      );
    });

    it('should render "scanOrEnterBarcode" placeholder', () => {
      const scanOrEnterBarcodePlaceholder = screen.getByPlaceholderText(labelIds.scanOrEnterBarcode);

      expect(scanOrEnterBarcodePlaceholder).toBeVisible();
    });

    it('should render instance hrid "Field" with correct props', () => {
      const expectedProps = {
        name: REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID,
        validate: expect.any(Function),
        validateFields: [],
      };

      expect(Field).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render instance hrid label', () => {
      const instanceHridLabel = screen.getByText(labelIds.instanceHrid);

      expect(instanceHridLabel).toBeVisible();
    });

    it('should trigger "findInstance" when Enter key is pressed', () => {
      const instanceHridField = screen.getByTestId(testIds.instanceHridField);

      fireEvent.keyDown(instanceHridField, { key: ENTER_EVENT_KEY });

      expect(basicProps.findInstance).toHaveBeenCalledWith(basicProps.values.instance.hrid);
    });

    it('should not trigger "findInstance" when Control key is pressed', () => {
      const instanceHridField = screen.getByTestId(testIds.instanceHridField);

      fireEvent.keyDown(instanceHridField, { key: 'Control' });

      expect(basicProps.findInstance).not.toHaveBeenCalledWith();
    });

    it('should trigger "form.change" with correct arguments', () => {
      const instanceHridField = screen.getByTestId(testIds.instanceHridField);
      const event = {
        target: {
          value: 'instanceHrid',
        },
      };

      fireEvent.change(instanceHridField, event);

      expect(basicProps.form.change).toHaveBeenCalledWith(REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, event.target.value);
    });

    it('should render "TextField" with correct props', () => {
      const expectedProps = {
        required: true,
        error: null,
        placeholder: [labelIds.scanOrEnterBarcode],
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        onKeyDown: expect.any(Function),
      };

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render "TextField" with validation error', () => {
      const instanceHridField = screen.getByTestId(testIds.instanceHridField);
      const enterButton = screen.getByText(labelIds.enterButton);
      const event = {
        target: {
          value: 'instanceHrid',
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
            error,
            touched: true,
          },
          input: {
            validate,
            'data-testid': testId,
          },
        });
      }));

      fireEvent.click(enterButton);
      fireEvent.change(instanceHridField, event);

      expect(TextField).toHaveBeenCalledWith(expect.objectContaining({ error }), {});
    });

    it('should render "Pluggable" with correct props', () => {
      const expectedProps = {
        searchButtonStyle: 'link',
        type: 'find-instance',
        selectInstance: expect.any(Function),
        config: {
          availableSegments: [{
            name: INSTANCE_SEGMENT_FOR_PLUGIN,
          }],
        },
      };

      expect(Pluggable).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should render title lookup plugin label', () => {
      const titleLookupPluginLabel = screen.getByText(labelIds.titleLookupPlugin);

      expect(titleLookupPluginLabel).toBeVisible();
    });

    it('should trigger "findInstance" with correct argument', () => {
      const hrid = 'hrid';
      const searchButtonLabel = 'Search';
      const searchButton = screen.getByText(searchButtonLabel);

      fireEvent.click(searchButton);

      expect(basicProps.findInstance).toHaveBeenCalledWith(hrid);
    });
  });

  describe('when "isFormEditing" returns true', () => {
    beforeEach(() => {
      isFormEditing.mockReturnValueOnce(true);

      render(
        <InstanceInformation
          {...basicProps}
        />
      );
    });

    it('should not render "scanOrEnterBarcode" placeholder', () => {
      const scanOrEnterBarcodePlaceholder = screen.queryByPlaceholderText(labelIds.scanOrEnterBarcode);

      expect(scanOrEnterBarcodePlaceholder).not.toBeInTheDocument();
    });

    it('should not render instance hrid field', () => {
      const instanceHridField = screen.queryByTestId(testIds.instanceHridField);

      expect(instanceHridField).not.toBeInTheDocument();
    });

    it('should not render instance hrid label', () => {
      const instanceHridLabel = screen.queryByText(labelIds.instanceHrid);

      expect(instanceHridLabel).not.toBeInTheDocument();
    });
  });

  describe('handleBlur', () => {
    const onBlur = jest.fn();

    afterEach(() => {
      onBlur.mockClear();
    });

    it('should trigger "input.onBlur" if instance hrid is presented', () => {
      renderInstanceInfoWithHrid(onBlur);

      const instanceHridField = screen.getByTestId(testIds.instanceHridField);

      fireEvent.click(instanceHridField);
      fireEvent.blur(instanceHridField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should trigger "input.onBlur" if there is no instance hrid', () => {
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
        <InstanceInformation
          {...basicProps}
        />
      );

      const instanceHridField = screen.getByTestId(testIds.instanceHridField);

      fireEvent.click(instanceHridField);
      fireEvent.blur(instanceHridField);

      expect(onBlur).toHaveBeenCalled();
    });

    it('should not trigger "input.onBlur" if instance hrid was validated previously', () => {
      renderInstanceInfoWithHrid(onBlur);

      const instanceHridField = screen.getByTestId(testIds.instanceHridField);

      // first input focus
      fireEvent.click(instanceHridField);
      fireEvent.blur(instanceHridField);
      onBlur.mockClear();

      // second input focus after validation of initial value
      fireEvent.click(instanceHridField);
      fireEvent.blur(instanceHridField);

      expect(onBlur).not.toHaveBeenCalled();
    });
  });

  describe('Validation', () => {
    afterEach(() => {
      basicProps.findInstance.mockClear();
      TextField.mockClear();
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
              value="test"
              onChange={handleChange}
              {...rest}
            />
            <span data-testid="errorMessage">{error}</span>
          </div>
        );
      });
    });

    describe('when instance hrid is not presented', () => {
      const event = {
        target: {
          value: '',
        },
      };

      it('should not render error message', async () => {
        render(
          <InstanceInformation
            {...basicProps}
          />
        );

        const instanceHridField = screen.getByTestId(testIds.instanceHridField);

        fireEvent.change(instanceHridField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "selectInstanceRequired" error message', async () => {
        const props = {
          ...basicProps,
          selectedInstance: {
            id: 'hrid',
          },
        };

        render(
          <InstanceInformation
            {...props}
          />
        );

        const instanceHridField = screen.getByTestId(testIds.instanceHridField);

        fireEvent.change(instanceHridField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.selectInstanceRequired);

          expect(errorMessage).toBeVisible();
        });
      });
    });

    describe('when instance hrid is presented', () => {
      const event = {
        target: {
          value: 'instanceId',
        },
      };

      beforeEach(() => {
        render(
          <InstanceInformation
            {...basicProps}
          />
        );
      });

      it('should not render error message', async () => {
        const instanceHridField = screen.getByTestId(testIds.instanceHridField);

        fireEvent.change(instanceHridField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });

      it('should render "instanceUuidOrHridDoesNotExist" error message', async () => {
        const instanceHridField = screen.getByTestId(testIds.instanceHridField);

        fireEvent.keyDown(instanceHridField, { key: ENTER_EVENT_KEY });
        fireEvent.change(instanceHridField, event);

        await waitFor(() => {
          const errorMessage = screen.queryByText(labelIds.instanceUuidOrHridDoesNotExist);

          expect(errorMessage).toBeVisible();
        });
      });

      it('should not render error message if instance found', async () => {
        const instanceHridField = screen.getByTestId(testIds.instanceHridField);

        basicProps.findInstance.mockReturnValue({});
        fireEvent.keyDown(instanceHridField, { key: ENTER_EVENT_KEY });
        fireEvent.change(instanceHridField, event);

        await waitFor(() => {
          const errorMessage = screen.getByTestId(testIds.errorMessage);

          expect(errorMessage).toBeEmpty();
        });
      });
    });
  });

  describe('"Enter" button', () => {
    describe('when instance hrid is presented', () => {
      beforeEach(() => {
        render(
          <InstanceInformation
            {...basicProps}
          />
        );
      });

      it('should render "Enter" button', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        expect(enterButton).toBeVisible();
      });

      it('should trigger "onSetSelectedInstance" with correct argument', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.onSetSelectedInstance).toHaveBeenCalledWith(null);
      });

      it('should trigger "findInstance" with correct argument', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.findInstance).toHaveBeenCalledWith(basicProps.values.instance.hrid);
      });
    });

    describe('when instance hrid is not presented', () => {
      const props = {
        ...basicProps,
        values: {
          instance: {
            hrid: '',
          },
        },
      };

      beforeEach(() => {
        render(
          <InstanceInformation
            {...props}
          />
        );
      });

      it('should not trigger "onSetSelectedInstance"', () => {
        const enterButton = screen.getByText(labelIds.enterButton);

        fireEvent.click(enterButton);

        expect(basicProps.onSetSelectedInstance).not.toHaveBeenCalled();
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
          <InstanceInformation
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
          <InstanceInformation
            {...basicProps}
          />
        );
      });

      it('should not render loading "Icon"', () => {
        expect(Icon).not.toHaveBeenCalled();
      });
    });
  });

  describe('TitleInformation', () => {
    afterEach(() => {
      TitleInformation.mockClear();
    });

    describe('when instance is selected', () => {
      it('should render "TitleInformation" with correct props', () => {
        render(
          <InstanceInformation
            {...basicProps}
          />
        );

        const expectedProps = {
          instanceId: basicProps.instanceId,
          titleLevelRequestsCount: basicProps.instanceRequestCount,
          title: basicProps.selectedInstance.title,
          contributors: basicProps.selectedInstance.contributors,
          publications: basicProps.selectedInstance.publication,
          editions: basicProps.selectedInstance.editions,
          identifiers: basicProps.selectedInstance.identifiers,
        };

        expect(TitleInformation).toHaveBeenCalledWith(expectedProps, {});
      });

      it('should render "TitleInformation" with "request.instanceId"', () => {
        const instanceId = 'instanceId';
        const props = {
          ...basicProps,
          request: {
            ...basicProps.request,
            instanceId,
          },
        };
        const expectedProps = {
          instanceId,
        };

        render(
          <InstanceInformation
            {...props}
          />
        );

        expect(TitleInformation).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render "TitleInformation" with "selectedInstance.id"', () => {
        const selectedInstanceId = 'selectedInstanceId';
        const props = {
          ...basicProps,
          selectedInstance: {
            ...basicProps.selectedInstance,
            id: selectedInstanceId,
          },
        };
        const expectedProps = {
          instanceId: selectedInstanceId,
        };

        render(
          <InstanceInformation
            {...props}
          />
        );

        expect(TitleInformation).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('when instance is not selected', () => {
      const props = {
        ...basicProps,
        selectedInstance: undefined,
      };

      beforeEach(() => {
        render(
          <InstanceInformation
            {...props}
          />
        );
      });

      it('should not render "TitleInformation"', () => {
        expect(TitleInformation).not.toHaveBeenCalled();
      });
    });
  });
});
