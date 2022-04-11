import React from 'react';
import { render } from '@testing-library/react';

import '../../../test/jest/__mock__';

import {
  CommandList,
  defaultKeyboardShortcuts
} from '@folio/stripes-components';
import RequestsRouteShortcutsWrapper from './RequestsRouteShortcutsWrapper';
import { buildStripes } from '../../../test/jest/helpers';
import { openNewRecordShortcut, focusSearchFieldShortcut } from '../../../test/jest/helpers/shortcuts';

const history = {
  push: jest.fn(),
};
const locationProp = {
  search: '',
  pathname: '',
};
const stripes = buildStripes();

stripes.hasPerm = jest.fn(() => true);

const renderRequestsRouteShortcutsWrapper = () => {
  const childElement = <input data-testid="childElement" id="input-request-search" />;

  const component = () => (
    <CommandList commands={defaultKeyboardShortcuts}>
      <RequestsRouteShortcutsWrapper
        history={history}
        location={locationProp}
        stripes={stripes}
      >
        <span>{childElement}</span>
      </RequestsRouteShortcutsWrapper>
    </CommandList>
  );

  return render(component());
};

describe('RequestsRouteShortcutsWrapper component', () => {
  afterEach(() => {
    history.push.mockClear();
    stripes.hasPerm.mockClear();
  });

  it('should render children correctly', () => {
    const { getByTestId } = renderRequestsRouteShortcutsWrapper();

    expect(getByTestId('childElement')).toBeInTheDocument();
  });

  describe('when openNewRecord shortcut is pressed', () => {
    it('history.push & stripes.hasPerm should be called', () => {
      renderRequestsRouteShortcutsWrapper();
      openNewRecordShortcut(document.body);
      expect(stripes.hasPerm).toHaveBeenCalled();
      expect(history.push).toHaveBeenCalled();
    });
  });

  describe('when focusSearchField shortcut is pressed', () => {
    it('focusSearchField is pressed, search field should be focused', () => {
      const { getByTestId } = renderRequestsRouteShortcutsWrapper();
      focusSearchFieldShortcut(document.body);
      expect(getByTestId('childElement')).toHaveFocus();
    });
  });

  describe('when user has not permission to create request', () => {
    it('openNewRecord shortcut should not work', () => {
      stripes.hasPerm = jest.fn(() => false);
      renderRequestsRouteShortcutsWrapper();
      openNewRecordShortcut(document.body);
      expect(stripes.hasPerm).toHaveBeenCalled();
      expect(history.push).not.toHaveBeenCalled();
    });
  });
});
