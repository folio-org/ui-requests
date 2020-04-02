import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequestInteractor from '../interactors/view-request';
import NewRequestInteractor from '../interactors/new-request';

describe('View request page', () => {
  setupApplication();

  const requestsOnItemValue = '3';

  const viewRequest = new ViewRequestInteractor();
  const newRequest = new NewRequestInteractor();

  describe('View default request', () => {
    beforeEach(async function () {
      const request = this.server.create('request', { requestCount: requestsOnItemValue });
      this.visit(`/requests/view/${request.id}`);
    });

    it('should display a number of requests on item', () => {
      expect(viewRequest.requestsOnItem.value.text).to.equal(requestsOnItemValue);
    });

    describe('cancel request', function () {
      describe('confirm cancel request', function () {
        beforeEach(async () => {
          await viewRequest.headerDropdown.click();
          await viewRequest.headerDropdownMenu.clickCancel();
          await viewRequest.cancelRequestDialog.chooseReason('Patron Cancelled');
          await viewRequest.cancelRequestDialog.clickConfirm();
        });

        it('closes request view', function () {
          expect(viewRequest.requestInfoContains('Closed - Cancelled')).to.be.true;
        });
      });

      describe('cancelling cancel request', function () {
        beforeEach(async () => {
          await viewRequest.headerDropdown.click();
          await viewRequest.headerDropdownMenu.clickCancel();
        });
      });

      it('closes request view', function () {
        expect(viewRequest.cancelRequestDialog.isPresent).to.be.false;
      });
    });

    describe('edit request', function () {
      beforeEach(async () => {
        await viewRequest.headerDropdown.click();
        await viewRequest.headerDropdownMenu.clickEdit();
      });

      it('opens request form in edit mode', function () {
        expect(this.location.search).to.include('layer=edit');
      });
    });

    describe('duplicate request', function () {
      beforeEach(async () => {
        await viewRequest.headerDropdown.click();
        await viewRequest.headerDropdownMenu.clickDuplicate();
        await newRequest.isPresent;
      });

      it('opens request form', function () {
        expect(this.location.search).to.include('layer=create');
      });
    });

    describe('toggle section', function () {
      beforeEach(async function () {
        await viewRequest.itemAccordionClick();
      });

      it('toggles item section', function () {
        expect(viewRequest.itemAccordion.isExpanded).to.be.false;
      });
    });
  });

  describe.skip('View delivery request', () => {
    let requester;
    beforeEach(async function () {
      const request = this.server.create('request', {
        fulfilmentPreference: 'Delivery'
      });

      requester = this.server.schema.users.find(request.requesterId);
      this.visit('/requests/view/' + request.id);
    });

    it('shows delivery address', () => {
      const address = requester.attrs.personal.addresses[0].addressLine1;
      expect(viewRequest.requesterInfoContains(address)).to.be.true;
    });
  });

  describe('View cancelled request', () => {
    beforeEach(async function () {
      const cancellationReason = this.server.create('cancellationReason', {
        name: 'Item Not Available',
      });

      const request = this.server.create('request', {
        fulfilmentPreference: 'Delivery',
        cancellationReasonId: cancellationReason.id,
        cancellationAdditionalInformation: 'Item not found',
      });

      this.visit('/requests/view/' + request.id);
    });

    it('shows cancellation reason', () => {
      expect(viewRequest.requestInfoContains('Item Not Available')).to.be.true;
      expect(viewRequest.requestInfoContains('Item not found')).to.be.true;
    });
  });
});
