import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import {
  Col,
  Headline,
  Row,
} from '@folio/stripes/components';

import css from '../../requests.css';
import { BarcodeLink, FullNameLink } from '../RequesterLinks';

const UserHighlightBox = ({
  title,
  userId,
  user,
}) => {
  return (
    <Row>
      <Col xs={12}>
        <div className={`${css.section} ${css.active}`}>
          <Headline size="medium" tag="h3">
            {title}
          </Headline>
          <div>
            <FullNameLink userId={userId} user={user} />
            {' '}
            <FormattedMessage id="ui-requests.barcode" />:
            {' '}
            <BarcodeLink userId={userId} user={user} />
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
  userId: PropTypes.string.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    barcode: PropTypes.string.isRequired,
    personal: PropTypes.shape(userShape),
    ...userShape
  }),
};

export default UserHighlightBox;
