import {
  render,
  screen,
  cleanup,
} from '@folio/jest-config-stripes/testing-library/react';

import '../../../test/jest/__mock__';

import PrintContent from './PrintContent';
import ComponentToPrint from '../ComponentToPrint';

jest.mock('../../utils', () => ({
  buildTemplate: jest.fn(() => () => {}),
}));
jest.mock('../ComponentToPrint', () => jest.fn(() => <div />));

const testIds = {
  printContent: 'printContent',
};

describe('PrintContent', () => {
  const basicProps = {
    template: 'template',
    dataSource: [
      {
        request: {
          requestID: 'requestID',
        },
      }
    ],
    printContentTestId: testIds.printContent,
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    cleanup();
  });

  describe('when "dataSource" is not an empty array', () => {
    beforeEach(() => {
      render(
        <PrintContent
          {...basicProps}
        />
      );
    });

    it('should be rendered into the document', () => {
      const printContent = screen.getByTestId(testIds.printContent);

      expect(printContent).toBeInTheDocument();
    });

    it('should trigger "ComponentToPrint" with correct props', () => {
      const expectedProps = {
        dataSource: basicProps.dataSource[0],
        templateFn: expect.any(Function),
      };

      expect(ComponentToPrint).toHaveBeenCalledWith(expectedProps, {});
    });
  });

  describe('when "dataSource" is an empty array', () => {
    const props = {
      ...basicProps,
      dataSource: [],
    };

    beforeEach(() => {
      render(
        <PrintContent
          {...props}
        />
      );
    });

    it('should not trigger "ComponentToPrint"', () => {
      expect(ComponentToPrint).not.toHaveBeenCalled();
    });
  });
});
