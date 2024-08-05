import ReactToPrint from 'react-to-print';

import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@folio/jest-config-stripes/testing-library/react';

import PrintButton from './PrintButton';

const testIds = {
  testContent: 'testContent',
};
const props = {
  children: 'Print it',
  contentRef: {
    current: <div data-testid={testIds.testContent} />,
  },
  onAfterPrint: jest.fn(),
  onBeforePrint: jest.fn(),
  onBeforeGetContent: jest.fn(),
};
const singlePrintProps = {
  ...props,
  requestId: 'rick',
};

jest.mock('react-to-print', () => jest.fn(({
  trigger,
  content,
  onBeforeGetContent,
  onBeforePrint,
}) => {
  const handleClick = () => {
    Promise.resolve(onBeforeGetContent());
    Promise.resolve(onBeforePrint());
  };

  return (
    <div
      role="button"
      tabIndex="0"
      onClick={handleClick}
      onKeyDown={handleClick}
    >
      {trigger()}
      {content()}
    </div>
  );
}));

describe('PrintButton', () => {
  describe('When button is enabled', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render(
        <PrintButton
          {...props}
        />
      );
    });

    it('should call "ReactToPrint" with correct props', () => {
      const expectedProps = {
        removeAfterPrint: true,
        onAfterPrint: props.onAfterPrint,
        onBeforePrint: expect.any(Function),
        onBeforeGetContent: expect.any(Function),
        content: expect.any(Function),
        trigger: expect.any(Function),
      };

      expect(ReactToPrint).toHaveBeenCalledWith(expectedProps, {});
    });

    it('should render button text', () => {
      const buttonText = screen.getByText(props.children);

      expect(buttonText).toBeVisible();
    });

    it('should render content', () => {
      const content = screen.getByTestId(testIds.testContent);

      expect(content).toBeVisible();
    });

    it('should render wrapper with correct css class', () => {
      expect(wrapper.container.getElementsByClassName('enabled').length).toBe(1);
    });

    it('should handle print before content getting', async () => {
      const triggerButton = screen.getByText(props.children);

      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(props.onBeforeGetContent).toHaveBeenCalled();
      });
    });

    it('should handle onBeforePrint method when the print is triggered', async () => {
      const triggerButton = screen.getByText(props.children);

      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(props.onBeforePrint).toHaveBeenCalled();
      });
    });
  });

  describe('When button is enabled and single pickSlip is printed', () => {
    it('should handle onBeforePrint method when the print is triggered', async () => {
      render(
        <PrintButton
          {...singlePrintProps}
        />
      );
      const triggerButton = screen.getByText(props.children);

      fireEvent.click(triggerButton);

      await waitFor(() => {
        expect(props.onBeforePrint).toHaveBeenCalledWith('rick');
      });
    });
  });

  describe('When button is disabled', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = render(
        <PrintButton
          disabled
          {...props}
        />
      );
    });

    it('should render wrapper with correct css class', () => {
      expect(wrapper.container.getElementsByClassName('disabled').length).toBe(1);
    });
  });
});
