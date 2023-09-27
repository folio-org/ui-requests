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
import { RequestLevelFilter } from './RequestLevelFilter';
import { PickupServicePointFilter } from './PickupServicePointFilter';

import {
  requestFilterTypes,
} from '../../constants';

jest.mock('./RequestLevelFilter', () => ({
  RequestLevelFilter: jest.fn((props) => (<div {...props} />)),
}));
jest.mock('./PickupServicePointFilter', () => ({
  PickupServicePointFilter: jest.fn((props) => (<div {...props} />)),
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
    tags: ['Urgent'],
    requestLevels: [],
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
};
const accordionSelector = [
  requestFilterTypes.REQUEST_TYPE,
  requestFilterTypes.REQUEST_STATUS,
  requestFilterTypes.TAGS,
];
const testIds = {
  [requestFilterTypes.REQUEST_TYPE]: requestFilterTypes.REQUEST_TYPE,
  [`${requestFilterTypes.REQUEST_TYPE}Filter`]: `${requestFilterTypes.REQUEST_TYPE}Filter`,
  [requestFilterTypes.REQUEST_STATUS]: requestFilterTypes.REQUEST_STATUS,
  [`${requestFilterTypes.REQUEST_STATUS}Filter`]: `${requestFilterTypes.REQUEST_STATUS}Filter`,
  [requestFilterTypes.TAGS]: requestFilterTypes.TAGS,
  requestLevelFilter: 'requestLevelFilter',
  multiSelectionFilter: 'multiSelectionFilter',
  pickupServicePointFilter: 'pickupServicePointFilter',
};
const labelIds = {
  [requestFilterTypes.REQUEST_TYPE]: 'ui-requests.requestMeta.type',
  [requestFilterTypes.REQUEST_STATUS]: 'ui-requests.requestMeta.status',
  [requestFilterTypes.TAGS]: 'ui-requests.requestMeta.tags',
};

describe('RequestsFilters', () => {
  beforeEach(() => {
    render(<RequestsFilters {...props} />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  accordionSelector.forEach((requestFilterType, index) => {
    describe(`${requestFilterType} accordion`, () => {
      const currentAccordionIndex = index + 1;

      it(`should render ${requestFilterType} accordion`, () => {
        expect(screen.getByTestId(testIds[requestFilterType])).toBeInTheDocument();
      });

      it(`should render label for ${requestFilterType} accordion`, () => {
        expect(screen.getByText(labelIds[requestFilterType])).toBeInTheDocument();
      });

      it(`should trigger ${requestFilterType} accordion with correct props`, () => {
        expect(Accordion).toHaveBeenNthCalledWith(currentAccordionIndex, expect.objectContaining({
          displayClearButton: true,
          id: requestFilterType,
          'data-testid': requestFilterType,
          name: requestFilterType,
          onClearFilter: expect.any(Function),
          header: expect.any(Function),
          separator: false,
        }), {});
      });

      it(`should be called onClearFilter with request filter types ${requestFilterType}`, async () => {
        await userEvent.click(screen.getByTestId(`${testIds[requestFilterType]}Button`));

        expect(onClear).toHaveBeenCalledWith(requestFilterType);
      });

      if (requestFilterType === requestFilterTypes.TAGS) {
        describe(`MultiSelectionFilter for ${requestFilterType} accordion`, () => {
          it(`should render MultiSelectionFilter for ${requestFilterType} accordion`, () => {
            expect(screen.getByTestId(testIds.multiSelectionFilter)).toBeInTheDocument();
          });

          it(`should trigger MultiSelectionFilter for ${requestFilterType} accordion with correct props`, () => {
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
      } else {
        describe(`CheckboxFilter for ${requestFilterType} accordion`, () => {
          it(`should render CheckboxFilter for ${requestFilterType} accordion`, () => {
            expect(screen.getByTestId(testIds[`${requestFilterType}Filter`])).toBeInTheDocument();
          });

          it(`should trigger CheckboxFilter for ${requestFilterType} accordion with correct props`, () => {
            expect(CheckboxFilter).toHaveBeenNthCalledWith(currentAccordionIndex, expect.objectContaining({
              'data-testid': testIds[`${requestFilterType}Filter`],
              name: requestFilterType,
              selectedValues: props.activeFilters[requestFilterType],
              onChange,
            }), {});
          });
        });
      }
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
});
