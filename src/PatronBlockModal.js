import { take, orderBy } from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  Modal,
  Row
} from '@folio/stripes/components';

const PatronBlockModal = ({ open, onClose, patronBlocks, viewUserPath }) => {
  const blocks = take(orderBy(patronBlocks, ['metadata.updatedDate'], ['desc']), 3);
  const openModal = open && blocks.length > 0;
  const renderBlocks = blocks.map(block => {
    return (
      <Row>
        <Col xs>
          <b>{block.desc || ''}</b>
        </Col>
      </Row>
    );
  });

  return (
    <Modal
      open={openModal}
      dismissible
      onClose={onClose}
      label={
        <b>
          {' '}
          <FormattedMessage id="ui-requests.blockModal" />
        </b>
      }
    >
      <Row>
        <Col xs>
          <FormattedMessage id="ui-requests.blockedLabel" />
          `:`
        </Col>
      </Row>
      {renderBlocks}
      <br />
      <Row>
        <Col xs={8}>{(patronBlocks.length > 3) && <FormattedMessage id="ui-requests.additionalReasons" />}</Col>
        <Col xs={4}>
          <Row end="xs">
            <Col>
              <Button onClick={onClose}><FormattedMessage id="ui-requests.close" /></Button>
              <Button style={{ 'marginLeft': '15px' }} buttonStyle="primary" onClick={viewUserPath}><FormattedMessage id="ui-requests.detailsButton" /></Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

PatronBlockModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  patronBlocks: PropTypes.arrayOf(PropTypes.object),
  viewUserPath: PropTypes.func,
};

export default PatronBlockModal;
