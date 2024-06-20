import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Field } from 'react-final-form';
import { isNull } from 'lodash';

import {
  Button,
  Col,
  Icon,
  Row,
  TextField,
} from '@folio/stripes/components';
import { Pluggable } from '@folio/stripes/core';

import {
  BASE_SPINNER_PROPS,
  ENTER_EVENT_KEY,
  REQUEST_FORM_FIELD_NAMES,
} from '../../constants';
import { TitleInformation } from '..';
import {
  isFormEditing,
  memoizeValidation,
} from '../../utils';

import css from '../../requests.css';

export const INSTANCE_SEGMENT_FOR_PLUGIN = 'instances';

class InstanceInformation extends Component {
  static propTypes = {
    triggerValidation: PropTypes.func.isRequired,
    findInstance: PropTypes.func.isRequired,
    submitting: PropTypes.bool.isRequired,
    form: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    onSetSelectedInstance: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    instanceId: PropTypes.string.isRequired,
    request: PropTypes.object,
    instanceRequestCount: PropTypes.number,
    selectedInstance: PropTypes.object,
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldValidateId: false,
      isInstanceClicked: false,
      isInstanceBlurred: false,
      validatedId: null,
    };
  }

  validate = memoizeValidation(async (instanceId) => {
    const {
      selectedInstance,
      findInstance,
    } = this.props;
    const { shouldValidateId } = this.state;

    if (!instanceId || (!instanceId && !selectedInstance?.id)) {
      return <FormattedMessage id="ui-requests.errors.selectInstanceRequired" />;
    }

    if (instanceId && shouldValidateId) {
      this.setState({ shouldValidateId: false });

      const instance = await findInstance(instanceId, true);

      return !instance
        ? <FormattedMessage id="ui-requests.errors.instanceUuidOrHridDoesNotExist" />
        : undefined;
    }

    return undefined;
  });

  handleChange = (event) => {
    const { form } = this.props;
    const {
      isInstanceClicked,
      isInstanceBlurred,
      validatedId,
    } = this.state;
    const instanceId = event.target.value;

    if (isInstanceClicked || isInstanceBlurred) {
      this.setState({
        isInstanceClicked: false,
        isInstanceBlurred: false,
      });
    }

    if (!isNull(validatedId)) {
      this.setState({ validatedId: null });
    }

    form.change(REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, instanceId);
  };

  handleBlur = (input) => () => {
    const { triggerValidation } = this.props;
    const { validatedId } = this.state;

    if (input.value && input.value !== validatedId) {
      this.setState({
        shouldValidateId: true,
        isInstanceBlurred: true,
        validatedId: input.value,
      }, () => {
        input.onBlur();
        triggerValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
  };

  handleClick = (eventKey) => {
    const {
      values,
      onSetSelectedInstance,
      findInstance,
      triggerValidation,
    } = this.props;
    const instanceId = values.instance?.hrid;

    if (instanceId) {
      onSetSelectedInstance(null);
      this.setState(({
        isInstanceClicked: true,
      }));
      findInstance(instanceId);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateId: true,
        }, triggerValidation);
      }
    }
  };

  onKeyDown = (e) => {
    if (e.key === ENTER_EVENT_KEY && !e.shiftKey) {
      e.preventDefault();
      this.handleClick(e.key);
    }
  };

  render() {
    const {
      request,
      selectedInstance,
      findInstance,
      submitting,
      values,
      isLoading,
      instanceRequestCount,
      instanceId,
    } = this.props;
    const {
      isInstanceClicked,
      isInstanceBlurred,
    } = this.state;
    const isEditForm = isFormEditing(request);
    const titleLevelRequestsCount = request?.titleRequestCount || instanceRequestCount;
    const isTitleInfoVisible = selectedInstance && !isLoading;

    return (
      <Row>
        <Col xs={12}>
          {
            !isEditForm &&
            <>
              <Row>
                <Col xs={9}>
                  <FormattedMessage id="ui-requests.instance.scanOrEnterBarcode">
                    {placeholder => {
                      const key = values.keyOfInstanceIdField ?? 0;

                      return (
                        <Field
                          data-testid="instanceHridField"
                          key={key}
                          name={REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID}
                          validate={this.validate(REQUEST_FORM_FIELD_NAMES.INSTANCE_HRID, key)}
                          validateFields={[]}
                        >
                          {({ input, meta }) => {
                            const selectInstanceError = meta.touched && meta.error;
                            const instanceDoesntExistError = (isInstanceClicked || isInstanceBlurred) && meta.error;
                            const error = selectInstanceError || instanceDoesntExistError || null;

                            return (
                              <TextField
                                {...input}
                                required
                                placeholder={placeholder}
                                label={<FormattedMessage id="ui-requests.instance.value" />}
                                error={error}
                                onChange={this.handleChange}
                                onBlur={this.handleBlur(input)}
                                onKeyDown={this.onKeyDown}
                              />
                            );
                          }}
                        </Field>
                      );
                    }}
                  </FormattedMessage>
                </Col>
                <Col xs={3}>
                  <Button
                    buttonStyle="primary noRadius"
                    buttonClass={css.enterButton}
                    fullWidth
                    onClick={this.handleClick}
                    disabled={submitting}
                  >
                    <FormattedMessage id="ui-requests.enter" />
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Pluggable
                    searchButtonStyle="link"
                    type="find-instance"
                    searchLabel={<FormattedMessage id="ui-requests.titleLookupPlugin" />}
                    selectInstance={(instanceFromPlugin) => findInstance(instanceFromPlugin.hrid)}
                    config={{
                      availableSegments: [{
                        name: INSTANCE_SEGMENT_FOR_PLUGIN,
                      }],
                    }}
                  />
                </Col>
              </Row>
            </>
          }
          {
            isLoading && <Icon {...BASE_SPINNER_PROPS} />
          }
          {
            isTitleInfoVisible &&
              <TitleInformation
                instanceId={request?.instanceId || selectedInstance.id || instanceId}
                titleLevelRequestsCount={titleLevelRequestsCount}
                title={selectedInstance.title}
                contributors={selectedInstance.contributors || selectedInstance.contributorNames}
                publications={selectedInstance.publication}
                editions={selectedInstance.editions}
                identifiers={selectedInstance.identifiers}
              />
          }
        </Col>
      </Row>
    );
  }
}

export default InstanceInformation;
