import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import EditRequestInteractor from '../interactors/edit-request';

describe('Edit Request page', () => {
  setupApplication();

  const editRequestInteractor = new EditRequestInteractor('[data-test-requests-form]');
  beforeEach(async function () {
    this.server.create('request');
    this.visit('/requests/view/reuestId0?layer=edit');
  });


  describe('clicking cancel editing button', function () {
    beforeEach(async () => {
      await editRequestInteractor.headerDropdown.click();
      await editRequestInteractor.headerDropdownMenu.clickCancel();
    });

    it('closes the edit request form', function () {
      expect(this.location.search).not.to.include('layer=edit');
    });
  });
});
