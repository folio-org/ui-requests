import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import Headline from '@folio/stripes-components/lib/Headline';
import { Row, Col } from '@folio/stripes-components/lib/LayoutGrid';
import KeyValue from '@folio/stripes-components/lib/KeyValue';

import css from './requests.css';
import { toUserAddress } from './constants';
import { getFullName } from './utils';

const UserDetail = ({request, patronGroup, deliveryAddress, pickupLocation }) => {
  console.log("using request", request)
//  console.log("got groups", patronGroups)

  // patronGroups = patronGroups || [];
  // const patronGroupId = (request && request.patronGroup) || {};
//  const requesterGroup = (patronGroups && patronGroups.find(g => g.id === patronGroupId) || {}).group || '';

  const name = _.get(request, ['requesterName'], '');
  const barcode = _.get(request, ['requesterBarcode'], '');
  const recordLink = name ? <Link to={`/users/view/${request.requesterId}`}>{name}</Link> : '';
  const barcodeLink = barcode ? <Link to={`/users/view/${request.requesterId}`}>{barcode}</Link> : '';
  //
  // let deliveryAddressDetail;
  // if (_.get(request, ['fulfilmentPreference'], '') === 'Delivery') {
  //   const deliveryAddressType = _.get(request, ['deliveryAddressTypeId'], null);
  //   if (deliveryAddressType) {
  //     const deliveryLocationsDetail = _.keyBy(request.requester.addresses, a => a.addressTypeId);
  //     deliveryAddressDetail = toUserAddress(deliveryLocationsDetail[deliveryAddressType]);
  //   }
  // }

  return (
    <div>
      <Row>
        <Col xs={12}>
          <div className={`${css.section} ${css.active}`}>
            <Headline size="medium" tag="h3">
              Requester
            </Headline>
            <div>
              {recordLink} Barcode: {barcodeLink}
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <KeyValue label="Patron group" value={patronGroup} />
        </Col>
        <Col xs={4}>
          <KeyValue label="Fulfilment preference" value={_.get(request, ['fulfilmentPreference'], '')} />
        </Col>
        {deliveryAddress &&
          <Col xs={4}>
            <KeyValue label="Delivery address" value={deliveryAddress} />
          </Col>
        }
        {pickupLocation &&
          <Col xs={4}>
            <KeyValue label="Pickup location" value={pickupLocation} />
          </Col>
        }
      </Row>
    </div>
  );
};

UserDetail.propTypes = {
  error: PropTypes.string,
  patronGroups: PropTypes.shape({
    hasLoaded: PropTypes.bool.isRequired,
    isPending: PropTypes.bool,
    other: PropTypes.shape({
      totalRecords: PropTypes.number,
    }),
  }).isRequired,
  user: PropTypes.object.isRequired,
};

UserDetail.defaultProps = {
  error: '',
};

export default UserDetail;
