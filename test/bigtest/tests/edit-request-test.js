import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import EditRequestInteractor from '../interactors/edit-request';
import ViewRequestInteractor from '../interactors/view-request';
import { requestStatuses } from '../../../src/constants';

describe('Edit Request page', () => {
  setupApplication();

  beforeEach(async function () {
    this.visit('/requests/view/requestId0?layer=edit');
  });

  describe('Request edit layer', function () {
    it('layer exists', function () {
      expect(EditRequestInteractor.isLayerPresent).to.be.true;
    });
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

  describe('when the request has status "Open - Awaiting delivery"', () => {
    beforeEach(function () {
      this.server.create('request', {
        status: requestStatuses.AWAITING_DELIVERY,
        id: 'someId'
      });

      this.visit('/requests/view/someId?layer=edit');
    });

    it('should disable fulfillment preference field', () => {
      expect(EditRequestInteractor.fulfillmentPreferenceFieldDisabled).to.be.true;
    });
  });

  describe('when the request has status "Open - Awaiting pickup"', () => {
    beforeEach(function () {
      this.server.create('request', {
        status: requestStatuses.AWAITING_PICKUP,
        id: 'someId2'
      });

      this.visit('/requests/view/someId2?layer=edit');
    });

    it('should disable fulfillment preference field', () => {
      expect(EditRequestInteractor.fulfillmentPreferenceFieldDisabled).to.be.true;
    });
  });
});
