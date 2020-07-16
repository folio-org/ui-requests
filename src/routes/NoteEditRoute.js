import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router';
import { FormattedMessage } from 'react-intl';

import { NoteEditPage } from '@folio/stripes/smart-components';

import {
  DOMAIN_NAME,
  APP_ICON_NAME,
} from '../constants';
import { ReferredRecord } from '../components';
import { formatNoteReferrerEntityData } from '../utils';

const NoteEditRoute = ({
  location,
  history,
  match,
}) => {
  return location.state
    ? (
      <NoteEditPage
        domain={DOMAIN_NAME}
        entityTypePluralizedTranslationKeys={{ request: 'ui-requests.notes.entityType.request.pluralized' }}
        entityTypeTranslationKeys={{ request: 'ui-requests.notes.entityType.request' }}
        navigateBack={history.goBack}
        noteId={match.params.noteId}
        paneHeaderAppIcon={APP_ICON_NAME}
        paneTitle={<FormattedMessage id="ui-requests.notes.newStaffNote" />}
        renderReferredRecord={() => <ReferredRecord values={location.state.referredRecordData} />}
        referredEntityData={formatNoteReferrerEntityData(location.state)}
      />
    )
    : <Redirect to="/requests" />;
};

NoteEditRoute.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default NoteEditRoute;
