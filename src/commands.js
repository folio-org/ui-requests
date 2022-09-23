import { FormattedMessage } from 'react-intl';

const commands = [
  {
    name: 'Create a new record',
    label: (<FormattedMessage id="ui-requests.shortcut.createRecord" />),
    shortcut: 'alt+n',
  },
  {
    name: 'Edit a record',
    label: (<FormattedMessage id="ui-requests.shortcut.editRecord" />),
    shortcut: 'mod+alt+e',
  },
  {
    name: 'Duplicate a record',
    label: (<FormattedMessage id="ui-requests.shortcut.duplicateRecord" />),
    shortcut: 'alt+c',
  },
  {
    name: 'Save a record',
    label: (<FormattedMessage id="ui-requests.shortcut.saveRecord" />),
    shortcut: 'mod+s',
  },
  {
    name: 'Go to Search & Filter pane',
    label: (<FormattedMessage id="ui-requests.shortcut.goToSearchFilter" />),
    shortcut: 'mod+alt+h',
  },
  {
    name: 'View keyboard shortcuts list',
    label: (<FormattedMessage id="ui-requests.shortcut.openShortcutModal" />),
    shortcut: 'mod+alt+k',
  }
];

export default commands;
