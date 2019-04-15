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
    });
  });

  describe('updating existing request', function () {
    beforeEach(async function () {
      await EditRequestInteractor.chooseServicePoint('Circ Desk 2');
      await EditRequestInteractor.clickUpdate();
    });

    it('should update existing request and open a view request pane', () => {
      expect(ViewRequestInteractor.requestSectionPresent).to.be.true;
      expect(ViewRequestInteractor.containsServicePoint('Circ Desk 2')).to.be.true;
    });
  });
});
