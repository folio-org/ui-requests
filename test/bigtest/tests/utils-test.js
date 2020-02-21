import {
  describe,
  it,
} from '@bigtest/mocha';

import {
  expect,
} from 'chai';

import {
  convertToSlipData,
  isPagedItem,
  createUserHighlightBoxLink,
} from '../../../src/utils';

describe('utils', () => {
  describe('Create user highlight box link', () => {
    it('should create user highlight box link', () => {
      const linkText = 'linkText';
      const id = 'id';

      expect(createUserHighlightBoxLink(linkText, id)).not.to.equal('');
    });

    it('should not create user highlight box link', () => {
      const linkText = '';
      const id = 'id';

      expect(createUserHighlightBoxLink(linkText, id)).to.equal('');
    });
  });

  describe('Check for compliance with paged item', () => {
    it('should check and verification must be successful', () => {
      const item = {
        status: {
          name: 'Paged',
        },
      };
      expect(isPagedItem(item)).to.be.true;
    });

    it('should check and verification must be unsuccessful', () => {
      expect(isPagedItem()).to.be.false;
    });
  });

  describe('Convert to slip data', () => {
    const intl = {
      formatMessage: () => ('formatMessage'),
      formatDate: () => ('formatDate'),
    };
    const timeZone = '';
    const locale = '';
    const item = {
      title: 'The Long Way to a Small, Angry Planet',
      barcode: '036000291452',
      status: 'Paged',
      primaryContributor: 'Chambers, Becky',
      allContributors: 'Chambers, Becky',
      enumeration: 'v.70:no.7-12',
      volume: 'vol.1',
      chronology: '1984:July-Dec.',
      yearCaption: '1984; 1985',
      materialType: 'Book',
      loanType: 'Can Circulate',
      copy: 'cp.2',
      numberOfPieces: '3',
      descriptionOfPieces: 'Description of three pieces',
      effectiveLocationSpecific: '3rd Floor',
      effectiveLocationLibrary: 'Djanogly Learning Resource Centre',
      effectiveLocationCampus: 'Jubilee Campus',
      effectiveLocationInstitution: 'Nottingham University',
      callNumber: '123456',
      callNumberPrefix: 'PREFIX',
      callNumberSuffix: 'SUFFIX',
      lastCheckedInDateTime: '2020-02-17T12:12:33.374Z',
    };
    const request = {
      requestID: 'dd606ca6-a2cb-4723-9a8d-e73b05c42232',
      servicePointPickup: 'Circ Desk 1',
      requestExpirationDate: '2019-07-30T00:00:00.000+03:00',
      holdShelfExpirationDate: '2019-08-31T00:00:00.000+03:00',
      deliveryAddressType: 'Home',
    };
    const requester = {
      firstName: 'Steven',
      lastName: 'Jones',
      middleName: 'Jacob',
      barcode: '5694596854',
      addressLine1: '16 Main St',
      addressLine2: 'Apt 3a',
      city: 'Northampton',
      region: 'MA',
      postalCode: '01060',
      countryId: 'US',
    };
    const pickSlips = [{
      item,
      request,
      requester,
    }];
    const slipData = {
      'staffSlip.Name': 'Pick slip',
      'requester.firstName': 'Steven',
      'requester.lastName': 'Jones',
      'requester.middleName': 'Jacob',
      'requester.addressLine1': '16 Main St',
      'requester.addressLine2': 'Apt 3a',
      'requester.country': 'formatMessage',
      'requester.city': 'Northampton',
      'requester.stateProvRegion': 'MA',
      'requester.zipPostalCode': '01060',
      'requester.barcode': '5694596854',
      'requester.barcodeImage': '<Barcode>5694596854</Barcode>',
      'item.fromServicePoint': undefined,
      'item.toServicePoint': undefined,
      'item.title': 'The Long Way to a Small, Angry Planet',
      'item.primaryContributor': 'Chambers, Becky',
      'item.allContributors': 'Chambers, Becky',
      'item.barcode': '036000291452',
      'item.barcodeImage': '<Barcode>036000291452</Barcode>',
      'item.callNumber': '123456',
      'item.callNumberPrefix': 'PREFIX',
      'item.callNumberSuffix': 'SUFFIX',
      'item.enumeration': 'v.70:no.7-12',
      'item.volume': 'vol.1',
      'item.chronology': '1984:July-Dec.',
      'item.copy': 'cp.2',
      'item.yearCaption': '1984; 1985',
      'item.materialType': 'Book',
      'item.loanType': 'Can Circulate',
      'item.numberOfPieces': '3',
      'item.descriptionOfPieces': 'Description of three pieces',
      'item.lastCheckedInDateTime': '2020-02-17T12:12:33.374Z',
      'item.effectiveLocationInstitution': 'Nottingham University',
      'item.effectiveLocationCampus': 'Jubilee Campus',
      'item.effectiveLocationLibrary': 'Djanogly Learning Resource Centre',
      'item.effectiveLocationSpecific': '3rd Floor',
      'request.servicePointPickup': 'Circ Desk 1',
      'request.deliveryAddressType': 'Home',
      'request.requestExpirationDate': 'formatDate',
      'request.holdShelfExpirationDate': 'formatDate',
      'request.requestID': 'dd606ca6-a2cb-4723-9a8d-e73b05c42232'
    };
    const expectSlipData = [slipData];

    it('should convert to slip data', () => {
      expect(convertToSlipData(pickSlips, intl, timeZone, locale)).to.deep.equal(expectSlipData);
    });

    it('should convert to slip data wth empty date', () => {
      const pickSlipsWithEmptyDate = [{
        item,
        request: {
          ...request,
          requestExpirationDate: '',
          holdShelfExpirationDate: '',
        },
        requester: {
          ...requester,
          countryId: '',
        },
      }];
      const expectSlipDataWithEmptyDate = [{
        ...slipData,
        'request.requestExpirationDate': '',
        'request.holdShelfExpirationDate': '',
        'requester.country': '',
      }];

      expect(convertToSlipData(pickSlipsWithEmptyDate, intl, timeZone, locale)).to.deep.equal(expectSlipDataWithEmptyDate);
    });
  });
});
