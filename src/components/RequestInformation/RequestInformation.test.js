import { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import { Field } from 'react-final-form';

import { Select } from '@folio/stripes-components';

import RequestInformation, {
  getNoRequestTypeErrorMessageId,
} from './RequestInformation';
import { isFormEditing } from '../../utils';
import {
  REQUEST_FORM_FIELD_NAMES,
  requestStatuses,
  REQUEST_TYPE_ERRORS,
  REQUEST_TYPE_ERROR_TRANSLATIONS,
  requestTypesMap,
  requestTypesTranslations,
} from '../../constants';

jest.mock('../../utils', () => ({
  isFormEditing: jest.fn(),
}));
jest.mock('../../PositionLink', () => () => <div>PositionLink</div>);

const basicProps = {
  isTlrEnabledOnEditPage: true,
  isTitleLevelRequest: true,
  isSelectedInstance: true,
  isSelectedItem: false,
  requestTypeOptions: [],
  request: {
    status: requestStatuses.AWAITING_PICKUP,
    metadata: {},
  },
  MetadataDisplay: () => <div>MetadataDisplay</div>,
};
const labelIds = {
  requestTypeLabel: 'ui-requests.requestType',
  selectRequestType: 'ui-requests.actions.selectRequestType',
  titleLevelRequestError: 'ui-requests.errors.requestType.titleLevelRequest',
  selectItemError: 'ui-requests.errors.requestType.selectItem',
};
const testIds = {
  requestTypeDropDown: 'requestTypeDropDown',
  errorMessage: 'errorMessage',
};

describe('RequestInformation', () => {
  describe('getNoRequestTypeErrorMessageId', () => {
    it('should return title level error', () => {
      expect(getNoRequestTypeErrorMessageId(true)).toBe(REQUEST_TYPE_ERROR_TRANSLATIONS[REQUEST_TYPE_ERRORS.TITLE_LEVEL_ERROR]);
    });

    it('should return item level error', () => {
      expect(getNoRequestTypeErrorMessageId(false)).toBe(REQUEST_TYPE_ERROR_TRANSLATIONS[REQUEST_TYPE_ERRORS.ITEM_LEVEL_ERROR]);
    });
  });

  describe('component', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      cleanup();
    });

    describe('request creation', () => {
      beforeEach(() => {
        isFormEditing.mockReturnValue(false);
        render(
          <RequestInformation
            {...basicProps}
          />
        );
      });

      it('should render request type dropdown', () => {
        const requestTypeDropDown = screen.getByTestId(testIds.requestTypeDropDown);

        expect(requestTypeDropDown).toBeInTheDocument();
      });

      it('should render request type label', () => {
        const requestTypeLabel = screen.getByText(labelIds.requestTypeLabel);

        expect(requestTypeLabel).toBeInTheDocument();
      });

      it('should render request type default value', () => {
        const selectRequestType = screen.getByText(labelIds.selectRequestType);

        expect(selectRequestType).toBeInTheDocument();
      });

      it('should render "Field" with correct props', () => {
        const expectedProps = {
          name: REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE,
          validateFields: [],
          validate: expect.any(Function),
        };

        expect(Field).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });

      it('should render disabled "Select"', () => {
        const expectedProps = {
          disabled: true,
        };

        expect(Select).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
      });
    });

    describe('request editing', () => {
      const props = {
        ...basicProps,
        request: {
          ...basicProps.request,
          requestType: requestTypesMap.PAGE,
        },
      };

      beforeEach(() => {
        isFormEditing.mockReturnValue(true);
        render(
          <RequestInformation
            {...props}
          />
        );
      });

      it('should render request type label', () => {
        const requestTypeLabel = screen.getByText(labelIds.requestTypeLabel);

        expect(requestTypeLabel).toBeInTheDocument();
      });

      it('should render request type value', () => {
        const requestTypeValue = screen.getByText(requestTypesTranslations[requestTypesMap.PAGE]);

        expect(requestTypeValue).toBeInTheDocument();
      });
    });

    describe('when request type options are provided', () => {
      const props = {
        ...basicProps,
        requestTypeOptions: [{
          id: requestTypesTranslations[requestTypesMap.HOLD],
          value: 'value',
        }],
      };

      beforeEach(() => {
        isFormEditing.mockReturnValue(false);
        render(
          <RequestInformation
            {...props}
          />
        );
      });

      it('should render request type option', () => {
        const requestTypeOption = screen.getByText(requestTypesTranslations[requestTypesMap.HOLD]);

        expect(requestTypeOption).toBeInTheDocument();
      });
    });

    describe('validation', () => {
      beforeEach(() => {
        Select.mockImplementation(jest.fn(({
          validate,
          ...rest
        }) => {
          const [error, setError] = useState('');
          const handleChange = (e) => {
            setError(validate(e.target.value));
          };

          return (
            <div>
              <select
                onChange={handleChange}
                {...rest}
              >
                <option value="test">test</option>
              </select>
              <span data-testid="errorMessage">{error}</span>
            </div>
          );
        }));

        isFormEditing.mockReturnValue(false);
      });

      it('should render "select request type" error', () => {
        render(
          <RequestInformation
            {...basicProps}
          />
        );

        const event = {
          target: {
            value: '',
          },
        };
        const requestTypeSelect = screen.getByTestId(testIds.requestTypeDropDown);
        const errorMessage = screen.getByTestId(testIds.errorMessage);

        fireEvent.change(requestTypeSelect, event);

        expect(errorMessage).toHaveTextContent(labelIds.selectItemError);
      });

      it('should render "title lever request type" error', () => {
        render(
          <RequestInformation
            {...basicProps}
          />
        );

        const event = {
          target: {
            value: 'test',
          },
        };
        const requestTypeSelect = screen.getByTestId(testIds.requestTypeDropDown);
        const errorMessage = screen.getByTestId(testIds.errorMessage);

        fireEvent.change(requestTypeSelect, event);

        expect(errorMessage).toHaveTextContent(labelIds.titleLevelRequestError);
      });

      it('should not render request type error', () => {
        const props = {
          ...basicProps,
          requestTypeOptions: [{
            id: 'id',
            value: 'value',
          }],
        };

        render(
          <RequestInformation
            {...props}
          />
        );

        const event = {
          target: {
            value: 'test',
          },
        };
        const requestTypeSelect = screen.getByTestId(testIds.requestTypeDropDown);
        const errorMessage = screen.getByTestId(testIds.errorMessage);

        fireEvent.change(requestTypeSelect, event);

        expect(errorMessage).toBeEmpty();
      });
    });
  });
});
