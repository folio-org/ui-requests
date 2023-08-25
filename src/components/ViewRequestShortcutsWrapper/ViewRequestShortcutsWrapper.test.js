import React from 'react';
import { render } from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import {
  CommandList,
  defaultKeyboardShortcuts,
} from '@folio/stripes/components';
import ViewRequestShortcutsWrapper from './ViewRequestShortcutsWrapper';
import {
  duplicateRecordShortcut,
  collapseSectionsShortcut,
  expandSectionsShortcut,
  editRecordShortcut,
} from '../../../test/jest/helpers/shortcuts';

const mockOnEdit = jest.fn();
const mockOnDuplicate = jest.fn();
const mockAccordionStatusRef = () => ({
  current: {
    state: {},
    setStatus: jest.fn(),
  },
});

const mockStripes = {
  hasPerm: jest.fn(() => true),
};

mockAccordionStatusRef.current = {
  state: {},
  setStatus: jest.fn(),
};

const testIds = {
  childElement: 'childElement',
};

const renderViewRequestShortcuts = ({ isDuplicatingDisabled, isEditingDisabled }) => {
  const childElement = <input data-testid={testIds.childElement} id="input-request-search" />;

  const component = () => (
    <CommandList commands={defaultKeyboardShortcuts}>
      <ViewRequestShortcutsWrapper
        onEdit={mockOnEdit}
        onDuplicate={mockOnDuplicate}
        accordionStatusRef={mockAccordionStatusRef}
        isDuplicatingDisabled={isDuplicatingDisabled}
        isEditingDisabled={isEditingDisabled}
        stripes={mockStripes}
      >
        <span>{childElement}</span>
      </ViewRequestShortcutsWrapper>
    </CommandList>
  );

  return render(component());
};

describe('ViewRequestShortcutsWrapper component', () => {
  const notDisbaled = {
    isDuplicatingDisabled: false,
    isEditingDisabled: false,
  };

  afterEach(() => {
    mockOnEdit.mockClear();
    mockOnDuplicate.mockClear();
    mockStripes.hasPerm.mockClear();
    mockAccordionStatusRef.current.setStatus.mockClear();
  });

  it('should render children correctly', () => {
    const { getByTestId } = renderViewRequestShortcuts(notDisbaled);

    expect(getByTestId(testIds.childElement)).toBeInTheDocument();
  });

  describe('when isEditingDisabled is true', () => {
    it('Save shortcut should not work', () => {
      renderViewRequestShortcuts({ isDuplicatingDisabled: false, isEditingDisabled: true });
      editRecordShortcut(document.body);
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('when isEditingDisabled is false', () => {
    it('Save shortcut should work', () => {
      renderViewRequestShortcuts(notDisbaled);
      editRecordShortcut(document.body);
      expect(mockOnEdit).toHaveBeenCalled();
    });
  });

  describe('when isDuplicatingDisabled is true', () => {
    it('Duplicate shortcut should not work', () => {
      renderViewRequestShortcuts({ isDuplicatingDisabled: true, isEditingDisabled: false });
      duplicateRecordShortcut(document.body);
      expect(mockOnDuplicate).not.toHaveBeenCalled();
    });
  });

  describe('when isDuplicatingDisabled is false', () => {
    it('Duplicate shortcut should work', () => {
      renderViewRequestShortcuts(notDisbaled);
      duplicateRecordShortcut(document.body);
      expect(mockOnDuplicate).toHaveBeenCalled();
    });
  });

  describe('when accordionStatusRef is defined', () => {
    it('collapseSectionsShortcut should be executed', () => {
      renderViewRequestShortcuts(notDisbaled);
      collapseSectionsShortcut(document.body);
      expect(mockAccordionStatusRef.current.setStatus).toHaveBeenCalled();
    });

    it('expandSectionsShortcut should be executed', () => {
      renderViewRequestShortcuts(notDisbaled);
      expandSectionsShortcut(document.body);
      expect(mockAccordionStatusRef.current.setStatus).toHaveBeenCalled();
    });
  });

  describe('when user has no permission for editing', () => {
    it('should not call onEdit function', () => {
      mockStripes.hasPerm.mockReturnValue(false);
      renderViewRequestShortcuts(notDisbaled);
      editRecordShortcut(document.body);
      expect(mockOnEdit).not.toHaveBeenCalled();
    });
  });

  describe('when user has no permission for duplicating', () => {
    it('should not call onDuplicate function', () => {
      mockStripes.hasPerm.mockReturnValue(false);
      renderViewRequestShortcuts(notDisbaled);
      duplicateRecordShortcut(document.body);
      expect(mockOnDuplicate).not.toHaveBeenCalled();
    });
  });
});
