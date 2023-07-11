
import React from 'react';
import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import { Button } from '@folio/stripes/components';

import setupApplication from '../helpers/setup-application';
import ErrorModal from '../interactors/error-modal';
import NewRequest from '../interactors/new-request';
import RequestsInteractor from '../interactors/requests-interactor';
import ViewRequest from '../interactors/view-request';
import translations from '../../../translations/ui-requests/en';
import { DEFAULT_TIMEOUT } from '../constants';

const nonRequestableItemStatuses = [
  'Aged to lost',
  'Claimed returned',
  'Declared lost',
  'In process (non-requestable)',
  'Intellectual item',
  'Long missing',
  'Lost and paid',
  'Unavailable',
  'Unknown',
  'Withdrawn',
];
const patronComment = 'I really need this in the next three days';
const baseRequestTypeOptions = ['', 'Hold', 'Recall'];

describe('New Request page', () => {
  setupApplication({
    modules: [{
      type: 'plugin',
      name: '@folio/plugin-find-user',
      displayName: 'Find user',
      pluginType: 'find-user',
      /* eslint-disable-next-line react/prop-types */
      module: ({ selectUser }) => (
        <Button
          data-test-plugin-find-user-button
          onClick={() => selectUser({ id: '123' })}
        >
          +
        </Button>
      ),
    }],
  });

  const errorModalInteractor = new ErrorModal({ scope: '#OverlayContainer', timeout: DEFAULT_TIMEOUT });
  const newRequest = new NewRequest({ scope: '[data-test-requests-form]', timeout: DEFAULT_TIMEOUT });
  const requests = new RequestsInteractor({ timeout: DEFAULT_TIMEOUT });
  const viewRequest = new ViewRequest({ timeout: DEFAULT_TIMEOUT });

  describe('New request without prefilled user and item', function () {
    beforeEach(function () {
      this.visit('/requests?layer=create');
    });

    describe('entering invalid item barcode', function () {
      beforeEach(async function () {
        await newRequest.itemField.fillAndBlur('123');
        await newRequest.clickNewRequest();
      });

      it('triggers item not found error', () => {
        expect(newRequest.itemErrorIsPresent).to.be.true;
      });
    });

    describe('entering invalid requestor barcode', function () {
      beforeEach(async function () {
        await newRequest.whenReady();
        await newRequest.userField.fillAndBlur('123');
        await newRequest.clickNewRequest();
      });

      it('triggers requester not found error', () => {
        expect(newRequest.requesterErrorIsPresent).to.be.true;
      });
    });

    describe('visiting the create request page', () => {
      it('displays the title in the pane header', () => {
        expect(newRequest.title).to.equal('New request');
      });

      describe('pane header menu', () => {
        beforeEach(async () => {
          await newRequest.headerDropdown.click();
        });

        describe('clicking on cancel', () => {
          beforeEach(async () => {
            await newRequest.clickCancel();
          });

          it('should redirect to view requests page after click', () => {
            expect(requests.$root).to.exist;
            if (this.location && this.location.search) {
              expect(this.location.search).not.to.include('layer=edit');
              expect(this.location.search).not.to.include('userBarcode=');
              expect(this.location.search).not.to.include('itemBarcode=');
            }
          });
        });
      });
    });

    describe('creating new request type', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book',
          },
        });

        const user = this.server.create('user', {
          barcode: '9676761472501',
        });

        this.server.create('request-preference', {
          userId: user.id,
          fulfillment: 'Hold Shelf',
          defaultServicePointId: 'servicepointId1',
        });

        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();

        await newRequest
          .fillUserBarcode('9676761472501')
          .clickUserEnterBtn();

        await newRequest.patronComments.fillAndBlur(patronComment);
        await newRequest.chooseFulfillmentPreference('Hold Shelf');
        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.chooseRequestType('Hold');
        await newRequest.clickNewRequest();
        await viewRequest.isPresent;
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });

      it('should display the patron comments', () => {
        expect(viewRequest.patronComments.value.text).to.equal(patronComment);
      });
    });

    describe('creating new request with user without barcode', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book',
          },
        });

        const user = this.server.create('user', {
          id: '123',
        });

        this.server.create('request-preference', {
          userId: user.id,
          fulfillment: 'Hold Shelf',
          defaultServicePointId: 'servicepointId1',
        });

        await newRequest.whenReady();
        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();
        await newRequest.clickAddUser();
        await newRequest.chooseFulfillmentPreference('Hold Shelf');
        await newRequest.whenServicePointIsPresent();
        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.chooseRequestType('Hold');
        await newRequest.clickNewRequest();
        await viewRequest.isPresent;
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('creating new request for item with status "Restricted"', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book',
          },
          status: { name: 'Restricted' },
        });

        const user = this.server.create('user', { barcode: '9676761472501' });
        this.server.create('request-preference', {
          userId: user.id,
          fulfillment: 'Hold Shelf',
          defaultServicePointId: 'servicepointId1',
        });

        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();

        await newRequest
          .fillUserBarcode('9676761472501')
          .clickUserEnterBtn();

        await newRequest.chooseServicePoint('Circ Desk 1');
        await newRequest.chooseRequestType('Hold');
        await newRequest.clickNewRequest();
        await viewRequest.isPresent;
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('creating new request type with delivery', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book',
          },
        });

        const user = this.server.create('user', { barcode: '9676761472501' });
        this.server.create('request-preference', {
          userId: user.id,
          delivery: true,
          holdShelf: true,
          defaultDeliveryAddressTypeId: user.personal.addresses[0].addressTypeId,
        });
        const address = this.server.create('address', { addressTypeId: 'Type1' });
        const personal = this.server.create('user-personal');
        personal.update('addresses', [address.toJSON()]);
        user.update('personal', personal.toJSON());

        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();

        await newRequest
          .fillUserBarcode('9676761472501')
          .clickUserEnterBtn();

        await newRequest.chooseFulfillmentPreference('Delivery');
        await newRequest.chooseDeliveryAddress('Claim');
        await newRequest.chooseRequestType('Hold');
        await newRequest.clickNewRequest();
        await viewRequest.isPresent;
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('showing correct request types', () => {
      describe('item with "Checked out" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Checked out' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('item with "Available" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Available' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default and page options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['', 'Page']);
        });
      });

      describe('item with "Awaiting pickup" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Awaiting pickup' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('item with "In transit" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'In transit' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('item with "Missing" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Missing' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default and hold options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['', 'Hold']);
        });
      });

      describe('item with "Paged" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Paged' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('item with "On order" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'On order' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('item with "In process" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'In process' },
          });

          await newRequest
            .fillItemBarcode('9676761472501')
            .clickItemEnterBtn()
            .whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });

      describe('when item has "Awaiting delivery" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Awaiting delivery' },
          });

          await newRequest.fillItemBarcode('9676761472501');
          await newRequest.clickItemEnterBtn();
          await newRequest.whenRequestTypesArePresent();
        });

        it('should show default, hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(baseRequestTypeOptions);
        });
      });
    });

    nonRequestableItemStatuses.forEach(status => {
      describe(`New request for ${status} item`, function () {
        beforeEach(async function () {
          const item = this.server.create('item', {
            status: { name: status },
          });

          await newRequest.itemField.fillAndBlur(item.barcode);
          await errorModalInteractor.whenModalIsPresent();
        });

        it(`should show ${status} error dialog`, () => {
          expect(errorModalInteractor.modalIsPresent).to.equal(true);
        });

        describe(`closing ${status} error dialog`, () => {
          beforeEach(async function () {
            await errorModalInteractor.whenModalIsPresent();
            await errorModalInteractor.clickCloseBtn();
          });

          it(`should close ${status} error dialog`, () => {
            expect(errorModalInteractor.modalIsPresent).to.equal(false);
          });

          it('should display a message in request type field', () => {
            expect(newRequest.requestType.value.text).to.equal(translations.noRequestTypesAvailable);
          });
        });

        describe(`submitting New request for ${status} item form`, () => {
          beforeEach(async function () {
            const user = this.server.create('user');

            await errorModalInteractor.whenModalIsPresent();
            await errorModalInteractor.clickCloseBtn();
            await newRequest.userField.fillAndBlur(user.barcode);
            await newRequest.clickNewRequest();
            await errorModalInteractor.whenModalIsPresent();
          });

          it(`should show ${status} error dialog`, () => {
            expect(errorModalInteractor.modalIsPresent).to.equal(true);
          });
        });
      });
    });

    describe('New request with prefilled user barcode and item barcode', function () {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472503',
        });
        this.server.create('user', {
          barcode: '9676761472504',
        });
        this.visit('/requests/view/?layer=create&userBarcode=9676761472504&itemBarcode=9676761472503');
      });

      it('should update prefill user and item', () => {
        expect(newRequest.containsUserBarcode).to.equal('9676761472504');
        expect(newRequest.containsItemBarcode).to.equal('9676761472503');
      });
    });

    describe('New request with prefilled user barcode and item id', function () {
      beforeEach(async function () {
        this.server.create('item', {
          id: '123',
          barcode: '',
        });
        const user = this.server.create('user', {
          barcode: '9676761472504',
        });
        this.server.create('request-preference', {
          userId: user.id,
          fulfillment: 'Hold Shelf',
          defaultServicePointId: 'servicepointId1',
        });
        this.visit('/requests/view/?layer=create&userBarcode=9676761472504&itemId=123');
        await newRequest.chooseRequestType('Hold');
        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.clickNewRequest();
      });

      it('should update prefill user and item', () => {
        expect(newRequest.requestSectionPresent).to.be.true;
        expect(newRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('when a request is being created for a user that has request preferences', () => {
      let requestPreferences;

      beforeEach(async function () {
        const item = this.server.create('item');
        const user = this.server.create('user');

        requestPreferences = this.server.create('request-preference', {
          userId: user.id,
          delivery: true,
          fulfillment: 'Delivery',
          defaultDeliveryAddressTypeId: user.personal.addresses[0].addressTypeId,
        });

        await newRequest.fillItemBarcode(item.barcode);
        await newRequest.clickItemEnterBtn();
        await newRequest.fillUserBarcode(user.barcode);
        await newRequest.clickUserEnterBtn();
      });

      it('should populate the fulfillment preferences fields according to the user\'s request preferences', () => {
        expect(newRequest.fulfillmentPreferenceValue).to.equal(requestPreferences.fulfillment);
        expect(newRequest.deliveryAddressTypeIdValue).to.equal(requestPreferences.defaultDeliveryAddressTypeId);
      });
    });
  });
});
