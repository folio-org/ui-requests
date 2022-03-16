import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { hot } from 'react-hot-loader';
import ReactRouterPropTypes from 'react-router-prop-types';

import { FormattedMessage } from 'react-intl';

import { AppContextMenu } from '@folio/stripes/core';
import {
  CommandList,
  defaultKeyboardShortcuts as keyboardCommands,
  HasCommand,
  KeyboardShortcutsModal,
  NavList,
  NavListItem,
  NavListSection,
} from '@folio/stripes-components';

import {
  NoteCreateRoute,
  NoteViewRoute,
  NoteEditRoute,
  RequestQueueRoute,
  RequestsRoute,
} from './routes';

const RequestsRouting = (props) => {
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = React.useState(false);
  const { match: { path } } = props;

  const toggleModal = () => setIsShortcutsModalOpen(prev => !prev);

  const keyCommands = [
    {
      name: 'openShortcutModal',
      handler: toggleModal,
    },
  ];

  return (
    <>
      <CommandList commands={keyboardCommands}>
        <HasCommand commands={keyCommands}>
          <AppContextMenu>
            {(handleToggle) => (
              <NavList>
                <NavListSection>
                  <NavListItem
                    id="keyboard-shortcuts-item"
                    onClick={() => {
                      handleToggle();
                      toggleModal();
                    }}
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
      {isShortcutsModalOpen && (
        <KeyboardShortcutsModal
          allCommands={keyboardCommands}
          onClose={toggleModal}
        />
      )}
    </>
  );
};

RequestsRouting.propTypes = {
  match: ReactRouterPropTypes.match,
};

export default hot(module)(RequestsRouting);
