import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequestInteractor from '../interactors/view-request';

describe('View request page', () => {
  setupApplication();

  describe('View default request', () => {
    beforeEach(async function () {
      this.visit('/requests/view/requestId0');
    });

    describe('cancel request', function () {
      describe('confirm cancel request', function () {
        beforeEach(async () => {
          await ViewRequestInteractor.headerDropdown.click();
          await ViewRequestInteractor.headerDropdownMenu.clickCancel();
          await ViewRequestInteractor.cancelRequestDialog.chooseReason('Patron Cancelled');
          await ViewRequestInteractor.cancelRequestDialog.clickConfirm();
        });

        it('closes request view', function () {
          expect(ViewRequestInteractor.requestInfoContains('Closed - Cancelled')).to.be.true;
        });
      });

      describe('cancelling cancel request', function () {
        beforeEach(async () => {
          await ViewRequestInteractor.headerDropdown.click();
          await ViewRequestInteractor.headerDropdownMenu.clickCancel();
        });
      });

      it('closes request view', function () {
        expect(ViewRequestInteractor.cancelRequestDialog.isPresent).to.be.false;
      });
    });

    describe('edit request', function () {
      beforeEach(async () => {
        await ViewRequestInteractor.headerDropdown.click();
        await ViewRequestInteractor.headerDropdownMenu.clickEdit();
      });

      it('opens request form in edit mode', function () {
        expect(this.location.search).to.include('layer=edit');
      });
    });

    describe('duplicate request', function () {
      beforeEach(async () => {
        await ViewRequestInteractor.headerDropdown.click();
        await ViewRequestInteractor.headerDropdownMenu.clickDuplicate();
      });

      it('opens request form', function () {
        expect(this.location.search).to.include('layer=create');
      });
    });

    describe('toggle section', function () {
      beforeEach(async function () {
        await ViewRequestInteractor.itemAccordionClick();
      });

      it('toggles item section', function () {
        expect(ViewRequestInteractor.itemAccordion.isExpanded).to.be.false;
      });
    });
  });

  describe('View delivery request', () => {
    let requester;
    beforeEach(async function () {
      const request = this.server.create('request', {
        fulfilmentPreference: 'Delivery'
      });

      requester = this.server.schema.users.find(request.requesterId);
      this.visit('/requests/view/' + request.id);
    });

    it('shows delivery address', () => {
      expect(ViewRequestInteractor.requesterInfoContains(requester.attrs.personal.addresses[0].addressLine1)).to.be.true;
    });
  });
});
