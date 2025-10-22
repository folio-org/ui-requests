import {
  screen,
  render,
} from '@folio/jest-config-stripes/testing-library/react';

import {
  formatter,
} from './constants';

import ItemLink from './components/ItemLink';
import { BarcodeLink } from '../components/RequesterLinks';
import {
  getFullName,
} from '../utils';

import {
  MISSING_VALUE_SYMBOL,
  requestStatusesTranslations,
  requestTypesTranslations,
} from '../constants';

jest.mock('./components/ItemLink', () => jest.fn(() => null));
jest.mock('../components/RequesterLinks', () => ({
  BarcodeLink: jest.fn(() => null),
}));
jest.mock('../utils', () => ({
  getFullName: jest.fn(),
}));

const labelIds = {
  requestInProgress: 'ui-requests.requestQueue.requestInProgress',
};

describe('formatter', () => {
  const requiredData = {
    position: 'request position',
    requestLevel: 'request level',
    instanceId: 'instance id',
    requestDate: '2023-01-01',
    status: 'Closed - Cancelled',
    requestType: 'Recall',
    requester: {
      lastName: 'lastName',
      firstName: 'firstName',
      middleName: 'middleName',
      preferredFirstName: 'preferredFirstName',
    },
  };

  describe('Only required data', () => {
    it('should return fulfillmentStatus', () => {
      render(formatter.fulfillmentStatus());

      expect(screen.getByText(labelIds.requestInProgress)).toBeInTheDocument();
    });

    it('should return position', () => {
      render(formatter.position(requiredData));

      expect(screen.getByText(requiredData.position)).toBeInTheDocument();
    });

    it('should call itemBarcode with correct props', () => {
      render(formatter.itemBarcode(requiredData));

      expect(ItemLink).toHaveBeenCalledWith(expect.objectContaining({
        request: requiredData,
      }), {});
    });

    it('should render requestDate', () => {
      render(formatter.requestDate(requiredData));

      expect(screen.getByText(requiredData.requestDate)).toBeInTheDocument();
    });

    it('should render status', () => {
      render(formatter.status(requiredData));

      expect(screen.getByText(requestStatusesTranslations[requiredData.status])).toBeInTheDocument();
    });

    it('should return default pickupDelivery value', () => {
      expect(formatter.pickupDelivery(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });

    it('should call getFullName with correct props', () => {
      render(formatter.requester(requiredData));

      expect(getFullName).toHaveBeenCalledWith(expect.objectContaining({
        ...requiredData.requester,
      }));
    });

    it('should call "BarcodeLink" with correct props', () => {
      render(formatter.requesterBarcode(requiredData));

      expect(BarcodeLink).toHaveBeenCalledWith(expect.objectContaining({
        user: requiredData.requester,
      }), {});
    });

    it('should return default patronGroup value', () => {
      expect(formatter.patronGroup(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });

    it('should render requestType', () => {
      render(formatter.requestType(requiredData));

      expect(screen.getByText(requestTypesTranslations[requiredData.requestType])).toBeInTheDocument();
    });

    it('should return default enumeration value', () => {
      expect(formatter.enumeration(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });

    it('should return default chronology value', () => {
      expect(formatter.chronology(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });

    it('should return default volume value', () => {
      expect(formatter.volume(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });

    it('should return default patronComments value', () => {
      expect(formatter.patronComments(requiredData)).toEqual(MISSING_VALUE_SYMBOL);
    });
  });

  describe('All data', () => {
    const allData = {
      ...requiredData,
      patronComments: 'patronComments',
      item: {
        enumeration: 'enumeration',
        chronology: 'chronology',
        volume: 'volume',
      },
      requester: {
        patronGroup: {
          group: 'group',
        },
      },
    };

    it('should return patronGroup value', () => {
      expect(formatter.patronGroup(allData)).toEqual(allData.requester.patronGroup.group);
    });

    it('should return enumeration value', () => {
      expect(formatter.enumeration(allData)).toEqual(allData.item.enumeration);
    });

    it('should return chronology value', () => {
      expect(formatter.chronology(allData)).toEqual(allData.item.chronology);
    });

    it('should return volume value', () => {
      expect(formatter.volume(allData)).toEqual(allData.item.volume);
    });

    it('should return patronComments value', () => {
      expect(formatter.patronComments(allData)).toEqual(allData.patronComments);
    });
  });
});
