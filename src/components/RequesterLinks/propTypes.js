import PropTypes from 'prop-types';

const userShape = {
  lastName: PropTypes.string,
  firstName: PropTypes.string,
  middleName: PropTypes.string,
  preferredFirstName: PropTypes.string,
};

const propTypes = {
  userId: PropTypes.string.isRequired,
  user: PropTypes.shape(
    {
      id: PropTypes.string,
      barcode: PropTypes.string,
      personal: PropTypes.shape(userShape),
      ...userShape
    }
  ).isRequired,
};

export default propTypes;
