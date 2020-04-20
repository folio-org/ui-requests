
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

  const errorModalInteractor = new ErrorModal('#OverlayContainer');
  const newRequest = new NewRequest('[data-test-requests-form]');
  const requests = new RequestsInteractor();
  const viewRequest = new ViewRequest();

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

        this.server.create('user', {
          barcode: '9676761472501',
        });

        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();

        await newRequest
          .fillUserBarcode('9676761472501')
          .clickUserEnterBtn();

        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.clickNewRequest();
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('creating new request with user without barcode', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book'
          },
        });

        await newRequest.whenReady();
        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();
        await newRequest.clickAddUser();
        await newRequest.whenServicePointIsPresent();
        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.clickNewRequest();
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
            name: 'book'
          },
        });

        const user = this.server.create('user', { barcode: '9676761472501' });
        this.server.create('request-preference', {
          userId: user.id,
          delivery: true,
          holdShelf: true,
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
        await newRequest.clickNewRequest();
      });

      it('should create a new request and open view request pane', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
      });
    });

    describe('showing request type message', () => {
      it('should show request type message', () => {
        expect(newRequest.requestTypeMessageIsPresent).to.be.true;
      });
    });

    describe('hiding request type message', () => {
      beforeEach(async function () {
        this.server.create('item', {
          barcode: '9676761472500',
          title: 'Best Book Ever',
          materialType: {
            name: 'book'
          }
        });

        await newRequest
          .fillItemBarcode('9676761472500')
          .clickItemEnterBtn();
      });

      it('should hide request type message', () => {
        expect(newRequest.requestTypeMessageIsPresent).to.be.false;
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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
            .whenRequestTypeIsPresent();
        });

        it('should show page option', () => {
          expect(newRequest.requestTypeText).to.equal('Page');
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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
            .whenRequestTypeIsPresent();
        });

        it('should show hold option', () => {
          expect(newRequest.requestTypeText).to.equal('Hold');
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
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

        it('should show hold and recall options', () => {
          expect(newRequest.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });
    });

    describe('New request for declared lost item', function () {
      beforeEach(async function () {
        const item = this.server.create('item', {
          status: { name: 'Declared lost' },
        });

        await newRequest.itemField.fillAndBlur(item.barcode);
        await errorModalInteractor.whenModalIsPresent();
      });

      it('shows declare lost error dialog', () => {
        expect(errorModalInteractor.modalIsPresent).to.equal(true);
      });

      describe('Close declare lost error dialog', () => {
        beforeEach(async function () {
          await errorModalInteractor.whenModalIsPresent();
          await errorModalInteractor.clickCloseBtn();
        });

        it('closes lost error dialog', () => {
          expect(errorModalInteractor.modalIsPresent).to.equal(false);
        });
      });

      describe('Show declare lost error dialog on submit', () => {
        beforeEach(async function () {
          const user = this.server.create('user');

          await errorModalInteractor.whenModalIsPresent();
          await errorModalInteractor.clickCloseBtn();
          await newRequest.userField.fillAndBlur(user.barcode);
          await newRequest.clickNewRequest();
          await errorModalInteractor.whenModalIsPresent();
        });

        it('shows declare lost error dialog', () => {
          expect(errorModalInteractor.modalIsPresent).to.equal(true);
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
        this.server.create('user', {
          barcode: '9676761472504',
        });
        this.visit('/requests/view/?layer=create&userBarcode=9676761472504&itemId=123');

        await newRequest.chooseServicePoint('Circ Desk 2');
        await newRequest.clickNewRequest();
      });

      it('should update prefill user and item', () => {
        expect(viewRequest.requestSectionPresent).to.be.true;
        expect(viewRequest.requesterSectionPresent).to.be.true;
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
