import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import ViewRequestInteractor from '../interactors/view-request';
import NewRequestInteractor from '../interactors/new-request';

import translations from '../../../translations/ui-requests/en';

describe('View request page', () => {
  setupApplication();

  const requestsOnItemValue = '3';

  const viewRequest = new ViewRequestInteractor();
  const newRequest = new NewRequestInteractor();

  describe('View default request', () => {
    let request;

    beforeEach(async function () {
      request = this.server.create('request', { requestCount: requestsOnItemValue });
      this.visit(`/requests/view/${request.id}`);
    });

    it('should display a number of requests on item', () => {
      expect(viewRequest.requestsOnItem.value.text).to.equal(requestsOnItemValue);
    });

    it('should display a patron comments field', () => {
      expect(viewRequest.patronComments.label.text).to.equal(translations.patronComments);
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

    it('should display staff notes accordion', () => {
      expect(viewRequest.staffNotesAccordion.isPresent).to.be.true;
    });

    describe('when click new button in staff notes accordion', () => {
      beforeEach(async () => {
        await viewRequest.staffNotesAccordion.clickNewButton();
      });

      it('should display new staff notes page', function () {
        expect(this.location.pathname).to.equal('/requests/notes/new');
      });
    });

    describe('when there are Notes assigned to a request', () => {
      beforeEach(async function () {
        this.server.create('note', {
          id: 'test-note-id',
        });
        this.server.get('/note-links/domain/requests/type/:type/id/:id', ({ notes }) => {
          return notes.where(note => note.id === 'test-note-id');
        });

        this.visit(`/requests/view/${request.id}`);
      });

      describe('when clicking on an assigned note', () => {
        beforeEach(async () => {
          await viewRequest.staffNotesAccordion.whenNotesLoaded();
          await viewRequest.staffNotesAccordion.notes(0).click();
        });

        it('should redirect to note view page', function () {
          expect(this.location.pathname).to.equal('/requests/notes/test-note-id');
        });

        describe('when clicking on X button', () => {
          beforeEach(async () => {
            await viewRequest.clickCloseNoteButton();
          });

          it('should redirect to request view page', function () {
            expect(this.location.pathname).to.equal(`/requests/view/${request.id}`);
          });
        });
      });
    });

    describe('when click assign / unassign button', () => {
      beforeEach(async () => {
        await viewRequest.staffNotesAccordion.clickAssignButton();
      });

      it('should open popup "Assign / Unassign note"', () => {
        expect(viewRequest.notesModal.isDisplayed).to.be.true;
      });
    });
  });

  describe('View delivery request', () => {
    let requester;
    beforeEach(function () {
      const request = this.server.create('request', {
        fulfilmentPreference: 'Delivery'
      });

      requester = this.server.schema.users.find(request.requesterId);
      return this.visit('/requests/view/' + request.id);
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
        status: 'Closed - Cancelled',
      });

      this.visit('/requests/view/' + request.id);
    });

    it('shows cancellation reason', () => {
      expect(viewRequest.requestInfoContains('Item Not Available')).to.be.true;
      expect(viewRequest.requestInfoContains('Item not found')).to.be.true;
    });

    describe('duplicate closed request', function () {
      beforeEach(async () => {
        await viewRequest.headerDropdown.click();
        await viewRequest.headerDropdownMenu.clickDuplicate();
        await newRequest.isPresent;
      });

      it('opens request form', function () {
        expect(this.location.search).to.include('layer=create');
      });
    });
  });
});
