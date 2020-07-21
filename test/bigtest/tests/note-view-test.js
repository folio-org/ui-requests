import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import NoteViewInteractor from '../interactors/note-view';
import ViewRequestInteractor from '../interactors/view-request';

describe('Note View page', () => {
  setupApplication();

  const viewRequest = new ViewRequestInteractor();
  const noteView = new NoteViewInteractor();
  let request;

  describe('when there are Notes assigned to a request', () => {
    beforeEach(async function () {
      request = this.server.create('request');
      this.server.create('note', { id: 'test-note-id' });
      this.server.get('/note-links/domain/requests/type/:type/id/:id', ({ notes }) => {
        return notes.where(note => note.id === 'test-note-id');
      });

      this.visit(`/requests/view/${request.id}`);
    });

    describe('when clicking on an assigned note', () => {
      beforeEach(async () => {
        await viewRequest.staffNotesAccordion.whenNotesLoaded();
        await viewRequest.staffNotesAccordion.notes(0).click();
        await noteView.whenLoaded();
      });

      it('should redirect to note view page', () => {
        expect(noteView.isPresent).to.be.true;
      });

      it('should display inserted referred record', () => {
        expect(noteView.referredRecord.isPresent).to.be.true;
      });

      it('should display instance link', () => {
        expect(noteView.referredRecord.instanceTitle).to.equal(request.item.title);
      });

      it('should display item link', () => {
        expect(noteView.referredRecord.itemBarcode).to.equal(`${request.item.barcode}`);
      });

      describe('when clicking on edit button', () => {
        beforeEach(async () => {
          await noteView.clickEditButton();
        });

        it('should redirect to note edit page', function () {
          expect(this.location.pathname).to.equal('/requests/notes/test-note-id/edit/');
        });
      });

      describe('when clicking on instance title', () => {
        beforeEach(async () => {
          await noteView.referredRecord.clickInstanceLink();
        });

        it('should redirect to instance page', function () {
          expect(this.location.pathname).to.equal(`/inventory/view/${request.item.instanceId}`);
        });
      });

      describe('when clicking on item barcode', () => {
        beforeEach(async () => {
          await noteView.referredRecord.clickItemLink();
        });

        it('should redirect to item page', function () {
          const {
            itemId,
            item: {
              instanceId,
              holdingsRecordId,
            },
          } = request;

          expect(this.location.pathname).to.equal(`/inventory/view/${instanceId}/${holdingsRecordId}/${itemId}`);
        });
      });
    });
  });

  describe('when open Note View page without context', () => {
    beforeEach(async function () {
      const note = this.server.create('note');

      this.visit(`/requests/notes/${note.id}`);
    });

    it('should redirect to requests page', function () {
      expect(this.location.pathname).to.equal('/requests');
    });
  });
});
