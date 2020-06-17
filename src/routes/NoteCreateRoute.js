import React from 'react';
import PropTypes from 'prop-types';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { NoteCreatePage } from '@folio/stripes/smart-components';

import {
  DOMAIN_NAME,
  APP_ICON_NAME,
} from '../constants';
import { formatNoteReferrerEntityData } from '../utils';

const NoteCreateRoute = ({
  location,
  history,
}) => {
  return location.state
    ? (
      <NoteCreatePage
        referredEntityData={formatNoteReferrerEntityData(location.state)}
        entityTypeTranslationKeys={{ request: 'ui-requests.notes.entityType.request' }}
        paneHeaderAppIcon={APP_ICON_NAME}
        paneTitle={<FormattedMessage id="ui-request.notes.newStaffNote" />}
        domain={DOMAIN_NAME}
        navigateBack={history.goBack}
      />
    )
    : <Redirect to="/requests" />;
};

NoteCreateRoute.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  location: ReactRouterPropTypes.location.isRequired,
};

export default NoteCreateRoute;
