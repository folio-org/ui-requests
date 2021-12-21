import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import ReactRouterPropTypes from 'react-router-prop-types';

import {
  NoteCreateRoute,
  NoteViewRoute,
  NoteEditRoute,
  RequestQueueRoute,
  RequestsRoute,
} from './routes';

const RequestsRouting = (props) => {
  const { match: { path } } = props;

  return (
    <Switch>
      <Route
        path={`${path}/view/:requestId/:id/reorder`}
        component={RequestQueueRoute}
      />
      <Route
        path={`${path}/notes/new`}
        component={NoteCreateRoute}
      />
      <Route
        path={`${path}/notes/:noteId/edit`}
        component={NoteEditRoute}
      />
      <Route
        path={`${path}/notes/:noteId`}
        component={NoteViewRoute}
      />
      <Route
        path={path}
        render={() => <RequestsRoute {...props} />}
      />
    </Switch>
  );
};

RequestsRouting.propTypes = {
  match: ReactRouterPropTypes.match,
};

export default hot(module)(RequestsRouting);
