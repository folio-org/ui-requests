import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Headline,
  Row,
  NoValue,
} from '@folio/stripes/components';

import css from '../../requests.css';
import { getFullName } from '../../utils';

const createUserHighlightBoxLink = (linkText, id) => {
  return linkText ? <Link to={`/users/view/${id}`}>{linkText}</Link> : '';
};

const UserHighlightBox = ({
  title,
  user,
}) => {
  const name = user ? getFullName(user) : null;
  const recordLink = createUserHighlightBoxLink(name, user?.id);
  const barcodeLink = createUserHighlightBoxLink(user?.barcode, user?.id);

  return (
    <Row>
      <Col xs={12}>
        <div className={`${css.section} ${css.active}`}>
          <Headline size="medium" tag="h3">
            {title}
          </Headline>
          <div>
            {recordLink || <FormattedMessage id="ui-requests.errors.user.unknown" />}
            {' '}
            <FormattedMessage id="ui-requests.barcode" />:
            {' '}
            {user?.barcode ? barcodeLink : <NoValue />}
          </div>
        </div>
      </Col>
    </Row>
  );
};

const userShape = {
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  preferredFirstName: PropTypes.string,
};

UserHighlightBox.propTypes = {
  title: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    barcode: PropTypes.string.isRequired,
    personal: PropTypes.shape(userShape),
    ...userShape
  }),
};

export default UserHighlightBox;
