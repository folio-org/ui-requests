import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequest from '../interactors/view-request';

describe('Move request', () => {
  setupApplication();

  const viewRequestInteractor = new ViewRequest();

  beforeEach(async function () {
    const request = this.server.create('request', 'withPagedItems', { requestType: 'Page' });
    this.visit(`/requests/view/${request.id}`);
  });

  describe('open move request dialog', function () {
    beforeEach(async () => {
      await viewRequestInteractor.headerDropdown.click();
      await viewRequestInteractor.headerDropdownMenu.clickMove();
    });

    it('opens move request dialog', function () {
      expect(viewRequestInteractor.moveRequestDialog.isVisible).to.equal(true);
    });
  });

  describe('open choose request type dialog', function () {
    beforeEach(async () => {
      await viewRequestInteractor.headerDropdown.click();
      await viewRequestInteractor.headerDropdownMenu.clickMove();
      await viewRequestInteractor.moveRequestDialog.chooseItem();
    });

    it('opens choose request type dialog', function () {
      expect(viewRequestInteractor.chooseRequestTypeDialog.isVisible).to.equal(true);
    });
  });

  describe('move request', function () {
    beforeEach(async () => {
      await viewRequestInteractor.headerDropdown.click();
      await viewRequestInteractor.headerDropdownMenu.clickMove();
      await viewRequestInteractor.moveRequestDialog.chooseItem();
      await viewRequestInteractor.chooseRequestTypeDialog.clickConfirm();
    });

    it('moves request', function () {
      expect(viewRequestInteractor.chooseRequestTypeDialog.isPresent).to.equal(false);
      expect(viewRequestInteractor.moveRequestDialog.isPresent).to.equal(false);
    });
  });
});
