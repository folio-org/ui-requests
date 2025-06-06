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

import {
  REQUEST_FORM_FIELD_NAMES,
  RESOURCE_KEYS,
  ENTER_EVENT_KEY,
  BASE_SPINNER_PROPS,
} from '../../constants';
import ItemDetail from '../../ItemDetail';
import {
  isFormEditing,
  memoizeValidation,
} from '../../utils';

import css from './ItemInformation.css';

class ItemInformation extends Component {
  static propTypes = {
    triggerValidation: PropTypes.func.isRequired,
    findItem: PropTypes.func.isRequired,
    form: PropTypes.shape({
      change: PropTypes.func,
    }).isRequired,
    values: PropTypes.shape({
      item: PropTypes.shape({
        barcode: PropTypes.string,
      }),
      keyOfItemBarcodeField: PropTypes.number,
    }).isRequired,
    request: PropTypes.shape({
      id: PropTypes.string,
    }),
    onSetSelectedItem: PropTypes.func.isRequired,
    itemRequestCount: PropTypes.number,
    isLoading: PropTypes.bool.isRequired,
    submitting: PropTypes.bool.isRequired,
    isItemIdRequest: PropTypes.bool.isRequired,
    selectedLoan: PropTypes.shape({
      dueDate: PropTypes.string,
    }),
    selectedItem: PropTypes.shape({
      id: PropTypes.string,
      barcode: PropTypes.string,
      instanceId: PropTypes.string,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      shouldValidateBarcode: false,
      isItemClicked: false,
      isItemBlurred: false,
      validatedBarcode: null,
    };
  }

  validate = memoizeValidation(async (barcode) => {
    const {
      isItemIdRequest,
      findItem,
    } = this.props;
    const { shouldValidateBarcode } = this.state;

    if (isItemIdRequest && !barcode) {
      return undefined;
    }

    if (!barcode && !isItemIdRequest) {
      return <FormattedMessage id="ui-requests.errors.selectItemRequired" />;
    }

    if (barcode && shouldValidateBarcode) {
      this.setState({ shouldValidateBarcode: false });

      const item = await findItem(RESOURCE_KEYS.barcode, barcode, true);

      return !item
        ? <FormattedMessage id="ui-requests.errors.itemBarcodeDoesNotExist" />
        : undefined;
    }

    return undefined;
  });

  handleChange = (event) => {
    const { form } = this.props;
    const {
      isItemClicked,
      isItemBlurred,
      validatedBarcode,
    } = this.state;
    const barcode = event.target.value;

    if (isItemClicked || isItemBlurred) {
      this.setState({
        isItemClicked: false,
        isItemBlurred: false,
      });
    }

    if (!isNull(validatedBarcode)) {
      this.setState({ validatedBarcode: null });
    }

    form.change(REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, barcode);
  };

  handleBlur = (input) => () => {
    const { triggerValidation } = this.props;
    const { validatedBarcode } = this.state;

    if (input.value && input.value !== validatedBarcode) {
      this.setState({
        shouldValidateBarcode: true,
        isItemBlurred: true,
        validatedBarcode: input.value,
      }, () => {
        input.onBlur();
        triggerValidation();
      });
    } else if (!input.value) {
      input.onBlur();
    }
  }

  onKeyDown = (e) => {
    if (e.key === ENTER_EVENT_KEY && !e.shiftKey) {
      e.preventDefault();
      this.handleClick(e.key);
    }
  };

  handleClick = (eventKey) => {
    const {
      onSetSelectedItem,
      findItem,
      triggerValidation,
      values,
    } = this.props;
    const barcode = values.item?.barcode;

    if (barcode) {
      onSetSelectedItem(null);
      this.setState(({
        isItemClicked: true,
      }));

      findItem(RESOURCE_KEYS.barcode, barcode);

      if (eventKey === ENTER_EVENT_KEY) {
        this.setState({
          shouldValidateBarcode: true,
        }, triggerValidation);
      }
    }
  }

  render() {
    const {
      values,
      submitting,
      isLoading,
      selectedItem,
      request,
      selectedLoan,
      itemRequestCount,
    } = this.props;
    const {
      isItemClicked,
      isItemBlurred,
    } = this.state;
    const isEditForm = isFormEditing(request);

    return (
      <Row>
        <Col xs={12}>
          {
            !isEditForm &&
            <Row>
              <Col
                xs={12}
                className={css.fieldWrapper}
              >
                <FormattedMessage id="ui-requests.item.scanOrEnterBarcode">
                  {placeholder => {
                    const key = values.keyOfItemBarcodeField ?? 0;

                    return (
                      <Field
                        data-testid="itemBarcodeField"
                        key={key}
                        name={REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE}
                        validate={this.validate(REQUEST_FORM_FIELD_NAMES.ITEM_BARCODE, key)}
                        validateFields={[]}
                      >
                        {({ input, meta }) => {
                          const selectItemError = meta.touched && meta.error;
                          const itemDoesntExistError = (isItemClicked || isItemBlurred) && meta.error;
                          const error = meta.submitError || selectItemError || itemDoesntExistError || null;

                          return (
                            <TextField
                              {...input}
                              required
                              placeholder={placeholder}
                              label={<FormattedMessage id="ui-requests.item.barcode" />}
                              error={error}
                              onChange={this.handleChange}
                              onBlur={this.handleBlur(input)}
                              onKeyDown={this.onKeyDown}
                              className={css.itemBarcodeField}
                            />
                          );
                        }}
                      </Field>
                    );
                  }}
                </FormattedMessage>
                <Button
                  id="clickable-select-item"
                  buttonStyle="default"
                  buttonClass={css.enterButton}
                  onClick={this.handleClick}
                  disabled={submitting}
                >
                  <FormattedMessage id="ui-requests.enter" />
                </Button>
              </Col>
            </Row>
          }
          {
            isLoading && <Icon {...BASE_SPINNER_PROPS} />
          }
          {
            selectedItem &&
              <ItemDetail
                request={request}
                currentInstanceId={selectedItem.instanceId}
                item={selectedItem}
                loan={selectedLoan}
                requestCount={itemRequestCount}
              />
          }
        </Col>
      </Row>
    );
  }
}

export default ItemInformation;
