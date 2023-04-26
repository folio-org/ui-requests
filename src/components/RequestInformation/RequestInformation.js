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
} from '../../constants';
import PositionLink from '../../PositionLink';
import { isFormEditing } from '../../utils';

const RequestInformation = ({
  request,
  requestTypeOptions,
  requestTypeError,
  multiRequestTypesVisible,
  singleRequestTypeVisible,
  isTlrEnabledOnEditPage,
  MetadataDisplay,
}) => {
  const isEditForm = isFormEditing(request);
  const holdShelfExpireDate = get(request, ['status'], '') === requestStatuses.AWAITING_PICKUP
    ? <FormattedDate value={get(request, ['holdShelfExpirationDate'], '')} />
    : '-';
  const isMetadata = isEditForm && request?.metadata;
  const isRequestTypeMessage = !isEditForm && !requestTypeOptions?.length && !requestTypeError;
  const isExpirationDate = isEditForm && request.status === requestStatuses.AWAITING_PICKUP;
  const isHoldShelfExpireDate = isEditForm && request.status !== requestStatuses.AWAITING_PICKUP;

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
              {isRequestTypeMessage &&
                <span data-test-request-type-message>
                  <KeyValue
                    label={<FormattedMessage id="ui-requests.requestType" />}
                    value={<FormattedMessage id="ui-requests.requestType.message" />}
                  />
                </span>
              }
              {multiRequestTypesVisible &&
                <Field
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  name={REQUEST_FORM_FIELD_NAMES.REQUEST_TYPE}
                  component={Select}
                  disabled={isEditForm}
                  fullWidth
                >
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
                </Field>
              }
              {singleRequestTypeVisible &&
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  value={
                    <span data-test-request-type-text>
                      <FormattedMessage id={requestTypeOptions[0].id} />
                    </span>
                  }
                />
              }
              {isEditForm &&
                <KeyValue
                  label={<FormattedMessage id="ui-requests.requestType" />}
                  value={<FormattedMessage id={requestTypesTranslations[request.requestType]} />}
                />
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
                dateFormat="YYYY-MM-DD"
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
                    dateFormat="YYYY-MM-DD"
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
  multiRequestTypesVisible: PropTypes.bool.isRequired,
  singleRequestTypeVisible: PropTypes.bool.isRequired,
  isTlrEnabledOnEditPage: PropTypes.bool.isRequired,
  MetadataDisplay: PropTypes.func.isRequired,
  requestTypeError: PropTypes.bool,
  requestTypeOptions: PropTypes.arrayOf(PropTypes.object),
  request: PropTypes.object,
};

export default RequestInformation;
