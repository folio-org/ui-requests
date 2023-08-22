import { useState } from 'react';
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from '@testing-library/react';

import '../../../test/jest/__mock__';

import { Field } from 'react-final-form';

import { Select } from '@folio/stripes/components';

import RequestInformation, {
  getNoRequestTypeErrorMessageId,
} from './RequestInformation';
import PositionLink from '../../PositionLink';
import {
  isFormEditing,
  resetFieldState,
} from '../../utils';
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
  resetFieldState: jest.fn(),
}));
jest.mock('../../PositionLink', () => jest.fn(() => <div>PositionLink</div>));

const labelIds = {
  requestTypeLabel: 'ui-requests.requestType',
  selectRequestType: 'ui-requests.actions.selectRequestType',
  titleLevelRequestError: 'ui-requests.errors.requestType.titleLevelRequest',
  selectItemError: 'ui-requests.errors.requestType.selectItem',
  requestStatus: 'ui-requests.status',
  patronComment: 'ui-requests.patronComments',
  requestPosition: 'ui-requests.position',
  holdShelfExpirationDate: 'ui-requests.holdShelfExpirationDate',
};
const testIds = {
  requestTypeDropDown: 'requestTypeDropDown',
  errorMessage: 'errorMessage',
  metadataDisplay: 'metadataDisplay,'
};
const basicProps = {
  isTlrEnabledOnEditPage: true,
  isTitleLevelRequest: true,
  isSelectedInstance: true,
  isSelectedItem: false,
  isSelectedUser: true,
  isRequestTypesReceived: true,
  isRequestTypeLoading: false,
  requestTypeOptions: [],
  values: {
    keyOfRequestTypeField: 1,
  },
  form: {
    change: jest.fn(),
  },
  request: {
    status: requestStatuses.AWAITING_PICKUP,
    patronComments: 'comments',
  },
  MetadataDisplay: () => <div data-testid={testIds.metadataDisplay}>MetadataDisplay</div>,
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
          status: requestStatuses.HOLD,
          requestType: requestTypesMap.PAGE,
        },
        holdShelfExpireDate: '02/02/2023',
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

      it('should render request status label', () => {
        const requestStatusLabel = screen.getByText(labelIds.requestStatus);

        expect(requestStatusLabel).toBeInTheDocument();
      });

      it('should render patron comments label', () => {
        const patronCommentLabel = screen.getByText(labelIds.patronComment);

        expect(patronCommentLabel).toBeInTheDocument();
      });

      it('should render patron comments value', () => {
        const patronCommentValue = screen.getByText(basicProps.request.patronComments);

        expect(patronCommentValue).toBeInTheDocument();
      });

      it('should render request position label', () => {
        const requestPositionLabel = screen.getByText(labelIds.requestPosition);

        expect(requestPositionLabel).toBeInTheDocument();
      });

      it('should trigger "PositionLink" with correct props', () => {
        const expectedProps = {
          request: props.request,
          isTlrEnabled: props.isTlrEnabledOnEditPage,
        };

        expect(PositionLink).toHaveBeenCalledWith(expectedProps, {});
      });

      it('should render hold shelf expiration date label', () => {
        const holdShelfExpirationDateLabel = screen.getByText(labelIds.holdShelfExpirationDate);

        expect(holdShelfExpirationDateLabel).toBeInTheDocument();
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
          onChange,
          ...rest
        }) => {
          const [error, setError] = useState('');
          const handleChange = (e) => {
            setError(validate(e.target.value));
            onChange(e);
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
        const props = {
          ...basicProps,
          requestTypeOptions: [
            {
              id: 'id',
              value: 'value',
            }
          ],
        };

        render(
          <RequestInformation
            {...props}
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

      it('should not render request type error when user is not selected', () => {
        const props = {
          ...basicProps,
          isSelectedUser: false,
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

    describe('Request type changing', () => {
      beforeEach(() => {
        const event = {
          target: {
            value: 'test',
          },
        };

        isFormEditing.mockReturnValue(false);
        render(
          <RequestInformation
            {...basicProps}
          />
        );

        const requestTypeSelect = screen.getByTestId(testIds.requestTypeDropDown);

        fireEvent.change(requestTypeSelect, event);
      });

      it('should trigger "form.change" with correct arguments', () => {
        const expectedArgs = [REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, undefined];

        expect(basicProps.form.change).toHaveBeenCalledWith(...expectedArgs);
      });

      it('should trigger "resetFieldState" with correct arguments', () => {
        const expectedArgs = [basicProps.form, REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID];

        expect(resetFieldState).toHaveBeenCalledWith(...expectedArgs);
      });
    });

    describe('when "metadata" is provided', () => {
      const props = {
        ...basicProps,
        request: {
          ...basicProps.request,
          metadata: {},
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

      it('should render "MetadataDisplay"', () => {
        const metadataDisplay = screen.getByTestId(testIds.metadataDisplay);

        expect(metadataDisplay).toBeInTheDocument();
      });
    });

    describe('when "metadata" is not provided', () => {
      const props = {
        ...basicProps,
        request: {
          ...basicProps.request,
          metadata: undefined,
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

      it('should not render "MetadataDisplay"', () => {
        const metadataDisplay = screen.queryByTestId(testIds.metadataDisplay);

        expect(metadataDisplay).not.toBeInTheDocument();
      });
    });
  });
});
