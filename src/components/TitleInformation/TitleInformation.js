import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { injectIntl } from 'react-intl';

import {
  Col,
  Row,
  KeyValue,
} from '@folio/stripes/components';

import { getFormattedYears } from '../../routes/utils';
import { REQUEST_DATE } from '../../constants';

export const TEXT_SEPARATOR = ', ';
export const CONTRIBUTOR_SEPARATOR = '; ';
export const MAX_IDENTIFIERS_COUNT = 4;

export const getURL = (id, count) => <Link to={`/requests?filters=query=${id}&sort=${REQUEST_DATE}`}>{count}</Link>;
export const getTitleURL = (id, title) => <Link to={`/inventory/view/${id}`}>{title}</Link>;
export const getContributors = (data, separator) => data.map(({ name }) => name).join(separator);
export const getEditions = (data, separator) => data.join(separator);
export const getIdentifiers = (data, separator, limit) => data.slice(0, limit).map(({ value }) => value).join(separator);

const TitleInformation = (props) => {
  const {
    titleLevelRequestsLink,
    instanceId,
    titleLevelRequestsCount,
    title,
    contributors,
    publications,
    editions,
    identifiers,
    intl:{
      formatMessage,
    },
  } = props;

  return (
    <>
      <Row>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.titleLevelRequests' })}
            value={titleLevelRequestsLink
              ? getURL(instanceId, titleLevelRequestsCount)
              : titleLevelRequestsCount
            }
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.title' })}
            value={getTitleURL(instanceId, title)}
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.contributors' })}
            value={getContributors(contributors, CONTRIBUTOR_SEPARATOR)}
          />
        </Col>
      </Row>
      <Row>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.publicationsDate' })}
            value={getFormattedYears(publications)}
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.editions' })}
            value={getEditions(editions, TEXT_SEPARATOR)}
          />
        </Col>
        <Col xs={4}>
          <KeyValue
            label={formatMessage({ id: 'ui-requests.titleInformation.identifiers' })}
            value={getIdentifiers(identifiers, TEXT_SEPARATOR, MAX_IDENTIFIERS_COUNT)}
          />
        </Col>
      </Row>
    </>
  );
};

TitleInformation.defaultProps = {
  contributors: [],
  publications: [],
  editions: [],
  identifiers: [],
  titleLevelRequestsLink: true,
};

TitleInformation.propTypes = {
  titleLevelRequestsLink: PropTypes.bool,
  titleLevelRequestsCount: PropTypes.number.isRequired,
  instanceId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  contributors: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
  })),
  publications: PropTypes.arrayOf(PropTypes.shape({
    dateOfPublication: PropTypes.string,
  })),
  editions: PropTypes.arrayOf(PropTypes.string),
  identifiers: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
  })),
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TitleInformation);
