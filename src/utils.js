import { get } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Headline, Row } from '@folio/stripes/components';
import css from './requests.css';

// eslint-disable-next-line import/prefer-default-export
export function getFullName(user) {
  const userNameObj = user.personal || user;
  const lastName = get(userNameObj, ['lastName'], '');
  const firstName = get(userNameObj, ['firstName'], '');
  const middleName = get(userNameObj, ['middleName'], '');

  return `${lastName}${firstName ? ', ' : ' '}${firstName} ${middleName}`;
}

export function userHighlightBox(title, name, id, barcode) {
  const recordLink = name ? <Link to={`/users/view/${id}`}>{name}</Link> : '';
  const barcodeLink = barcode ? <Link to={`/users/view/${id}`}>{barcode}</Link> : '';

  return (
    <Row>
      <Col xs={12}>
        <div className={`${css.section} ${css.active}`}>
          <Headline size="medium" tag="h3">
            {title}
          </Headline>
          <div>
            {recordLink}
            {' '}
            Barcode:
            {' '}
            {barcodeLink}
          </div>
        </div>
      </Col>
    </Row>
  );
}
