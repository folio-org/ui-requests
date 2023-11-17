import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';

import { Button } from '@folio/stripes/components';

import { Loading } from './components';
import ChooseRequestTypeDialog from './ChooseRequestTypeDialog';
import { REQUEST_LEVEL_TYPES } from './constants';

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

const labelIds = {
  chooseRequestType: 'ui-requests.moveRequest.chooseRequestType',
};
const testIds = {
  loading: 'loading',
};

describe('ChooseRequestTypeDialog', () => {
  const buttonCallOrder = {
    confirm: 1,
    cancel: 2,
  };
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const defaultTestProps = {
    onConfirm: mockOnConfirm,
    onCancel: mockOnCancel,
    requestTypes: [
      {
        id: 'testId',
        value: 'Page',
      }
    ],
    requestLevel: REQUEST_LEVEL_TYPES.ITEM,
    isLoading: false,
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

    it('should render modal title', () => {
      expect(screen.getByText(labelIds.chooseRequestType)).toBeInTheDocument();
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
