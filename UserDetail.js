import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Field } from 'redux-form';

import Headline from '@folio/stripes-components/lib/Headline';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';
import Select from '@folio/stripes-components/lib/Select';

import css from './requests.css';
import { toUserAddress } from './constants';
import { getFullName, userHighlightBox } from './utils';

const UserDetail = ({ request,
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
  console.log("using request", request)
  console.log("delivery address", deliveryAddress)

  const id = newUser ? _.get(request, ['id']) : _.get(request, ['requesterId']);
  const name = newUser ? getFullName(request) : _.get(request, ['requesterName'], '');
  const barcode = newUser ? _.get(request, ['barcode']) : _.get(request, ['requesterBarcode'], '');
  // const recordLink = name ? <Link to={`/users/view/${id}`}>{name}</Link> : '';
  // const barcodeLink = barcode ? <Link to={`/users/view/${id}`}>{barcode}</Link> : '';
  //
  // let deliveryAddressDetail;
  // if (_.get(request, ['fulfilmentPreference'], '') === 'Delivery') {
  //   const deliveryAddressType = _.get(request, ['deliveryAddressTypeId'], null);
  //   if (deliveryAddressType) {
  //     const deliveryLocationsDetail = _.keyBy(request.requester.addresses, a => a.addressTypeId);
  //     deliveryAddressDetail = toUserAddress(deliveryLocationsDetail[deliveryAddressType]);
  //   }
  // }

  ///////////// TEMP FOR TESTING ///////////////////
  // request.proxyUserId = '6ddbf001-936e-41ef-904e-7dfe54056990'
  // request.proxy = {
  //   firstName: 'Charles',
  //   lastName: 'Woofy',
  //   barcode: 14082850283049,
  // };

  const proxyName = _.get(request, ['proxy', 'lastName'], '') + ', ' + _.get(request, ['proxy', 'firstName'], '');
  const proxyBarcode = _.get(request, ['proxy', 'barcode'], '');
  const proxySection = request && request.proxy ? userHighlightBox("Requester's proxy", proxyName, request.proxyUserId, proxyBarcode) : '';

  return (
    <div>
      {userHighlightBox('Requester', name, id, barcode)}
      <Row>
        <Col xs={4}>
          <KeyValue label="Patron group" value={patronGroup} />
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
            <KeyValue label="Fulfilment preference" value={_.get(request, ['fulfilmentPreference'], '')} />
          }
        </Col>
        <Col xs={4}>
        { selectedDelivery && deliveryLocations &&
          <Field
            name="deliveryAddressTypeId"
            label="Delivery Address"
            component={Select}
            fullWidth
            dataOptions={[{ label: 'Select address type', value: '' }, ...deliveryLocations]}
            onChange={onChangeAddress}
          />
        }
      </Col>
    </Row>
    { selectedDelivery &&
      <Row>
        <Col xsOffset={8} xs={4}>
          {deliveryAddress}
        </Col>
      </Row>
    }
        {/* {deliveryAddress &&
          <Col xs={4}>
            <KeyValue label="Delivery address" value={deliveryAddress} />
          </Col>
        }
        {pickupLocation &&
          <Col xs={4}>
            <KeyValue label="Pickup location" value={pickupLocation} />
          </Col>
        } */}

      {proxySection}
    </div>
  );
};

// UserDetail.propTypes = {
//   error: PropTypes.string,
//   patronGroups: PropTypes.shape({
//     hasLoaded: PropTypes.bool.isRequired,
//     isPending: PropTypes.bool,
//     other: PropTypes.shape({
//       totalRecords: PropTypes.number,
//     }),
//   }).isRequired,
//   user: PropTypes.object.isRequired,
// };

export default UserDetail;
