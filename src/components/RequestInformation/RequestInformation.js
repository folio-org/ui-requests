import { useCallback, useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { get } from 'lodash';
import PropTypes from 'prop-types';
import { useOkapiKy } from '@folio/stripes/core';

import {
  Col,
  Datepicker,
  FormattedDate,
  Icon,
  KeyValue,
  NoValue,
  Row,
  Select,
  TextArea,
  Timepicker,
} from '@folio/stripes/components';

import {
  requestStatuses,
  requestStatusesTranslations,
  requestTypesTranslations,
  REQUEST_FORM_FIELD_NAMES,
  REQUEST_TYPE_ERROR_TRANSLATIONS,
  REQUEST_TYPE_ERRORS,
} from '../../constants';
import PositionLink from '../../PositionLink';
import {
  isFormEditing,
  resetFieldState,
} from '../../utils';
import css from './Icon.css';

const DATE_FORMAT = 'YYYY-MM-DD';

export const getNoRequestTypeErrorMessageId = (isTitleLevelRequest) => (
  isTitleLevelRequest ?
    REQUEST_TYPE_ERROR_TRANSLATIONS[REQUEST_TYPE_ERRORS.TITLE_LEVEL_ERROR] :
    REQUEST_TYPE_ERROR_TRANSLATIONS[REQUEST_TYPE_ERRORS.ITEM_LEVEL_ERROR]
);

const RequestInformation = ({
  request,
  requestTypeOptions,
  isTlrEnabledOnEditPage,
  MetadataDisplay,
  isTitleLevelRequest,
  isSelectedInstance,
  selectedItem,
  isSelectedItem,
  selectedUser,
  isSelectedUser,
  isRequestTypesReceived,
  isRequestTypeLoading,
  values,
  form,
  updateRequestPreferencesFields,
}) => {
  const isEditForm = isFormEditing(request);
  const holdShelfExpireDate = get(request, ['status'], '') === requestStatuses.AWAITING_PICKUP
    ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
    : <NoValue />;
  const isMetadata = isEditForm && request?.metadata;
  const isExpirationDate = isEditForm && request.status === requestStatuses.AWAITING_PICKUP;
  const isHoldShelfExpireDate = isEditForm && request.status !== requestStatuses.AWAITING_PICKUP;
  const isItemOrTitleSelected = isTitleLevelRequest ? isSelectedInstance : isSelectedItem;
  const isRequestTypeDisabled = requestTypeOptions.length === 0 || !(isItemOrTitleSelected && isSelectedUser);
  const validateRequestType = useCallback((requestType) => {
    if (isItemOrTitleSelected && isSelectedUser) {
      if (requestTypeOptions.length === 0 && isRequestTypesReceived) {
        return <FormattedMessage id={getNoRequestTypeErrorMessageId(isTitleLevelRequest)} />;
      }

      if (!requestType && requestTypeOptions.length !== 0) {
        return <FormattedMessage id="ui-requests.errors.requestType.selectItem" />;
      }
    }

    return undefined;
  }, [isItemOrTitleSelected, isSelectedUser, requestTypeOptions, isTitleLevelRequest, isRequestTypesReceived]);
  const changeRequestType = (input) => (e) => {
    form.change(REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID, undefined);
    resetFieldState(form, REQUEST_FORM_FIELD_NAMES.PICKUP_SERVICE_POINT_ID);
    input.onChange(e);
    updateRequestPreferencesFields();
  };

  const okapiKy = useOkapiKy();
  const [loanPolicyId, setLoanPolicyId] = useState();
  const [loanPolicy, setLoanPolicy] = useState();

  {
    // XXX These item-field selectors are for item objects fetch when making a new request
    // They will have to look in other places when using the stub item in an existing request
    const itemTypeId = selectedItem?.materialType?.id;
    const loanTypeId = selectedItem?.temporaryLoanType?.id || selectedItem?.permanentLoanType?.id;
    const locationId = selectedItem?.effectiveLocation?.id;
    const patronTypeId = selectedUser?.patronGroup;

    useEffect(() => {
      // circulation/rules/loan-policy?
      //  item_type_id=1a54b431-2e4f-452d-9cae-9cee66c9a892&
      //  loan_type_id=1c9f3c34-43be-44d7-b18f-f9e4ab891bbe&
      //  location_id=57246b20-76a7-4725-91c7-dea9f336de4f&
      //  patron_type_id=2467cdda-d950-4c25-b59d-d0786cbd7b1b
      if (itemTypeId && loanTypeId && locationId && patronTypeId) {
        okapiKy('circulation/rules/loan-policy?' +
                `item_type_id=${itemTypeId}&` +
                `loan_type_id=${loanTypeId}&` +
                `location_id=${locationId}&` +
                `patron_type_id=${patronTypeId}&`).then(res => {
          res.json().then(policy => {
            setLoanPolicyId(policy.loanPolicyId);
          });
        });
      }
      // okapiKy cannot be included in deps, otherwise useEffect fires in a loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemTypeId, loanTypeId, locationId, patronTypeId]);
  }

  useEffect(() => {
    if (loanPolicyId) {
      okapiKy(`loan-policy-storage/loan-policies/${loanPolicyId}`).then(res => {
        res.json().then(policy => {
          setLoanPolicy(policy);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanPolicyId]);

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
                <Field
                  data-testid="requestTypeDropDown"
                  key={values.keyOfRequestTypeField ?? 0}
                  name={REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE}
                  validateFields={[]}
                  validate={validateRequestType}
                >
                  {({
                    input,
                    meta,
                  }) => {
                    const selectItemError = requestTypeOptions.length !== 0 && meta.touched && meta.error;
                    const noAvailableRequestTypesError = !isRequestTypeLoading && isRequestTypesReceived && requestTypeOptions.length === 0 && meta.error;
                    const error = selectItemError || noAvailableRequestTypesError || null;

                    return (
                      <Select
                        {...input}
                        label={<FormattedMessage id="ui-requests.requestType" />}
                        disabled={isRequestTypeDisabled}
                        error={error}
                        onChange={changeRequestType(input)}
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
              {loanPolicy?.loansPolicy?.forUseAtLocation && (
                <Icon icon="check-circle" size="large" iconRootClass={css.icon} iconPosition="end" data-testid="fual">
                  <span className={css.textWithinIcon}><FormattedMessage id="ui-requests.forUseAtLocation" /></span>
                </Icon>
              )}
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
  MetadataDisplay: PropTypes.elementType.isRequired,
  isTitleLevelRequest: PropTypes.bool.isRequired,
  isSelectedInstance: PropTypes.bool.isRequired,
  selectedItem: PropTypes.shape({
    materialType: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    temporaryLoanType: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    permanentLoanType: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
    effectiveLocation: PropTypes.shape({
      id: PropTypes.string.isRequired,
    }),
  }),
  isSelectedItem: PropTypes.bool.isRequired,
  selectedUser: PropTypes.shape({
    patronGroup: PropTypes.string.isRequired,
  }),
  isSelectedUser: PropTypes.bool.isRequired,
  isRequestTypesReceived: PropTypes.bool.isRequired,
  isRequestTypeLoading: PropTypes.bool.isRequired,
  request: PropTypes.shape({
    holdShelfExpirationDate: PropTypes.string,
    status: PropTypes.string,
    requestType: PropTypes.string,
    patronComments: PropTypes.string,
    metadata: PropTypes.shape({
      createdDate: PropTypes.string,
    }),
  }),
  values: PropTypes.shape({
    keyOfRequestTypeField: PropTypes.number,
  }).isRequired,
  form: PropTypes.shape({
    change: PropTypes.func,
  }).isRequired,
  updateRequestPreferencesFields: PropTypes.func.isRequired,
  requestTypeOptions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      value: PropTypes.string,
    })
  ),
};

export default RequestInformation;
