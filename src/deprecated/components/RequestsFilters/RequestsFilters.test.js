import {
  render,
  screen,
} from '@folio/jest-config-stripes/testing-library/react';
import userEvent from '@folio/jest-config-stripes/testing-library/user-event';

import {
  Accordion,
} from '@folio/stripes/components';
import {
  CheckboxFilter,
  MultiSelectionFilter,
} from '@folio/stripes/smart-components';

import RequestsFilters from './RequestsFilters';
import { RequestLevelFilter } from '../../../components/RequestsFilters/RequestLevelFilter';
import { PickupServicePointFilter } from '../../../components/RequestsFilters/PickupServicePointFilter';
import { RetrievalServicePointFilter } from '../../../components/RequestsFilters/RetrievalServicePointFilter';

import {
  requestFilterTypes,
} from '../../../constants';

jest.mock('../../../components/RequestsFilters/RequestLevelFilter', () => ({
  RequestLevelFilter: jest.fn((props) => (<div {...props} />)),
}));
jest.mock('../../../components/RequestsFilters/PickupServicePointFilter', () => ({
  PickupServicePointFilter: jest.fn((props) => (<div {...props} />)),
}));
jest.mock('../../../components/RequestsFilters/RetrievalServicePointFilter', () => ({
  RetrievalServicePointFilter: jest.fn((props) => (<div {...props} />)),
}));
jest.mock('@folio/stripes/smart-components', () => ({
  CheckboxFilter: jest.fn((props) => (<div {...props} />)),
  MultiSelectionFilter: jest.fn((props) => (<div {...props} />)),
}));

const onChange = jest.fn();
const onClear = jest.fn();
const props = {
  activeFilters: {
    requestStatus: ['Open'],
    requestType: ['Hold'],
    pickupServicePoints: ['1'],
    retrievalServicePoints: ['1', '2'],
    tags: ['Urgent'],
    requestLevels: [],
    printStatus: ['Printed'],
  },
  onChange,
  onClear,
  resources: {
    servicePoints: {
      records: [{
        id: '1',
        name: 'Service Point 1',
      }],
    },
    tags: {
      records: [{
        label: 'Urgent',
      }],
    },
  },
  titleLevelRequestsFeatureEnabled: false,
  isViewPrintDetailsEnabled: false,
};
const testIds = {
  [requestFilterTypes.REQUEST_TYPE]: requestFilterTypes.REQUEST_TYPE,
  [`${requestFilterTypes.REQUEST_TYPE}Filter`]: `${requestFilterTypes.REQUEST_TYPE}Filter`,
  [requestFilterTypes.REQUEST_STATUS]: requestFilterTypes.REQUEST_STATUS,
  [`${requestFilterTypes.REQUEST_STATUS}Filter`]: `${requestFilterTypes.REQUEST_STATUS}Filter`,
  [requestFilterTypes.TAGS]: requestFilterTypes.TAGS,
  [requestFilterTypes.PRINT_STATUS]: requestFilterTypes.PRINT_STATUS,
  [`${requestFilterTypes.PRINT_STATUS}Filter`]: `${requestFilterTypes.PRINT_STATUS}Filter`,
  requestLevelFilter: 'requestLevelFilter',
  multiSelectionFilter: 'multiSelectionFilter',
  pickupServicePointFilter: 'pickupServicePointFilter',
  retrievalServicePointFilter: 'retrievalServicePointFilter',
};
const labelIds = {
  [requestFilterTypes.REQUEST_TYPE]: 'ui-requests.requestMeta.type',
  [requestFilterTypes.REQUEST_STATUS]: 'ui-requests.requestMeta.status',
  [requestFilterTypes.TAGS]: 'ui-requests.requestMeta.tags',
  [requestFilterTypes.PRINT_STATUS]: 'ui-requests.requestMeta.printStatus',
};

describe('RequestsFilters', () => {
  beforeEach(() => {
    render(<RequestsFilters {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Request type accordion', () => {
    it('should render request type accordion', () => {
      expect(screen.getByTestId(testIds[requestFilterTypes.REQUEST_TYPE])).toBeInTheDocument();
    });

    it('should render label for request type accordion', () => {
      expect(screen.getByText(labelIds[requestFilterTypes.REQUEST_TYPE])).toBeInTheDocument();
    });

    it('should trigger request type accordion with correct props', () => {
      expect(Accordion).toHaveBeenNthCalledWith(1, expect.objectContaining({
        displayClearButton: true,
        id: requestFilterTypes.REQUEST_TYPE,
        'data-testid': requestFilterTypes.REQUEST_TYPE,
        name: requestFilterTypes.REQUEST_TYPE,
        onClearFilter: expect.any(Function),
        header: expect.any(Function),
        separator: false,
      }), {});
    });

    it('should be called onClearFilter with request filter types Request type', async () => {
      await userEvent.click(screen.getByTestId(`${testIds[requestFilterTypes.REQUEST_TYPE]}Button`));

      expect(onClear).toHaveBeenCalledWith(requestFilterTypes.REQUEST_TYPE);
    });

    it('should render CheckboxFilter for Request type accordion', () => {
      expect(screen.getByTestId(testIds[`${requestFilterTypes.REQUEST_TYPE}Filter`])).toBeInTheDocument();
    });

    it('should trigger CheckboxFilter for Request type accordion with correct props', () => {
      expect(CheckboxFilter).toHaveBeenNthCalledWith(1, expect.objectContaining({
        'data-testid': testIds[`${requestFilterTypes.REQUEST_TYPE}Filter`],
        name: requestFilterTypes.REQUEST_TYPE,
        selectedValues: props.activeFilters[requestFilterTypes.REQUEST_TYPE],
        onChange,
      }), {});
    });
  });

  describe('Request status accordion', () => {
    it('should render request status accordion', () => {
      expect(screen.getByTestId(testIds[requestFilterTypes.REQUEST_STATUS])).toBeInTheDocument();
    });

    it('should render label for request status accordion', () => {
      expect(screen.getByText(labelIds[requestFilterTypes.REQUEST_STATUS])).toBeInTheDocument();
    });

    it('should trigger request status accordion with correct props', () => {
      expect(Accordion).toHaveBeenNthCalledWith(2, expect.objectContaining({
        displayClearButton: true,
        id: requestFilterTypes.REQUEST_STATUS,
        'data-testid': requestFilterTypes.REQUEST_STATUS,
        name: requestFilterTypes.REQUEST_STATUS,
        onClearFilter: expect.any(Function),
        header: expect.any(Function),
        separator: false,
      }), {});
    });

    it('should be called onClearFilter with request filter types Request status', async () => {
      await userEvent.click(screen.getByTestId(`${testIds[requestFilterTypes.REQUEST_STATUS]}Button`));

      expect(onClear).toHaveBeenCalledWith(requestFilterTypes.REQUEST_STATUS);
    });

    it('should render CheckboxFilter for Request status accordion', () => {
      expect(screen.getByTestId(testIds[`${requestFilterTypes.REQUEST_STATUS}Filter`])).toBeInTheDocument();
    });

    it('should trigger CheckboxFilter for Request status accordion with correct props', () => {
      expect(CheckboxFilter).toHaveBeenNthCalledWith(1, expect.objectContaining({
        'data-testid': testIds[`${requestFilterTypes.REQUEST_TYPE}Filter`],
        name: requestFilterTypes.REQUEST_TYPE,
        selectedValues: props.activeFilters[requestFilterTypes.REQUEST_TYPE],
        onChange,
      }), {});
    });
  });

  describe('Tags accordion', () => {
    it('should render tags accordion', () => {
      expect(screen.getByTestId(testIds[requestFilterTypes.TAGS])).toBeInTheDocument();
    });

    it('should render label for tags accordion', () => {
      expect(screen.getByText(labelIds[requestFilterTypes.TAGS])).toBeInTheDocument();
    });

    it('should trigger tags accordion with correct props', () => {
      expect(Accordion).toHaveBeenNthCalledWith(3, expect.objectContaining({
        displayClearButton: true,
        id: requestFilterTypes.TAGS,
        'data-testid': requestFilterTypes.TAGS,
        name: requestFilterTypes.TAGS,
        onClearFilter: expect.any(Function),
        header: expect.any(Function),
        separator: false,
      }), {});
    });

    it('should be called onClearFilter with request filter types tags', async () => {
      await userEvent.click(screen.getByTestId(`${testIds[requestFilterTypes.TAGS]}Button`));

      expect(onClear).toHaveBeenCalledWith(requestFilterTypes.TAGS);
    });

    it('should render MultiSelectionFilter for tags accordion', () => {
      expect(screen.getByTestId(testIds.multiSelectionFilter)).toBeInTheDocument();
    });

    it('should trigger MultiSelectionFilter for Tags accordion with correct props', () => {
      expect(MultiSelectionFilter).toHaveBeenCalledWith(expect.objectContaining({
        'data-testid': testIds.multiSelectionFilter,
        dataOptions: [{
          label: 'Urgent',
          value: 'Urgent',
        }],
        name: requestFilterTypes.TAGS,
        selectedValues: props.activeFilters.tags,
        onChange,
        ariaLabelledBy: requestFilterTypes.TAGS,
      }), {});
    });
  });

  describe('RequestLevelFilter', () => {
    it('should not render RequestLevelFilter', () => {
      expect(screen.queryByTestId(testIds.requestLevelFilter)).not.toBeInTheDocument();
    });

    describe('with titleLevelRequestsFeatureEnabled true', () => {
      const currentProps = {
        ...props,
        titleLevelRequestsFeatureEnabled: true,
      };
      beforeEach(() => {
        render(<RequestsFilters {...currentProps} />);
      });

      it('should render RequestLevelFilter', () => {
        expect(screen.getByTestId(testIds.requestLevelFilter)).toBeInTheDocument();
      });

      it('should trigger RequestLevelFilter with correct props', () => {
        expect(RequestLevelFilter).toHaveBeenCalledWith(expect.objectContaining({
          'data-testid': testIds.requestLevelFilter,
          activeValues: props.activeFilters.requestLevels,
          onChange,
          onClear,
        }), {});
      });
    });
  });

  describe('PickupServicePointFilter', () => {
    it('should render PickupServicePointFilter', () => {
      expect(screen.getByTestId(testIds.pickupServicePointFilter)).toBeInTheDocument();
    });

    it('should trigger PickupServicePointFilter with correct props', () => {
      expect(PickupServicePointFilter).toHaveBeenCalledWith(expect.objectContaining({
        'data-testid': testIds.pickupServicePointFilter,
        activeValues: props.activeFilters.pickupServicePoints,
        servicePoints: props.resources.servicePoints.records,
        onChange,
        onClear,
      }), {});
    });
  });

  describe('RetrievalServicePointFilter', () => {
    it('should render RetrievalServicePointFilter', () => {
      expect(screen.getByTestId(testIds.retrievalServicePointFilter)).toBeInTheDocument();
    });

    it('should trigger retrievalServicePointFilter with correct props', () => {
      expect(RetrievalServicePointFilter).toHaveBeenCalledWith(expect.objectContaining({
        'data-testid': testIds.retrievalServicePointFilter,
        activeValues: props.activeFilters.retrievalServicePoints,
        onChange,
        onClear,
      }), {});
    });
  });

  describe('When activeFilters prop is empty', () => {
    const propsWithoutFilters = {
      ...props,
      activeFilters: {},
      titleLevelRequestsFeatureEnabled: true,
    };
    const checkboxFilterCallOrder = {
      requestTypeCheckbox: 1,
      requestStatusCheckbox: 2,
    };

    beforeEach(() => {
      jest.clearAllMocks();

      render(
        <RequestsFilters
          {...propsWithoutFilters}
        />
      );
    });

    it('should trigger tags filter with correct selectedValues prop', () => {
      const expectedProps = {
        selectedValues: [],
      };

      expect(MultiSelectionFilter).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger request type filter with correct selectedValues prop', () => {
      const expectedProps = {
        selectedValues: [],
      };

      expect(CheckboxFilter).toHaveBeenNthCalledWith(checkboxFilterCallOrder.requestTypeCheckbox, expect.objectContaining(expectedProps), {});
    });

    it('should trigger request status filter with correct selectedValues prop', () => {
      const expectedProps = {
        selectedValues: [],
      };

      expect(CheckboxFilter).toHaveBeenNthCalledWith(checkboxFilterCallOrder.requestStatusCheckbox, expect.objectContaining(expectedProps), {});
    });

    it('should trigger pickup service point filter with correct activeValues prop', () => {
      const expectedProps = {
        activeValues: [],
      };

      expect(PickupServicePointFilter).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });

    it('should trigger request level filter with correct activeValues prop', () => {
      const expectedProps = {
        activeValues: [],
      };

      expect(RequestLevelFilter).toHaveBeenCalledWith(expect.objectContaining(expectedProps), {});
    });
  });

  describe('Print status accordion', () => {
    describe('when isViewPrintDetailsEnabled is disabled', () => {
      it('should not render Print status accordion', () => {
        expect(screen.queryByTestId(testIds[requestFilterTypes.PRINT_STATUS])).not.toBeInTheDocument();
      });
    });

    describe('when isViewPrintDetailsEnabled is enabled', () => {
      const currentProps = {
        ...props,
        isViewPrintDetailsEnabled: true,
      };
      beforeEach(() => {
        jest.clearAllMocks();
        render(<RequestsFilters {...currentProps} />);
      });

      it('should render Print status accordion', () => {
        expect(screen.getByTestId(testIds[requestFilterTypes.PRINT_STATUS])).toBeInTheDocument();
      });

      it('should render label for Print status accordion', () => {
        expect(screen.getByText(labelIds[requestFilterTypes.PRINT_STATUS])).toBeInTheDocument();
      });

      it('should trigger Print status accordion with correct props', () => {
        expect(Accordion).toHaveBeenNthCalledWith(4, expect.objectContaining({
          displayClearButton: true,
          id: requestFilterTypes.PRINT_STATUS,
          'data-testid': requestFilterTypes.PRINT_STATUS,
          name: requestFilterTypes.PRINT_STATUS,
          onClearFilter: expect.any(Function),
          header: expect.any(Function),
          separator: false,
        }), {});
      });

      it('should be called onClearFilter with request filter types Print status', async () => {
        await userEvent.click(screen.getByTestId(`${testIds[requestFilterTypes.PRINT_STATUS]}Button`));

        expect(onClear).toHaveBeenCalledWith(requestFilterTypes.PRINT_STATUS);
      });

      it('should render CheckboxFilter for Print status accordion', () => {
        expect(screen.getByTestId(testIds[`${requestFilterTypes.PRINT_STATUS}Filter`])).toBeInTheDocument();
      });

      it('should trigger CheckboxFilter for Print status accordion with correct props', () => {
        expect(CheckboxFilter).toHaveBeenNthCalledWith(3, expect.objectContaining({
          'data-testid': testIds[`${requestFilterTypes.PRINT_STATUS}Filter`],
          name: requestFilterTypes.PRINT_STATUS,
          selectedValues: props.activeFilters[requestFilterTypes.PRINT_STATUS],
          onChange,
        }), {});
      });
    });
  });
});
