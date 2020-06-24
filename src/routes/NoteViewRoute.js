import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router';

import { NoteViewPage } from '@folio/stripes/smart-components';

import { formatNoteReferrerEntityData } from '../utils';
import { APP_ICON_NAME } from '../constants';

const NoteViewRoute = ({
  location,
  match,
  history,
}) => {
  const { noteId } = match.params;

  return location.state
    ? (
      <NoteViewPage
        entityTypeTranslationKeys={{ request: 'ui-requests.notes.entityType.request' }}
        entityTypePluralizedTranslationKeys={{ request: 'ui-requests.notes.entityType.request.pluralized' }}
        navigateBack={history.goBack}
        onEdit={() => {}}
        paneHeaderAppIcon={APP_ICON_NAME}
        referredEntityData={formatNoteReferrerEntityData(location.state)}
        noteId={noteId}
      />
    )
    : <Redirect to="/requests" />;
};

NoteViewRoute.propTypes = {
  history: ReactRouterPropTypes.history,
  location: ReactRouterPropTypes.location,
  match: ReactRouterPropTypes.match,
};

export default NoteViewRoute;
