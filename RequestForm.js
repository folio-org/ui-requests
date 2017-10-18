import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Field } from 'redux-form';

import Button from '@folio/stripes-components/lib/Button';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';
import TextArea from '@folio/stripes-components/lib/TextArea';

import stripesForm from '@folio/stripes-form';

import UserDetail from './UserDetail';
import ItemDetail from './ItemDetail';

function validate(values) {
  const errors = {};
  console.log("validating", values)

  if (!values.itemBarcode) {
    errors.itemBarcode = 'Please select an item';
  }
  if (!values.requesterBarcode) {
    errors.requesterBarcode = 'Please select a requester';
  }

  return errors;
}

class RequestForm extends React.Component {
  static propTypes = {
    change: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    findUser: PropTypes.func.isRequired,
    findItem: PropTypes.func.isRequired,
    findLoan: PropTypes.func.isRequired,
    initialValues: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      requestTypes: PropTypes.arrayOf(PropTypes.object),
      fulfilmentTypes: PropTypes.arrayOf(PropTypes.object),
    }),
    patronGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
    dateFormatter: PropTypes.func.isRequired,
  };

  static defaultProps = {
    initialValues: {},
    optionLists: {},
    pristine: true,
    submitting: false,
  };

  constructor(props) {
    super(props);

    this.state = {
      selectedItem: null,
      selectedUser: null,
      selectedItemBarcode: null,
      selectedUserBarcode: null,
      itemSelectionError: null,
      userSelectionError: null,
    };

    this.onChangeItem = this.onChangeItem.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onUserClick = this.onUserClick.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.initialValues &&
        this.props.initialValues.requester &&
        prevProps.initialValues &&
        !prevProps.initialValues.requester) {
      this.setState({
        selectedUser: {
          patronGroup: this.props.initialValues.requester.patronGroup,
          personal: this.props.initialValues.requester
        },
      });
    }
  }

  onChangeUser(e) {
    this.setState({
      selectedUserBarcode: e.target.value,
    });
  }

  onChangeItem(e) {
    this.setState({
      selectedItemBarcode: e.target.value,
    });
  }

  onUserClick() {
    this.props.findUser(this.state.selectedUserBarcode, 'barcode').then((result) => {
      if (result.totalRecords > 0) {
        this.setState({
          selectedUser: result.users[0],
          userSelectionError: false,
        });
        this.props.change('requesterId', result.users[0].id);
      } else {
        this.setState({
          userSelectionError: 'User with this barcode does not exist',
        });
      }
    });
  }

  onItemClick() {
    const { findItem, findLoan, findUser } = this.props;
    findItem(this.state.selectedItemBarcode, 'barcode').then((result) => {
      if (result.totalRecords > 0) {
        const item = result.items[0];
        this.props.change('itemId', item.id);
        // Look for an associated loan
        return findLoan(item.id).then((result2) => {
          if (result2.totalRecords > 0) {
            const loan = result2.loans[0];
            // Look for the loan's associated borrower record
            return findUser(loan.userId).then((result3) => {
              const borrower = result3.users[0];
              this.setState({
                selectedItem: {
                  itemRecord: item,
                  loanRecord: loan,
                  borrowerRecord: borrower,
                },
              });
            });
          }

          this.setState({
            selectedItem: { itemRecord: item },
          });
        });
      }

      this.setState({
        itemSelectionError: 'Item with this barcode does not exist',
      });
    });
  }

  render() {
    const {
      handleSubmit,
      initialValues,
      onCancel,
      optionLists,
      pristine,
      submitting,
    } = this.props;

    console.log("initialvalues", initialValues)

    const isEditForm = initialValues && initialValues.itemId !== null;

    const addRequestFirstMenu = <PaneMenu><Button onClick={onCancel} title="close" aria-label="Close New Request Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></Button></PaneMenu>;
    const addRequestLastMenu = <PaneMenu><Button type="submit" title="Create New Request" disabled={pristine || submitting} onClick={handleSubmit}>Create Request</Button></PaneMenu>;
    const editRequestLastMenu = <PaneMenu><Button type="submit" title="Update Request" disabled={pristine || submitting} onClick={handleSubmit}>Update Request</Button></PaneMenu>;
    const requestTypeOptions = (optionLists.requestTypes || []).map(t => ({
      label: t.label, value: t.id, selected: initialValues.requestType === t.id }));
    const fulfilmentTypeOptions = (optionLists.fulfilmentTypes || []).map(t => ({ label: t.label, value: t.id, selected: t.id === 'Hold' }));

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" height="100%" firstMenu={addRequestFirstMenu} lastMenu={isEditForm ? editRequestLastMenu : addRequestLastMenu} paneTitle={isEditForm ? 'Edit request' : 'New request'}>
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>Request record</h2>
                <Field
                  label="Request Type *"
                  name="requestType"
                  component={Select}
                  fullWidth
                  dataOptions={requestTypeOptions}
                />
                <fieldset>
                  <legend>Item info *</legend>
                  <Row>
                    <Col xs={9}>
                      <Field
                        name="item.barcode"
                        placeholder={'Enter item barcode'}
                        aria-label="Item barcode"
                        fullWidth
                        component={TextField}
                        onInput={this.onChangeItem}
                      />
                    </Col>
                    <Col xs={3}>
                      <Button
                        buttonStyle="primary noRadius"
                        fullWidth
                        onClick={this.onItemClick}
                        disabled={submitting}
                      >Select item</Button>
                    </Col>
                  </Row>
                  { (this.state.selectedItem || this.state.itemSelectionError) &&
                    <ItemDetail
                      item={this.state.selectedItem}
                      error={this.state.itemSelectionError}
                      patronGroups={this.props.patronGroups}
                      dateFormatter={this.props.dateFormatter}
                    />
                  }
                </fieldset>
                <fieldset>
                  <legend>Requester info *</legend>
                  <Row>
                    <Col xs={9}>
                      <Field
                        name="requester.barcode"
                        placeholder={'Enter requester barcode'}
                        aria-label="Requester barcode"
                        fullWidth
                        component={TextField}
                        onInput={this.onChangeUser}
                      />
                    </Col>
                    <Col xs={3}>
                      <Button
                        buttonStyle="primary noRadius"
                        fullWidth
                        onClick={this.onUserClick}
                        disabled={submitting}
                      >Select requester</Button>
                    </Col>
                  </Row>
                  { (this.state.selectedUser || this.state.userSelectionError) &&
                    <UserDetail
                      user={this.state.selectedUser}
                      error={this.state.userSelectionError}
                      patronGroups={this.props.patronGroups}
                    />
                  }
                  { this.state.selectedUser &&
                    <Row>
                      <Col xs={6}>
                        <Field
                          name="fulfilmentPreference"
                          label="Fulfilment preference"
                          component={Select}
                          fullWidth
                          dataOptions={[{ label: 'Select fulfilment option', value: '' }, ...fulfilmentTypeOptions]}
                        />
                      </Col>
                      {/*   <Col xs={6}>
                        <Field
                          name="pickupLocation"
                          label="Pickup location"
                          component={Select}
                          fullWidth
                          dataOptions={[{ label: 'Select pickup location', value: '' }, ...requestTypeOptions]}
                        />
                      </Col> */}
                    </Row>
                  }
                </fieldset>
                <fieldset>
                  <legend>Request details</legend>
                  <Field
                    name="requestExpirationDate"
                    label="Request expiration date"
                    aria-label="Request expiration date"
                    backendDateStandard="YYYY-MM-DD"
                    component={Datepicker}
                  />
                  <Field
                    name="holdShelfExpirationDate"
                    label="Hold shelf expiration date"
                    aria-label="Hold shelf expiration date"
                    backendDateStandard="YYYY-MM-DD"
                    component={Datepicker}
                  />
                </fieldset>
              </Col>
            </Row>
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'requestForm',
  validate,
  navigationCheck: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(RequestForm);
