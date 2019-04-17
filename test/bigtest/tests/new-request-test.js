import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import NewRequestInteractor from '../interactors/new-request';
import RequestsInteractor from '../interactors/requests';
import ViewRequestInteractor from '../interactors/view-request';

describe('New Request page', () => {
  setupApplication();

  const requests = new RequestsInteractor();

  describe('New request without prefilled user and item', function () {
    beforeEach(function () {
      this.visit('/requests?layer=create');
    });

    describe('entering invalid item barcode', function () {
      beforeEach(async function () {
        await NewRequestInteractor.itemField.fillAndBlur('123');
        await NewRequestInteractor.clickNewRequest();
      });

      it('triggers item not found error', () => {
        expect(NewRequestInteractor.itemErrorIsPresent).to.be.true;
      });
    });

    describe('entering invalid requestor barcode', function () {
      beforeEach(async function () {
        await NewRequestInteractor.userField.fillAndBlur('123');
        await NewRequestInteractor.clickNewRequest();
      });

      it('triggers requester not found error', () => {
        expect(NewRequestInteractor.requesterErrorIsPresent).to.be.true;
      });
    });

    describe('visiting the create request page', () => {
      it('displays the title in the pane header', () => {
        expect(NewRequestInteractor.title).to.equal('New request');
      });

      describe('pane header menu', () => {
        beforeEach(async () => {
          await NewRequestInteractor.headerDropdown.click();
        });

        describe('clicking on cancel', () => {
          beforeEach(async () => {
            await NewRequestInteractor.headerDropdownMenu.clickCancel();
          });

          it('should redirect to view requests page after click', () => {
            expect(requests.$root).to.exist;
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
            name: 'book'
          },
        });

        this.server.create('user', {
          barcode: '9676761472501',
        });

        await NewRequestInteractor
          .fillItemBarcode('9676761472500')
          .pressEnter();

        await NewRequestInteractor
          .fillUserBarcode('9676761472501')
          .pressEnter();

        await NewRequestInteractor.chooseServicePoint('Circ Desk 2');
        await NewRequestInteractor.clickNewRequest();
      });

      it('should create a new request and open view request pane', () => {
        expect(ViewRequestInteractor.requestSectionPresent).to.be.true;
        expect(ViewRequestInteractor.requesterSectionPresent).to.be.true;
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
        const address = this.server.create('address', { addressTypeId: 'Type1' });
        const personal = this.server.create('user-personal');
        personal.update('addresses', [address.toJSON()]);
        user.update('personal', personal.toJSON());

        await NewRequestInteractor
          .fillItemBarcode('9676761472500')
          .pressEnter();

        await NewRequestInteractor
          .fillUserBarcode('9676761472501')
          .pressEnter();

        await NewRequestInteractor.chooseFulfillmentPreference('Delivery');
        await NewRequestInteractor.chooseDeliveryAddress('Claim');
        await NewRequestInteractor.clickNewRequest();
      });

      it('should create a new request and open view request pane', () => {
        expect(ViewRequestInteractor.requestSectionPresent).to.be.true;
        expect(ViewRequestInteractor.requesterSectionPresent).to.be.true;
      });
    });

    describe('showing request type message', () => {
      it('should show request type message', () => {
        expect(NewRequestInteractor.requestTypeMessageIsPresent).to.be.true;
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

        await NewRequestInteractor
          .fillItemBarcode('9676761472500')
          .pressEnter();
      });

      it('should hide request type message', () => {
        expect(NewRequestInteractor.requestTypeMessageIsPresent).to.be.false;
      });
    });

    describe('showing correct request types', () => {
      describe('item with "Checked out" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Checked out' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });

      describe('item with "Available" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Available' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypeIsPresent();
        });

        it('should show page option', () => {
          expect(NewRequestInteractor.requestTypeText).to.equal('Page');
        });
      });

      describe('item with "Awaiting pickup" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Awaiting pickup' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });

      describe('item with "In transit" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'In transit' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });

      describe('item with "Missing" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Missing' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypeIsPresent();
        });

        it('should show hold option', () => {
          expect(NewRequestInteractor.requestTypeText).to.equal('Hold');
        });
      });

      describe('item with "Paged" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'Paged' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });

      describe('item with "On order" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'On order' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });

      describe('item with "In process" status', () => {
        beforeEach(async function () {
          this.server.create('item', {
            barcode: '9676761472501',
            status: { name: 'In process' },
          });

          await NewRequestInteractor
            .fillItemBarcode('9676761472501')
            .pressEnter()
            .whenRequestTypesArePresent();
        });

        it('should show hold and recall options', () => {
          expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
        });
      });
    });
  });

  describe('New request with prefilled user and item', function () {
    beforeEach(async function () {
      this.server.create('item', {
        barcode: '9676761472503',
      });
      this.server.create('user', {
        barcode: '9676761472504',
      });
      this.visit('/requests/view/requestId0?layer=create&userBarcode=9676761472504&itemBarcode=9676761472503');
    });

    it('should update prefill user and item', () => {
      expect(NewRequestInteractor.containsUserBarcode).to.equal('9676761472504');
      expect(NewRequestInteractor.containsItemBarcode).to.equal('9676761472503');
    });
  });
});
