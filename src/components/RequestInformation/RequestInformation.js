import { useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { get } from 'lodash';
import PropTypes from 'prop-types';

import {
  Col,
  Datepicker,
  FormattedDate,
  KeyValue,
  NoValue,
  Row,
  Select,
  TextArea,
  Timepicker,
} from '@folio/stripes-components';

import {
  requestStatuses,
  requestStatusesTranslations,
  requestTypesTranslations,
  REQUEST_FORM_FIELD_NAMES,
  requestTypeErrorTranslations,
  requestTypeErrors,
} from '../../constants';
import PositionLink from '../../PositionLink';
import { isFormEditing } from '../../utils';

const DATE_FORMAT = 'YYYY-MM-DD';

export const getNoRequestTypeErrorMessageId = (isTitleLevelRequest) => (isTitleLevelRequest ?
  requestTypeErrorTranslations[requestTypeErrors.TITLE_LEVEL_ERROR] :
  requestTypeErrorTranslations[requestTypeErrors.ITEM_LEVEL_ERROR]);

const RequestInformation = ({
  request,
  requestTypeOptions,
  isTlrEnabledOnEditPage,
  MetadataDisplay,
  isTitleLevelRequest,
  isSelectedInstance,
  isSelectedItem,
  requestTypeError,
}) => {
  const isEditForm = isFormEditing(request);
  const holdShelfExpireDate = get(request, ['status'], '') === requestStatuses.AWAITING_PICKUP
    ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
    : <NoValue />;
  const isMetadata = isEditForm && request?.metadata;
  const isExpirationDate = isEditForm && request.status === requestStatuses.AWAITING_PICKUP;
  const isHoldShelfExpireDate = isEditForm && request.status !== requestStatuses.AWAITING_PICKUP;
  const isItemOrTitleSelected = isTitleLevelRequest ? isSelectedInstance : isSelectedItem;
  const isRequestTypeDisabled = requestTypeOptions.length === 0 || !isItemOrTitleSelected;
  const validateRequestType = useCallback((requestType) => {
    if (!requestType) {
      return <FormattedMessage id="ui-requests.errors.requestType.selectItem" />;
    }

    if (isItemOrTitleSelected && requestTypeOptions.length === 0) {
      return <FormattedMessage id={getNoRequestTypeErrorMessageId(isTitleLevelRequest)} />;
    }

    return undefined;
  }, [isItemOrTitleSelected, requestTypeOptions, isTitleLevelRequest]);

  return (
    <>
      {isMetadata &&
        <Col xs={12}>
          <MetadataDisplay metadata={request.metadata} />
        </Col>
      }
      <Row>
        <Col xs={12}>
          <Row>
            <Col
              data-test-request-type
              xs={3}
            >
              {isEditForm ?
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  value={<FormattedMessage id={requestTypesTranslations[request.requestType]} />}
                /> :
                !requestTypeError &&
                  <Field
                    data-testid="requestTypeDropDown"
                    name={REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE}
                    validateFields={[]}
                    validate={validateRequestType}
                  >
                    {({
                      input,
                      meta,
                    }) => {
                      const error = (meta.touched && meta.error) || null;

                      return (
                        <Select
                          {...input}
                          label={<FormattedMessage id="ui-requests.requestType" />}
                          disabled={isRequestTypeDisabled}
                          error={error}
                          fullWidth
                          required
                        >
                          <FormattedMessage id="ui-requests.actions.selectRequestType">
                            {optionLabel => <option value="">{optionLabel}</option>}
                          </FormattedMessage>
                          {requestTypeOptions.map(({
                            id,
                            value,
                          }) => (
                            <FormattedMessage
                              id={id}
                              key={id}
                            >
                              {translatedLabel => (
                                <option value={value}>
                                  {translatedLabel}
                                </option>
                              )}
                            </FormattedMessage>
                          ))}
                        </Select>
                      );
                    }}
                  </Field>
              }
              {requestTypeError &&
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  value={<FormattedMessage id="ui-requests.noRequestTypesAvailable" />}
                />
              }
            </Col>
            <Col xs={2}>
              {isEditForm &&
                <KeyValue
                  label={<FormattedMessage id="ui-requests.status" />}
                  value={(requestStatusesTranslations[request.status]
                    ? <FormattedMessage id={requestStatusesTranslations[request.status]} />
                    : <NoValue />)}
                />
              }
            </Col>
            <Col xs={2}>
              <Field
                name="requestExpirationDate"
                label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                aria-label={<FormattedMessage id="ui-requests.requestExpirationDate" />}
                component={Datepicker}
                dateFormat={DATE_FORMAT}
                id="requestExpirationDate"
              />
            </Col>
            <Col
              data-test-request-patron-comments
              xsOffset={1}
              xs={4}
            >
              {isEditForm
                ? (
                  <KeyValue
                    label={<FormattedMessage id="ui-requests.patronComments" />}
                    value={request.patronComments}
                  />
                )
                : (
                  <Field
                    name="patronComments"
                    label={<FormattedMessage id="ui-requests.patronComments" />}
                    id="patronComments"
                    component={TextArea}
                  />
                )
              }
            </Col>
          </Row>
          <Row>
            { isExpirationDate &&
              <>
                <Col xs={3}>
                  <Field
                    name="holdShelfExpirationDate"
                    label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                    aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                    component={Datepicker}
                    dateFormat={DATE_FORMAT}
                  />
                </Col>
                <Col xs={3}>
                  <Field
                    name="holdShelfExpirationTime"
                    label={<FormattedMessage id="ui-requests.holdShelfExpirationTime" />}
                    aria-label={<FormattedMessage id="ui-requests.holdShelfExpirationTime" />}
                    component={Timepicker}
                    timeZone="UTC"
                  />
                </Col>
              </>
            }
            {isHoldShelfExpireDate &&
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.holdShelfExpirationDate" />}
                  value={holdShelfExpireDate}
                />
              </Col>
            }
          </Row>
          {isEditForm &&
            <Row>
              <Col xs={3}>
                <KeyValue
                  label={<FormattedMessage id="ui-requests.position" />}
                  value={
                    <PositionLink
                      request={request}
                      isTlrEnabled={isTlrEnabledOnEditPage}
                    />
                  }
                />
              </Col>
            </Row>
          }
        </Col>
      </Row>
    </>
  );
};

RequestInformation.propTypes = {
  isTlrEnabledOnEditPage: PropTypes.bool.isRequired,
  MetadataDisplay: PropTypes.func.isRequired,
  requestTypeError: PropTypes.bool,
  isTitleLevelRequest: PropTypes.bool.isRequired,
  isSelectedInstance: PropTypes.bool.isRequired,
  isSelectedItem: PropTypes.bool.isRequired,
  requestTypeOptions: PropTypes.arrayOf(PropTypes.object),
  request: PropTypes.object,
};

export default RequestInformation;
