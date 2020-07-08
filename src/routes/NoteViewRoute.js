import React from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import { Redirect } from 'react-router';

import { NoteViewPage } from '@folio/stripes/smart-components';

import { formatNoteReferrerEntityData } from '../utils';
import { APP_ICON_NAME } from '../constants';
import { ReferredRecord } from '../components';

const NoteViewRoute = ({
  location,
  match,
  history,
}) => {
  const { noteId } = match.params;

  const onEdit = () => {
    history.replace({
      pathname: `/requests/notes/${noteId}/edit/`,
      state: location.state,
    });
  };

  return location.state
    ? (
      <NoteViewPage
        entityTypeTranslationKeys={{ request: 'ui-requests.notes.entityType.request' }}
        entityTypePluralizedTranslationKeys={{ request: 'ui-requests.notes.entityType.request.pluralized' }}
        navigateBack={history.goBack}
        onEdit={onEdit}
        paneHeaderAppIcon={APP_ICON_NAME}
        referredEntityData={formatNoteReferrerEntityData(location.state)}
        noteId={noteId}
        renderReferredRecord={() => <ReferredRecord values={location.state.referredRecordData} />}
      />
    )
    : <Redirect to="/requests" />;
};

NoteViewRoute.propTypes = {
  history: ReactRouterPropTypes.history.isRequired,
  location: ReactRouterPropTypes.location.isRequired,
  match: ReactRouterPropTypes.match.isRequired,
};

export default NoteViewRoute;
