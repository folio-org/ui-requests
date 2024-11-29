import React, { useState } from 'react';
import PropTypes from 'prop-types';
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

RequestsRouting.propTypes = {
  match: ReactRouterPropTypes.match,
  history: ReactRouterPropTypes.history,
};

export default RequestsRouting;
