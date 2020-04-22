import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import EditRequest from '../interactors/edit-request';
import ViewRequest from '../interactors/view-request';
import { requestStatuses } from '../../../src/constants';

describe('Edit Request page', () => {
  setupApplication();

  const requestsOnItemValue = '2';

  const EditRequestInteractor = new EditRequest();
  const ViewRequestInteractor = new ViewRequest();

  beforeEach(async function () {
    const request = this.server.create('request', { requestCount: requestsOnItemValue });

    this.visit(`/requests/view/${request.id}?layer=edit`);
  });

  it('layer exists', () => {
    expect(EditRequestInteractor.isLayerPresent).to.be.true;
  });

  it('should display a number of requests on item', () => {
    expect(EditRequestInteractor.requestsOnItem.value.text).to.equal(requestsOnItemValue);
  });

  describe('clicking cancel editing button', function () {
    beforeEach(async () => {
      await EditRequestInteractor.clickCancel();
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
