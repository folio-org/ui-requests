import ReactToPrint from 'react-to-print';

import {
  render,
  screen,
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

describe('PrintButton', () => {
  beforeEach(() => {
    render(<PrintButton {...props} />);
  });

  it('should call "ReactToPrint" with correct props', () => {
    const expectedProps = {
      removeAfterPrint: true,
      onAfterPrint: props.onAfterPrint,
      onBeforePrint: props.onBeforePrint,
      onBeforeGetContent: props.onBeforeGetContent,
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
});
