import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequestInteractor from '../interactors/view-request';

describe('Move request', () => {
  setupApplication();

  beforeEach(async function () {
    const request = this.server.create('request', 'withPagedItems', { requestType: 'Page' });
    this.visit(`/requests/view/${request.id}`);
  });

  describe('open move request dialog', function () {
    beforeEach(async () => {
      await ViewRequestInteractor.headerDropdown.click();
      await ViewRequestInteractor.headerDropdownMenu.clickMove();
    });

    it('opens move request dialog', function () {
      expect(ViewRequestInteractor.moveRequestDialog.isVisible).to.equal(true);
    });
  });

  describe('open choose request type dialog', function () {
    beforeEach(async () => {
      await ViewRequestInteractor.headerDropdown.click();
      await ViewRequestInteractor.headerDropdownMenu.clickMove();
      await ViewRequestInteractor.moveRequestDialog.chooseItem();
    });

    it('opens choose request type dialog', function () {
      expect(ViewRequestInteractor.chooseRequestTypeDialog.isVisible).to.equal(true);
    });
  });

  describe('move request', function () {
    beforeEach(async () => {
      await ViewRequestInteractor.headerDropdown.click();
      await ViewRequestInteractor.headerDropdownMenu.clickMove();
      await ViewRequestInteractor.moveRequestDialog.chooseItem();
      await ViewRequestInteractor.chooseRequestTypeDialog.clickConfirm();
    });

    it('moves request', function () {
      expect(ViewRequestInteractor.chooseRequestTypeDialog.isPresent).to.equal(false);
      expect(ViewRequestInteractor.moveRequestDialog.isPresent).to.equal(false);
    });
  });
});
