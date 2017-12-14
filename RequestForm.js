import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { Field } from 'redux-form';

import Button from '@folio/stripes-components/lib/Button';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';

import stripesForm from '@folio/stripes-form';

import UserDetail from './UserDetail';
import ItemDetail from './ItemDetail';
import { toUserAddress } from './constants';

function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'item.barcode') {
    return new Promise((resolve, reject) => {
      const uv = props.uniquenessValidator.itemUniquenessValidator;
      const query = `(barcode="${values.item.barcode}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((items) => {
        console.log("values", values)
        if (items.length < 1) {
          reject({ item: { barcode: 'Item with this barcode does not exist' } });
        } else if (values.requestType === 'Recall' &&
                   items[0].status.name !== 'Checked out' &&
                   items[0].status.name !== 'Checked out - Held' &&
                   items[0].status.name !== 'Checked out - Recalled') {
          reject({ item: { barcode: 'Only checked out items can be recalled' } });
        } else {
          resolve();
        }
      });
    });
  } else if (blurredField === 'requester.barcode') {
    return new Promise((resolve, reject) => {
      const uv = props.uniquenessValidator.userUniquenessValidator;
      const query = `(barcode="${values.requester.barcode}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((users) => {
        if (users.length < 1) {
          reject({ requester: { barcode: 'User with this barcode does not exist' } });
        } else {
          resolve();
        }
      });
    });
  }

  return new Promise(resolve => resolve());
}

class RequestForm extends React.Component {
  static propTypes = {
    change: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    findUser: PropTypes.func,
    findItem: PropTypes.func,
    findLoan: PropTypes.func,
    findRequestsForItem: PropTypes.func,
    initialValues: PropTypes.object,
    onCancel: PropTypes.func.isRequired,
    pristine: PropTypes.bool,
    submitting: PropTypes.bool,
    //  okapi: PropTypes.object,
    optionLists: PropTypes.shape({
      addressTypes: PropTypes.arrayOf(PropTypes.object),
      requestTypes: PropTypes.arrayOf(PropTypes.object),
      fulfilmentTypes: PropTypes.arrayOf(PropTypes.object),
    }),
    patronGroups: PropTypes.shape({
      hasLoaded: PropTypes.bool.isRequired,
      isPending: PropTypes.bool.isPending,
      other: PropTypes.shape({
        totalRecords: PropTypes.number,
      }),
    }).isRequired,
    dateFormatter: PropTypes.func.isRequired,
  };

  static defaultProps = {
    findUser: () => {},
    findItem: () => {},
    findLoan: () => {},
    findRequestsForItem: () => {},
    initialValues: {},
    optionLists: {},
    pristine: true,
    submitting: false,
  };

  constructor(props) {
    super(props);

    const { requester, item, loan, fulfilmentPreference, deliveryAddressTypeId } = props.initialValues;

    this.state = {
      selectedDelivery: fulfilmentPreference === 'Delivery',
      selectedAddressTypeId: deliveryAddressTypeId,
      selectedItem: item ? {
        itemRecord: item,
        borrowerRecord: loan.userDetail,
        loanRecord: loan,
      } : null,
      selectedUser: requester ? {
        patronGroup: requester.patronGroup,
        personal: requester,
      } : null,
      selectedItemBarcode: null,
      selectedUserBarcode: null,
      itemSelectionError: null,
      userSelectionError: null,
    };

    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeFulfilment = this.onChangeFulfilment.bind(this);
    this.onChangeItem = this.onChangeItem.bind(this);
    this.onChangeUser = this.onChangeUser.bind(this);
    this.onItemClick = this.onItemClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSelectUser = this.onSelectUser.bind(this);
    this.onUserClick = this.onUserClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    const initials = this.props.initialValues;
    const oldInitials = prevProps.initialValues;

    if (initials && initials.requester &&
        oldInitials && !oldInitials.requester) {
      initials.item.location = { name: initials.location };
      /* eslint react/no-did-update-set-state: 0 */
      this.setState({
        selectedAddressTypeId: initials.deliveryAddressTypeId,
        selectedDelivery: initials.fulfilmentPreference === 'Delivery',
        selectedItem: {
          itemRecord: initials.item,
          borrowerRecord: initials.loan.userDetail,
          loanRecord: initials.loan,
        },
        selectedUser: {
          patronGroup: initials.requester.patronGroup,
          personal: initials.requester,
        },
      });
    }
  }

  onChangeFulfilment(e) {
    this.setState({
      selectedDelivery: e.target.value === 'Delivery',
    });
  }

  onChangeAddress(e) {
    this.setState({
      selectedAddressTypeId: e.target.value,
    });
  }

  onChangeUser(e) {
    this.setState({
      selectedUserBarcode: e.target.value,
    });
  }

  // This function is called from the "search and select user" widget when
  // a user has been selected from the list
  onSelectUser(user) {
    if (user) {
      this.setState({
        selectedUserBarcode: user.barcode,
      });
      // Set the new value in the redux-form barcode field
      this.props.change('requester.barcode', user.barcode);
      this.onUserClick();
    }
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
      }
      // else {
      //   this.setState({
      //     userSelectionError: 'User with this barcode does not exist',
      //   });
      // }
    });
  }

  onItemClick() {
    const { findItem, findLoan, findUser, findRequestsForItem } = this.props;
    findItem(this.state.selectedItemBarcode, 'barcode').then((result) => {
      if (result.totalRecords > 0) {
        const item = result.items[0];
        this.props.change('itemId', item.id);

        // // If status is not checked out, then this item is not valid for a request
        // console.log("rqtype", this.state.requestType)
        // const validStatuses = ['Checked out', 'Checked out - Held', 'Checked out - Recalled'];
        // if (item && item.status && !validStatuses.includes(item.status.name)) {
        //   console.log('set state')
        //   this.setState({
        //     itemSelectionError: 'Only checked out items can be recalled',
        //     selectedItem: { itemRecord: item },
        //   });
        //   return item;
        // }
        //

        return Promise.all(
          [
            findLoan(item.id),
            findRequestsForItem(item.id),
          ],
        ).then((resultArray) => {
          const loan = resultArray[0].loans[0];
          const requestCount = resultArray[1].requests.length;

          if (loan) {
            return findUser(loan.userId).then((result2) => {
              const borrower = result2.users[0];
              this.setState({
                selectedItem: {
                  itemRecord: item,
                  loanRecord: loan,
                  borrowerRecord: borrower,
                  requestCount,
                },
              });
            });
          }
          // If no loan is found, just set the item record and rq count
          this.setState({
            selectedItem: {
              itemRecord: item,
              requestCount,
            },
          });

          return result;
        });
      }

      // Otherwise, continue and look for an associated loan
      //   return findLoan(item.id).then((result2) => {
      //     if (result2.totalRecords > 0) {
      //       const loan = result2.loans[0];
      //       // Look for the loan's associated borrower record
      //       return findUser(loan.userId).then((result3) => {
      //         const borrower = result3.users[0];
      //         this.setState({
      //           selectedItem: {
      //             itemRecord: item,
      //             loanRecord: loan,
      //             borrowerRecord: borrower,
      //           },
      //         });
      //       });
      //     }
      //
      //     // If no loan is found, just set the item record
      //     this.setState({
      //       selectedItem: { itemRecord: item },
      //     });
      //
      //     return result2;
      //   });
      // }

      // If no item is found
      // this.setState({
      //   itemSelectionError: 'Item with this barcode does not exist',
      // });

      return result;
    });
  }

  // This function only exists to enable 'do lookup on enter' for item and
  // user search
  onKeyDown(e, element) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
      if (element === 'item') {
        this.onItemClick();
      } else {
        this.onUserClick();
      }
    }
  }

  requireItem = value => (value ? undefined : 'Please select an item');
  requireUser = value => (value ? undefined : 'Please select a requester');

  render() {
    const {
      handleSubmit,
      initialValues,
      onCancel,
      optionLists,
      patronGroups,
      pristine,
      submitting,
    } = this.props;

    const { selectedUser } = this.state;

    const isEditForm = initialValues && initialValues.itemId !== null;

    const addRequestFirstMenu = <PaneMenu><Button onClick={onCancel} title="close" aria-label="Close New Request Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></Button></PaneMenu>;
    const addRequestLastMenu = <PaneMenu><Button id="clickable-create-request" type="button" title="Create New Request" disabled={pristine || submitting} onClick={handleSubmit}>Create Request</Button></PaneMenu>;
    const editRequestLastMenu = <PaneMenu><Button id="clickable-update-request" type="button" title="Update Request" disabled={pristine || submitting} onClick={handleSubmit}>Update Request</Button></PaneMenu>;
    const requestTypeOptions = _.sortBy(optionLists.requestTypes || [], ['label']).map(t => ({
      label: t.label, value: t.id, selected: initialValues.requestType === t.id }));
    const fulfilmentTypeOptions = _.sortBy(optionLists.fulfilmentTypes || [], ['label']).map(t => ({ label: t.label, value: t.id, selected: t.id === initialValues.fulfilmentPreference }));
    const labelAsterisk = isEditForm ? '' : '*';

    let deliveryLocations;
    let deliveryLocationsDetail = [];
    let addressDetail;
    if (selectedUser && selectedUser.personal && selectedUser.personal.addresses) {
      deliveryLocations = selectedUser.personal.addresses.map((a) => {
        const typeName = _.find(optionLists.addressTypes, { id: a.addressTypeId }).addressType;
        return { label: typeName, value: a.addressTypeId };
      });
      deliveryLocations = _.sortBy(deliveryLocations, ['label']);
      deliveryLocationsDetail = _.keyBy(selectedUser.personal.addresses, a => a.addressTypeId);
    }
    if (this.state.selectedAddressTypeId) {
      addressDetail = toUserAddress(deliveryLocationsDetail[this.state.selectedAddressTypeId]);
    }

    const selectUserControl = (<Pluggable
      aria-haspopup="true"
      type="find-user"
      {...this.props}
      dataKey="users"
      searchButtonStyle="primary"
      selectUser={this.onSelectUser}
      disableRecordCreation
      visibleColumns={['Name', 'Patron Group', 'Username', 'Barcode']}
    />);

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" height="100%" firstMenu={addRequestFirstMenu} lastMenu={isEditForm ? editRequestLastMenu : addRequestLastMenu} paneTitle={isEditForm ? 'Edit request' : 'New request'}>
            <Row>
              <Col sm={5} smOffset={1}>
                <h2>Request record</h2>
                { !isEditForm &&
                  <Field
                    label={`Request Type ${labelAsterisk}`}
                    name="requestType"
                    component={Select}
                    fullWidth
                    dataOptions={requestTypeOptions}
                    disabled={isEditForm}
                  />
                }
                { isEditForm &&
                  <KeyValue label="Request Type" value={initialValues.requestType} />
                }
                <fieldset id="section-item-info">
                  <legend>{`Item info ${labelAsterisk}`}</legend>
                  {!isEditForm &&
                    <Row>
                      <Col xs={9}>
                        <Field
                          name="item.barcode"
                          placeholder={'Enter item barcode'}
                          aria-label="Item barcode"
                          fullWidth
                          component={TextField}
                          onInput={this.onChangeItem}
                          onKeyDown={e => this.onKeyDown(e, 'item')}
                          validate={[this.requireItem]}
                        />
                      </Col>
                      <Col xs={3}>
                        <Button
                          id="clickable-select-item"
                          buttonStyle="primary noRadius"
                          fullWidth
                          onClick={this.onItemClick}
                          disabled={submitting}
                        >Select item</Button>
                      </Col>
                    </Row>
                  }
                  { (this.state.selectedItem || this.state.itemSelectionError) &&
                    <ItemDetail
                      item={this.state.selectedItem}
                      error={this.state.itemSelectionError}
                      patronGroups={patronGroups}
                      dateFormatter={this.props.dateFormatter}
                    />
                  }
                </fieldset>
                <br />
                <fieldset id="section-requester-info">
                  <legend>{`Requester info ${labelAsterisk}`}</legend>
                  {!isEditForm &&
                    <Row>
                      <Col xs={9}>
                        <Field
                          name="requester.barcode"
                          placeholder={'Enter requester barcode'}
                          aria-label="Requester barcode"
                          fullWidth
                          component={TextField}
                          onInput={this.onChangeUser}
                          onKeyDown={e => this.onKeyDown(e, 'requester')}
                          startControl={selectUserControl}
                          validate={this.requireUser}
                        />
                      </Col>
                      <Col xs={3}>
                        <Button
                          id="clickable-select-requester"
                          buttonStyle="primary noRadius"
                          fullWidth
                          onClick={this.onUserClick}
                          disabled={submitting}
                        >Select requester</Button>
                      </Col>
                    </Row>
                  }
                  { (this.state.selectedUser || this.state.userSelectionError) &&
                    <UserDetail
                      user={this.state.selectedUser}
                      error={this.state.userSelectionError}
                      patronGroups={patronGroups}
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
                          dataOptions={fulfilmentTypeOptions}
                          onChange={this.onChangeFulfilment}
                        />
                      </Col>
                      { this.state.selectedDelivery && deliveryLocations &&
                        <Col>
                          <Field
                            name="deliveryAddressTypeId"
                            label="Delivery Address"
                            component={Select}
                            fullWidth
                            dataOptions={[{ label: 'Select address type', value: '' }, ...deliveryLocations]}
                            onChange={this.onChangeAddress}
                          />
                        </Col>
                      }
                    </Row>
                  }
                  { this.state.selectedDelivery && this.state.selectedAddressTypeId &&
                    <Row>
                      <Col xsOffset={6} xs={6}>
                        {addressDetail}
                      </Col>
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
  asyncValidate,
  asyncBlurFields: ['item.barcode', 'requester.barcode'],
  navigationCheck: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(RequestForm);
