import React from 'react';
import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import '../test/jest/__mock__';

import { Button } from '@folio/stripes/components';

import { Loading } from './components';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';

jest.mock('./components', () => ({
  Loading: jest.fn(({ 'data-testid': dataTestId }) => (
    <div data-testid={dataTestId} />
  )),
}));
jest.mock('./utils', () => ({
  getRequestTypeOptions: jest.fn(() => ([{
    id: 'testId',
    value: 'testValue',
  }])),
}));

const testIds = {
  loading: 'loading',
};

describe('ChooseRequestTypeDialog', () => {
  const buttonCallOrder = {
    confirm: 1,
    cancel: 2,
  };
  const testItem = {};
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultTestProps = {
    item: testItem,
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
  };

  afterEach(() => {
    Loading.mockClear();
    Button.mockClear();
    mockOnConfirm.mockClear();
    mockOnCancel.mockClear();
  });

  describe('with default props', () => {
    beforeEach(() => {
      render(<ChooseRequestTypeDialog {...defaultTestProps} />);
    });

    it('should render confirm button', () => {
      expect(Button).toHaveBeenNthCalledWith(
        buttonCallOrder.confirm,
        expect.objectContaining({
          disabled: false,
        }), {}
      );
    });

    it('should render cancel button', () => {
      expect(Button).toHaveBeenNthCalledWith(
        buttonCallOrder.cancel,
        expect.objectContaining({
          disabled: false,
        }), {}
      );
    });

    it('should not render Loading component', () => {
      expect(screen.queryByTestId(testIds.loading)).not.toBeInTheDocument();
    });
  });

  describe('when isLoading is true', () => {
    beforeEach(() => {
      render(
        <ChooseRequestTypeDialog
          {...defaultTestProps}
          isLoading
        />
      );
    });

    it('should render confirm button', () => {
      expect(Button).toHaveBeenNthCalledWith(
        buttonCallOrder.confirm,
        expect.objectContaining({
          disabled: true,
        }), {}
      );
    });

    it('should render cancel button', () => {
      expect(Button).toHaveBeenNthCalledWith(
        buttonCallOrder.cancel,
        expect.objectContaining({
          disabled: true,
        }), {}
      );
    });

    it('should render Loading component', () => {
      expect(screen.getByTestId(testIds.loading)).toBeVisible();
    });
  });
});
