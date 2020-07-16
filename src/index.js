import React from 'react';
import Route from 'react-router-dom/Route';
import Switch from 'react-router-dom/Switch';
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
        path={`${path}/view/:requestId/:itemId/reorder`}
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
