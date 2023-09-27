import { render } from '@folio/jest-config-stripes/testing-library/react';

import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';
import RequestsFormShortcutsWrapper from './RequestFormShortcutsWrapper';
import {
  cancelShortcut,
  saveShortcut,
  collapseSectionsShortcut,
  expandSectionsShortcut,
} from '../../../test/jest/helpers/shortcuts';

const mockOnSubmit = jest.fn();
const mockOnCanel = jest.fn();
const mockAccordionStatusRef = () => ({
  current: {
    state: {},
    setStatus: jest.fn(),
  },
});
mockAccordionStatusRef.current = {
  state: {},
  setStatus: jest.fn(),
};

const testIds = {
  childElement: 'childElement',
};

const renderRequestsFormShortcuts = (isSubmittingDisabled) => {
  const childElement = <input data-testid={testIds.childElement} id="input-request-search" />;

  const component = () => (
    <CommandList commands={defaultKeyboardShortcuts}>
      <RequestsFormShortcutsWrapper
        onSubmit={mockOnSubmit}
        onCancel={mockOnCanel}
        accordionStatusRef={mockAccordionStatusRef}
        isSubmittingDisabled={isSubmittingDisabled}
      >
        <span>{childElement}</span>
      </RequestsFormShortcutsWrapper>
    </CommandList>
  );

  return render(component());
};

describe('RequestsFormShortcutsWrapper component', () => {
  afterEach(() => {
    mockOnSubmit.mockClear();
    mockOnCanel.mockClear();
    mockAccordionStatusRef.current.setStatus.mockClear();
  });

  it('should render children correctly', () => {
    const { getByTestId } = renderRequestsFormShortcuts(true);

    expect(getByTestId(testIds.childElement)).toBeInTheDocument();
  });
  describe('when isSubmittingDisabled is true', () => {
    it('Save shortcut should not work', () => {
      renderRequestsFormShortcuts(true);
      saveShortcut(document.body);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
  describe('when isSubmittingDisabled is false', () => {
    it('Save shortcut should work', () => {
      renderRequestsFormShortcuts(false);
      saveShortcut(document.body);
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
  describe('when escape key is pressed', () => {
    it('onCancel should be executed', () => {
      renderRequestsFormShortcuts(false);
      cancelShortcut(document.body);
      expect(mockOnCanel).toHaveBeenCalled();
    });
  });
  describe('when accordionStatusRef is defined', () => {
    it('collapseSectionsShortcut should be executed', () => {
      renderRequestsFormShortcuts(false);
      collapseSectionsShortcut(document.body);
      expect(mockAccordionStatusRef.current.setStatus).toHaveBeenCalled();
    });
    it('expandSectionsShortcut should be executed', () => {
      renderRequestsFormShortcuts(false);
      expandSectionsShortcut(document.body);
      expect(mockAccordionStatusRef.current.setStatus).toHaveBeenCalled();
    });
  });
});
