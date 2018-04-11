import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'redux-form';

import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Select from '@folio/stripes-components/lib/Select';

import { getFullName, userHighlightBox } from './utils';

const UserDetail = ({
  request,
  newUser,
  patronGroup,
  deliveryAddress,
  deliveryLocations,
  pickupLocation,
  selectedDelivery,
  fulfilmentTypeOptions,
  onChangeAddress,
  onChangeFulfilment,
}) => {
  const id = newUser ? _.get(request, ['id'], '-') : _.get(request, ['requesterId'], '-');
  const name = newUser ? getFullName(request) : _.get(request, ['requesterName'], '-');
  const barcode = newUser ? _.get(request, ['barcode'], '-') : _.get(request, ['requesterBarcode'], '-');

  const proxyName = `${_.get(request, ['proxy', 'lastName'], '-')}, ${_.get(request, ['proxy', 'firstName'], '-')}`;
  const proxyBarcode = _.get(request, ['proxy', 'barcode'], '-');
  const proxySection = request && request.proxy ? userHighlightBox('Requester\'s proxy', proxyName, request.proxyUserId, proxyBarcode) : '';

  return (
    <div>
      {userHighlightBox('Requester', name, id, barcode)}
      <Row>
        <Col xs={4}>
          <KeyValue label="Patron group" value={patronGroup || '-'} />
        </Col>
        <Col xs={4}>
          { newUser &&
            <Field
              name="fulfilmentPreference"
              label="Fulfilment preference"
              component={Select}
              fullWidth
              dataOptions={fulfilmentTypeOptions}
              onChange={onChangeFulfilment}
            />
          }
          { !newUser &&
            <KeyValue label="Fulfilment preference" value={_.get(request, ['fulfilmentPreference'], '-')} />
          }
        </Col>
        <Col xs={4}>
          { newUser && selectedDelivery && deliveryLocations &&
            <Field
              name="deliveryAddressTypeId"
              label="Delivery address"
              component={Select}
              fullWidth
              dataOptions={[{ label: 'Select address type', value: '' }, ...deliveryLocations]}
              onChange={onChangeAddress}
            />
          }
          { newUser && !selectedDelivery &&
            <Field
              name="pickupLocationId"
              label="Pickup location"
              component={Select}
              fullWidth
              dataOptions={[{ label: 'Select pickup location', value: '' }]}
              onChange={onChangeAddress}
            />
          }
          { !newUser && selectedDelivery &&
            <KeyValue label="Delivery address" value={deliveryAddress || '-'} />
          }
          { !newUser && !selectedDelivery &&
            <KeyValue label="Pickup location" value={pickupLocation || '-'} />
          }
        </Col>
      </Row>
      {proxySection}
    </div>
  );
};

UserDetail.propTypes = {
  deliveryAddress: PropTypes.string,
  deliveryLocations: PropTypes.arrayOf(PropTypes.object),
  fulfilmentTypeOptions: PropTypes.arrayOf(PropTypes.object),
  newUser: PropTypes.bool,
  onChangeAddress: PropTypes.func,
  onChangeFulfilment: PropTypes.func,
  patronGroup: PropTypes.string,
  pickupLocation: PropTypes.string,
  request: PropTypes.object.isRequired,
  selectedDelivery: PropTypes.bool,
};

UserDetail.defaultProps = {
  deliveryAddress: '',
  deliveryLocations: [],
  fulfilmentTypeOptions: [],
  newUser: false,
  onChangeAddress: () => {},
  onChangeFulfilment: () => {},
  patronGroup: '',
  pickupLocation: '',
  selectedDelivery: false,
};

export default UserDetail;
