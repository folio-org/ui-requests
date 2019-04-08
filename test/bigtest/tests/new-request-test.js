import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import NewRequestInteractor from '../interactors/new-request';
import RequestsInteractor from '../interactors/requests';

describe('New Request page', () => {
  setupApplication();

  const requests = new RequestsInteractor();

  beforeEach(function () {
    this.visit('/requests?layer=create');
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
          .pressEnter();
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
          .pressEnter();
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
          .pressEnter();
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
          .whenRequestTypeIsPresent();
      });

      it('should show hold option', () => {
        expect(NewRequestInteractor.requestTypeText).to.equal('Hold');
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
          .pressEnter();
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
          .pressEnter();
      });

      it('should show hold and recall options', () => {
        expect(NewRequestInteractor.requestTypeOptions).to.eql(['Hold', 'Recall']);
      });
    });
  });
});
