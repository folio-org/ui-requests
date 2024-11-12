import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Route, Switch } from 'react-router-dom';
import ReactRouterPropTypes from 'react-router-prop-types';

import { AppContextMenu } from '@folio/stripes/core';
import {
  checkScope,
  NavList,
  NavListItem,
  NavListSection,
  CommandList,
  defaultKeyboardShortcuts as keyboardCommands,
  HasCommand,
  KeyboardShortcutsModal,
  importShortcuts,
  renameShortcutLabels
} from '@folio/stripes/components';

import pkg from '../package';

import {
  NoteCreateRoute,
  NoteViewRoute,
  NoteEditRoute,
  RequestQueueRoute,
  RequestsRoute,
} from './routes';
import DeprecatedRequestsRoute from './deprecated/routes/RequestsRoute/RequestsRoute';
import DeprecatedRequestQueueRoute from './deprecated/routes/RequestQueueRoute/RequestQueueRoute';
import {
  SETTINGS_KEYS,
  SETTINGS_SCOPES,
} from './constants';

const RequestsRouting = (props) => {
  const {
    match: { path },
    history
  } = props;

  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  const focusSearchField = (handleToggle) => {
    handleToggle();
    const el = document.getElementById('input-request-search');
    if (el) {
      el.focus();
    } else {
      history.push(pkg.stripes.home);
    }
  };

  const shortcutModalToggle = (handleToggle) => {
    handleToggle();
    setShowKeyboardShortcutsModal(!showKeyboardShortcutsModal);
  };

  const shortcuts = [
    {
      name: 'search',
      handler: focusSearchField
    },
    {
      name: 'openShortcutModal',
      handler: setShowKeyboardShortcutsModal
    },
  ];

  const appSpecificShortcuts = importShortcuts(['new', 'edit', 'duplicateRecord', 'save', 'search', 'openShortcutModal']);

  const renamedShortcuts = renameShortcutLabels(appSpecificShortcuts,
    [
      { 'shortcut': 'new', 'label': 'Create a new record' },
      { 'shortcut': 'edit', 'label': 'Edit a record' },
      { 'shortcut': 'duplicateRecord', 'label': 'Duplicate a record' },
      { 'shortcut': 'save', 'label': 'Save a record' },
      { 'shortcut': 'search', 'label': 'Go to Search & Filter pane' },
      { 'shortcut': 'openShortcutModal', 'label': 'View keyboard shortcuts list' },
    ]);
  const isEcsEnv = props.resources.configs?.records?.[0]?.value?.createTitleLevelRequestsByDefault;
  const isEcsSettingsLoaded = props.resources.configs?.hasLoaded;
  const FinalRequestRoute = isEcsEnv ? RequestsRoute : DeprecatedRequestsRoute;
  const FinalRequestQueueRoute = isEcsEnv ? RequestQueueRoute : DeprecatedRequestQueueRoute;

  console.log('isEcsEnv: ', isEcsEnv);
  console.log('isEcsSettingsLoaded: ', isEcsSettingsLoaded);

  return (
    <>
      <CommandList commands={keyboardCommands}>
        <HasCommand
          commands={shortcuts}
          isWithinScope={checkScope}
          scope={document.body}
        >
          <AppContextMenu>
            {(handleToggle) => (
              <NavList>
                <NavListSection>
                  <NavListItem
                    id="requests-app-item"
                    onClick={() => { focusSearchField(handleToggle); }}
                  >
                    <FormattedMessage id="ui-requests.navigation.app" />
                  </NavListItem>
                  <NavListItem
                    id="keyboard-shortcuts-item"
                    onClick={() => { shortcutModalToggle(handleToggle); }}
                  >
                    <FormattedMessage id="ui-requests.appMenu.keyboardShortcuts" />
                  </NavListItem>
                </NavListSection>
              </NavList>
            )}
          </AppContextMenu>
          <Switch>
            {
              isEcsSettingsLoaded ?
                <Route
                  path={`${path}/view/:requestId/:id/reorder`}
                  // component={isEcsEnv ? RequestQueueRoute : DeprecatedRequestQueueRoute}
                  component={FinalRequestQueueRoute}
                /> :
                null
            }
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
            {
              isEcsSettingsLoaded ?
                <Route
                  path={path}
                  // render={() => isEcsEnv ? <RequestsRoute {...props} /> : <DeprecatedRequestsRoute {...props} />}
                  render={() => <FinalRequestRoute {...props} />}
                /> :
                null
            }
          </Switch>
        </HasCommand>
      </CommandList>
      {
        showKeyboardShortcutsModal &&
        (
          <KeyboardShortcutsModal
            open
            onClose={() => { setShowKeyboardShortcutsModal(false); }}
            allCommands={renamedShortcuts}
          />
        )
      }
    </>
  );
};

RequestsRouting.manifest = {
  configs: {
    type: 'okapi',
    records: 'items',
    path: 'settings/entries',
    params: {
      query: `(scope==${SETTINGS_SCOPES.CIRCULATION} and key==${SETTINGS_KEYS.GENERAL_TLR})`,
    },
  },
};

RequestsRouting.propTypes = {
  match: ReactRouterPropTypes.match,
  history: ReactRouterPropTypes.history
};

export default RequestsRouting;
