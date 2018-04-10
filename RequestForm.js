import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import Button from '@folio/stripes-components/lib/Button';
import Datepicker from '@folio/stripes-components/lib/Datepicker';
import Headline from '@folio/stripes-components/lib/Headline';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import MetaSection from '@folio/stripes-components/lib/MetaSection';
import Pane from '@folio/stripes-components/lib/Pane';
import Paneset from '@folio/stripes-components/lib/Paneset';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';
import Pluggable from '@folio/stripes-components/lib/Pluggable';
import Select from '@folio/stripes-components/lib/Select';
import TextField from '@folio/stripes-components/lib/TextField';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';

import stripesForm from '@folio/stripes-form';

import UserDetail from './UserDetail';
import ItemDetail from './ItemDetail';
import { toUserAddress } from './constants';

/**
 * on-blur validation checks that the requested item is checked out
 * and that the requesting user exists.
 *
 * redux-form requires that the rejected Promises have the form
 * { field: "error message" }
 * hence the eslint-disable-next-line comments since ESLint is picky
 * about the format of rejected promises.
 *
 * @see https://redux-form.com/7.3.0/examples/asyncchangevalidation/
 */
function asyncValidate(values, dispatch, props, blurredField) {
  if (blurredField === 'item.barcode') {
    return new Promise((resolve, reject) => {
      const uv = props.uniquenessValidator.itemUniquenessValidator;
      const query = `(barcode="${values.item.barcode}")`;
      uv.reset();
      uv.GET({ params: { query } }).then((items) => {
        if (items.length < 1) {
          // eslint-disable-next-line prefer-promise-reject-errors
          reject({ item: { barcode: 'Item with this barcode does not exist' } });
        } else if (items[0].status.name !== 'Checked out' &&
                   items[0].status.name !== 'Checked out - Held' &&
                   items[0].status.name !== 'Checked out - Recalled') {
          if (values.requestType === 'Recall') {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ item: { barcode: 'Only checked out items can be recalled' } });
          } else if (values.requestType === 'Hold') {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject({ item: { barcode: 'Only checked out items can be held' } });
          }
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
          // eslint-disable-next-line prefer-promise-reject-errors
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
    stripes: PropTypes.shape({
      intl: PropTypes.object.isRequired,
    }).isRequired,
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

    const {
      requester,
      item,
      fulfilmentPreference,
      deliveryAddressTypeId,
    } = props.initialValues;

    this.state = {
      selectedDelivery: fulfilmentPreference === 'Delivery',
      selectedAddressTypeId: deliveryAddressTypeId,
      selectedItem: item ? {
        itemRecord: item,
      } : null,
      selectedUser: requester ? {
        patronGroup: requester.patronGroup,
        personal: requester,
      } : null,
      userSelectionError: null,
    };

    this.onChangeAddress = this.onChangeAddress.bind(this);
    this.onChangeFulfilment = this.onChangeFulfilment.bind(this);
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

  // This function is called from the "search and select user" widget when
  // a user has been selected from the list
  // TODO: see if this still works when the select user widget is functional again
  onSelectUser(user) {
    if (user) {
      // Set the new value in the redux-form barcode field
      this.props.change('requester.barcode', user.barcode);
      setTimeout(() => this.onUserClick());
    }
  }

  onUserClick() {
    this.setState({ selectedUser: null });
    const barcode = this.requesterBarcodeField.getRenderedComponent().input.value;

    this.props.findUser(barcode, 'barcode').then((result) => {
      if (result.totalRecords === 1) {
        this.setState({
          selectedUser: result.users[0],
          userSelectionError: null,
        });
        this.props.change('requesterId', result.users[0].id);
      }
    });
  }

  onItemClick() {
    this.setState({ selectedItem: null });
    const { findItem, findLoan, findRequestsForItem } = this.props;
    const barcode = this.itemBarcodeField.getRenderedComponent().input.value;

    findItem(barcode, 'barcode').then((result) => {
      if (result.totalRecords === 1) {
        const item = result.items[0];
        this.props.change('itemId', item.id);

        // Setting state here is redundant with what follows, but it lets us
        // display the matched item as quickly as possible, without waiting for
        // the slow loan and request lookups
        this.setState({
          selectedItem: {
            item: {
              instanceId: item.instanceId,
              holdingsRecordId: item.holdingsRecordId,
            },
            itemBarcode: item.barcode,
            itemId: item.id,
            title: item.title,
            // author: ,
            location: item.permanentLocation.name,
            itemStatus: item.status.name,
          },
        });

        return Promise.all(
          [
            findLoan(item.id),
            findRequestsForItem(item.id),
          ],
        ).then((resultArray) => {
          const loan = resultArray[0].loans[0];
          const itemRequestCount = resultArray[1].requests.length;
          if (loan) {
            this.setState(prevState => ({
              selectedItem: {
                ...prevState.selectedItem,
                loan: {
                  dueDate: loan.dueDate,
                },
                itemRequestCount,
              },
            }));
          }
          // If no loan is found, just set the item record and rq count
          this.setState(prevState => ({
            selectedItem: {
              ...prevState.selectedItem,
              itemRequestCount,
            },
          }));

          return result;
        });
      }

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
      stripes: { intl },
    } = this.props;

    const { selectedUser } = this.state;

    const isEditForm = (initialValues && initialValues.itemId);

    const addRequestFirstMenu = <PaneMenu><Button onClick={onCancel} title="close" aria-label="Close New Request Dialog"><span style={{ fontSize: '30px', color: '#999', lineHeight: '18px' }} >&times;</span></Button></PaneMenu>;
    const addRequestLastMenu = <PaneMenu><Button id="clickable-create-request" type="button" title="Create New Request" disabled={pristine || submitting} onClick={handleSubmit}>Create Request</Button></PaneMenu>;
    const editRequestLastMenu = <PaneMenu><Button id="clickable-update-request" type="button" title="Update Request" disabled={pristine || submitting} onClick={handleSubmit}>Update Request</Button></PaneMenu>;
    const requestTypeOptions = _.sortBy(optionLists.requestTypes || [], ['label']).map(t => ({ label: t.label, value: t.id, selected: initialValues.requestType === t.id }));
    const fulfilmentTypeOptions = _.sortBy(optionLists.fulfilmentTypes || [], ['label']).map(t => ({ label: t.label, value: t.id, selected: t.id === initialValues.fulfilmentPreference }));
    const labelAsterisk = isEditForm ? '' : '*';
    const disableRecordCreation = true;

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

    let patronGroupName;
    if (patronGroups && this.state.selectedUser) {
      const group = patronGroups.records.find(g => g.id === this.state.selectedUser.patronGroup);
      if (group) { patronGroupName = group.desc; }
    }

    // map column-IDs to table-header-values
    const columnMapping = {
      name: intl.formatMessage({ id: 'ui-requests.user.name' }),
      patronGroup: intl.formatMessage({ id: 'ui-requests.user.patronGroup' }),
      username: intl.formatMessage({ id: 'ui-requests.user.username' }),
      barcode: intl.formatMessage({ id: 'ui-requests.user.barcode' }),
    };

    return (
      <form id="form-requests" style={{ height: '100%', overflow: 'auto' }}>
        <Paneset isRoot>
          <Pane defaultWidth="100%" height="100%" firstMenu={addRequestFirstMenu} lastMenu={isEditForm ? editRequestLastMenu : addRequestLastMenu} paneTitle={isEditForm ? 'Edit request' : 'New request'}>
            <Headline tag="h3" margin="medium" faded>
              Request information
            </Headline>
            { isEditForm &&
              <Col xs={12}>
                <MetaSection
                  id="requestInfoMeta"
                  contentId="requestInfoMetaContent"
                  lastUpdatedDate={initialValues.metaData.updatedDate}
                />
              </Col>
            }
            <Row>
              <Col xs={8}>
                <Row>
                  <Col xs={3}>
                    { !isEditForm &&
                      <Field
                        label="Request type"
                        name="requestType"
                        component={Select}
                        fullWidth
                        dataOptions={requestTypeOptions}
                        disabled={isEditForm}
                      />
                    }
                    { isEditForm &&
                      <KeyValue label="Request type" value={initialValues.requestType} />
                    }
                  </Col>
                  <Col xs={3}>
                    <Field
                      name="requestExpirationDate"
                      label="Request expiration date"
                      aria-label="Request expiration date"
                      backendDateStandard="YYYY-MM-DD"
                      component={Datepicker}
                    />
                  </Col>
                </Row>
                <hr />
                <div id="section-item-info">
                  <Headline tag="h3" margin="medium" faded>
                    {`Item information ${labelAsterisk}`}
                  </Headline>
                  <Row>
                    <Col xs={12}>
                      {!isEditForm &&
                        <Row>
                          <Col xs={9}>
                            <Field
                              name="item.barcode"
                              placeholder="Scan or enter item barcode"
                              aria-label="Item barcode"
                              fullWidth
                              component={TextField}
                              withRef
                              ref={(input) => { this.itemBarcodeField = input; }}
                              onInput={this.onItemClick}
                              onKeyDown={e => this.onKeyDown(e, 'item')}
                              validate={this.requireItem}
                            />
                          </Col>
                          <Col xs={3}>
                            <Button
                              id="clickable-select-item"
                              buttonStyle="primary noRadius"
                              fullWidth
                              onClick={this.onItemClick}
                              disabled={submitting}
                            >Enter
                            </Button>
                          </Col>
                        </Row>
                      }
                      { this.state.selectedItem &&
                        <ItemDetail
                          request={this.state.selectedItem}
                          newRequest
                          dateFormatter={this.props.dateFormatter}
                        />
                      }
                    </Col>
                  </Row>
                </div>
                <hr />
                <div id="section-requester-info">
                  <Headline tag="h3" margin="medium" faded>
                    {`Requester information ${labelAsterisk}`}
                  </Headline>
                  <Row>
                    <Col xs={12}>
                      {!isEditForm &&
                        <Row>
                          <Col xs={9}>
                            <Field
                              name="requester.barcode"
                              placeholder="Scan or enter requester barcode"
                              aria-label="Requester barcode"
                              fullWidth
                              component={TextField}
                              withRef
                              ref={(input) => { this.requesterBarcodeField = input; }}
                              onInput={this.onUserClick}
                              onKeyDown={e => this.onKeyDown(e, 'requester')}
                              validate={this.requireUser}
                            />
                            <Pluggable
                              aria-haspopup="true"
                              type="find-user"
                              searchLabel="Requester look-up"
                              marginTop0
                              searchButtonStyle="link"
                              {...this.props}
                              dataKey="users"
                              selectUser={this.onSelectUser}
                              disableRecordCreation={disableRecordCreation}
                              visibleColumns={['name', 'patronGroup', 'username', 'barcode']}
                              columnMapping={columnMapping}
                            />

                          </Col>
                          <Col xs={3}>
                            <Button
                              id="clickable-select-requester"
                              buttonStyle="primary noRadius"
                              fullWidth
                              onClick={this.onUserClick}
                              disabled={submitting}
                            >Enter
                            </Button>
                          </Col>
                        </Row>
                      }
                      { this.state.selectedUser &&
                        <UserDetail
                          request={this.state.selectedUser}
                          newUser
                          patronGroup={patronGroupName}
                          selectedDelivery={this.state.selectedDelivery}
                          deliveryAddress={addressDetail}
                          deliveryLocations={deliveryLocations}
                          fulfilmentTypeOptions={fulfilmentTypeOptions}
                          onChangeAddress={this.onChangeAddress}
                          onChangeFulfilment={this.onChangeFulfilment}
                        />
                      }
                      {/* <fieldset>
                        <legend>Request details</legend>

                        <Field
                          name="holdShelfExpirationDate"
                          label="Hold shelf expiration date"
                          aria-label="Hold shelf expiration date"
                          backendDateStandard="YYYY-MM-DD"
                          component={Datepicker}
                        />
                      </fieldset> */}
                    </Col>
                  </Row>
                </div>
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
  asyncValidate,
  asyncBlurFields: ['item.barcode', 'requester.barcode'],
  navigationCheck: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
})(RequestForm);
