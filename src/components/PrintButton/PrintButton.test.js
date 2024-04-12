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

jest.mock('react-to-print', () => jest.fn(({
  trigger,
  content,
  onBeforeGetContent,
}) => {
  const handleClick = () => {
    Promise.resolve(onBeforeGetContent());
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
        onBeforePrint: props.onBeforePrint,
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
  });

  describe('When button is enabled', () => {
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
