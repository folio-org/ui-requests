import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequestInteractor from '../interactors/view-request';
/*
describe('View request page', () => {
  setupApplication();

  beforeEach(async function () {
    this.visit('/requests/view/requestId0');
  });

  describe('cancel request', function () {
    beforeEach(async () => {
      await ViewRequestInteractor.headerDropdown.click();
      await ViewRequestInteractor.headerDropdownMenu.clickCancel();
      await ViewRequestInteractor.cancelRequestDialog.chooseReason('Patron Cancelled');
      await ViewRequestInteractor.cancelRequestDialog.clickConfirm();
    });

    it('closes request view', function () {
      expect(ViewRequestInteractor.containsClosedRequest('Closed - Cancelled')).to.be.true;
    });
  });
});
*/
