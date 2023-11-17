import { render } from '@folio/jest-config-stripes/testing-library/react';

import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';
import RequestsRouteShortcutsWrapper from './RequestsRouteShortcutsWrapper';
import { buildStripes } from '../../../test/jest/helpers';
import {
  openNewRecordShortcut,
  focusSearchFieldShortcut,
} from '../../../test/jest/helpers/shortcuts';

const history = {
  push: jest.fn(),
};
const locationProp = {
  search: '',
  pathname: '',
};
const stripes = buildStripes();
const mockButtonClick = jest.fn();

stripes.hasPerm = jest.fn(() => true);

const testIds = {
  childElement: 'childElement',
};

describe('RequestsRouteShortcutsWrapper component', () => {
  let childElement = <input data-testid={testIds.childElement} id="input-request-search" />;
  const renderRequestsRouteShortcutsWrapper = () => {
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

  afterEach(() => {
    history.push.mockClear();
    stripes.hasPerm.mockClear();
    mockButtonClick.mockClear();
  });

  it('should render children correctly', () => {
    const { getByTestId } = renderRequestsRouteShortcutsWrapper();

    expect(getByTestId(testIds.childElement)).toBeInTheDocument();
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
      expect(getByTestId(testIds.childElement)).toHaveFocus();
    });
  });

  describe('when input is not visible on the screen', () => {
    it('should click no result message button', () => {
      childElement = <button onClick={mockButtonClick} type="button" className="noResultsMessageButton---itbez">Click me</button>;
      renderRequestsRouteShortcutsWrapper();

      focusSearchFieldShortcut(document.body);
      expect(mockButtonClick).toHaveBeenCalled();
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

