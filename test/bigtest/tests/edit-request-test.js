import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import EditRequestInteractor from '../interactors/edit-request';
import ViewRequestInteractor from '../interactors/view-request';

describe('Edit Request page', () => {
  setupApplication();

  beforeEach(async function () {
    this.visit('/requests/view/requestId0?layer=edit');
  });

  describe('clicking cancel editing button', function () {
    beforeEach(async () => {
      await EditRequestInteractor.headerDropdown.click();
      await EditRequestInteractor.headerDropdownMenu.clickCancel();
    });

    it('closes the edit request form', function () {
      expect(this.location.search).not.to.include('layer=edit');
      expect(this.location.search).not.to.include('userBarcode=');
      expect(this.location.search).not.to.include('itemBarcode=');
    });
  });

  describe('cancel request', function () {
    describe('confirm cancel request', function () {
      beforeEach(async () => {
        await ViewRequestInteractor.headerDropdown.click();
        await EditRequestInteractor.headerDropdownMenu.clickDelete();
        await EditRequestInteractor.cancelRequestDialog.chooseReason('Patron Cancelled');
        await EditRequestInteractor.cancelRequestDialog.clickConfirm();
      });

      it('closes request view', function () {
        expect(ViewRequestInteractor.requestInfoContains('Closed - Cancelled')).to.be.true;
      });
    });
  });

  describe('updating existing request', function () {
    beforeEach(async function () {
      await EditRequestInteractor.chooseServicePoint('Circ Desk 2');
      await EditRequestInteractor.clickUpdate();
    });

    it('should update existing request and open a view request pane', () => {
      expect(ViewRequestInteractor.requestSectionPresent).to.be.true;
      expect(ViewRequestInteractor.requesterInfoContains('Circ Desk 2')).to.be.true;
    });
  });
});
