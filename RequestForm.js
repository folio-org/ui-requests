import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Field, changeFieldValue } from 'redux-form';

import Button from '@folio/stripes-components/lib/Button';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';
import stripesForm from '@folio/stripes-form';

import UserDetail from './UserDetail';
import ItemDetail from './ItemDetail';

class RequestForm extends React.Component {

  static propTypes = {
    change: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    reset: PropTypes.func,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    onCancel: PropTypes.func,
    initialValues: PropTypes.object,
  //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      requestTypes: PropTypes.arrayOf(PropTypes.object),
      fulfilmentTypes: PropTypes.arrayOf(PropTypes.object),
    }),
  };

  constructor(props) {
    super(props);
    
    this.state = {
      selectedItem: null,
      selectedUser: null,
      selectedItemBarcode: null,
      selectedUserBarcode: null,
    }
    
    this.onChangeItem = this.onChangeItem.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onUserClick = this.onUserClick.bind(this);
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
    console.log("clicked with user val", this.state.selectedUserBarcode);
    this.props.findUser(this.state.selectedUserBarcode, 'barcode').then((result) => {
      this.setState({
        selectedUser: result,
      });
      this.props.change('requesterId', result.id);
    });
  }
  
  onItemClick() {
    console.log("clicked with item val", this.state.selectedItemBarcode)
    this.props.findItem(this.state.selectedItemBarcode, 'barcode').then((result) => {
      console.log("ITEM RESULT", result)
      this.setState({
        selectedItem: result,
      });
      this.props.change('itemId', result.id);
    });
  }

  render() {

    const {
      handleSubmit,
      reset,  // eslint-disable-line no-unused-vars
      pristine,
      submitting,
      onCancel,
      initialValues,
      optionLists,
    } = this.props;

    const addRequestFirstMenu = <PaneMenu><Button onClick={onCancel} title="close" aria-label="Close New Request Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></Button></PaneMenu>;
    const addRequestLastMenu = <PaneMenu><Button type="submit" title="Create New Request" disabled={pristine || submitting} onClick={handleSubmit}>Create Request</Button></PaneMenu>;
    const editRequestLastMenu = <PaneMenu><Button type="submit" title="Update Request" disabled={pristine || submitting} onClick={handleSubmit}>Update Request</Button></PaneMenu>;
    const requestTypeOptions = (optionLists.requestTypes || []).map(t => ({
      label: t.label, value: t.id }));
    const fulfilmentTypeOptions = (optionLists.fulfilmentTypes || []).map(t => ({ label: t.label, value: t.id }));

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" firstMenu={addRequestFirstMenu} lastMenu={false ? editRequestLastMenu : addRequestLastMenu} paneTitle={false ? 'Edit request' : 'New request'}>
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>Request record</h2>
                  <Field
                    label="Request Type *"
                    name="requestType"
                    component={Select}
                    fullWidth
                    dataOptions={[{ label: 'Select request type', value: '' }, ...requestTypeOptions]}
                  />
                  <fieldset>
                    <legend>Item info *</legend>
                    <Row>
                      <Col xs={9}>
                        <TextField
                          placeholder={'Enter item barcode'}
                          aria-label="Item barcode"
                          fullWidth
                          onChange={this.onChangeItem}
                        />
                        {/* <Field
                          placeholder={'Enter item barcode'}
                          aria-label="Item barcode"
                          fullWidth
                          component={TextField}
                          onChange={this.onChangeItem}
                        /> */}
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
                    { this.state.selectedItem && <ItemDetail itemRecord={this.state.selectedItem} /> }
                  </fieldset>
                  <fieldset>
                    <legend>Requester info *</legend>
                    <Row>
                      <Col xs={9}>
                        <TextField
                          placeholder={'Enter requester barcode'}
                          aria-label="Requester barcode"
                          fullWidth
                          onChange={this.onChangeUser}
                        />                          
                        {/* <Field
                          placeholder={'Enter requester barcode'}
                          aria-label="Requester barcode"
                          fullWidth
                          component={TextField}
                          onChange={this.onChangeUser}
                        /> */}
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
                    { this.state.selectedUser && <UserDetail userRecord={this.state.selectedUser} /> }
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
                        <Col xs={6}>
                          <Field
                            name="pickupLocation"
                            label="Pickup location"
                            component={Select}
                            fullWidth
                            dataOptions={[{ label: 'Select pickup location', value: '' }, ...requestTypeOptions]}                            
                          />                             
                        </Col>
                      </Row> 
                    }
                  </fieldset>
                  <fieldset>
                    <legend>Request details</legend>
                    <Field
                      name="requestExpirationDate"
                      label='Request expiration date'
                      aria-label="Request expiration date"
                      backendDateStandard="YYYY-MM-DD"
                      component={Datepicker}
                    />
                    <Field
                      name="holdShelfExpirationDate"
                      label='Hold shelf expiration date'
                      aria-label="Hold shelf expiration date"
                      backendDateStandard="YYYY-MM-DD"
                      component={Datepicker}
                    />
                  </fieldset>
              </Col>
            </Row>
          </Pane>
        </Paneset>
      </form>
    );
  }
}

export default stripesForm({
  form: 'requestForm',

  navigationCheck: true,
})(RequestForm);
