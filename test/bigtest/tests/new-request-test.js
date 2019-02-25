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
});
