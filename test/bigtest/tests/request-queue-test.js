import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestQueue from '../interactors/request-queue';
import urls from '../../../src/routes/urls';

describe('RequestQueue', () => {
  let requests;
  const effectiveCallNumberString = 'prefix callNumber suffix volume enumeration chronology';

  const requestQueue = new RequestQueue();

  setupApplication({
    scenarios: ['requestQueueScenario'],
  });

  beforeEach(async function () {
    requests = this.server.db.requests;
    this.visit(urls.requestQueueView(requests[0].id, requests[0].itemId));

    await requestQueue.whenSortableListPresent();
    await requestQueue.sortableList.whenLogIsPresent();
  });

  it('should display value in `Effective call number string` field', () => {
    expect(requestQueue.itemCallNumber.value.text).to.include(effectiveCallNumberString);
  });

  describe('Move request down in the queue', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowDown();
    });

    it('moves request from position 2 (row index 1) to position 3 (row index 2) in the queue', () => {
      expect(requestQueue.sortableList.rows(2).cols(4).text).to.equal(requests[1].requester.barcode);
    });
  });

  describe('Confirm reorder', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowUp();
    });

    it('shows dialog about moving request to position 2 of the queue', () => {
      expect(requestQueue.confirmReorderModalIsPresent).to.equal(true);
    });
  });

  describe('Keep item on position 2 after reorder confirmation', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowUp();
      await requestQueue.confirmReorderModalPresent();
      await requestQueue.confirmReorderModal.clickConfirm();
    });

    it('closes confirm dialog and keeps request on second position', () => {
      expect(requestQueue.confirmReorderModalIsPresent).to.equal(false);
      expect(requestQueue.sortableList.rows(1).cols(4).text).to.equal(requests[1].requester.barcode);
    });
  });

  describe('Cancel reorder', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowUp();
      await requestQueue.confirmReorderModalPresent();
      await requestQueue.confirmReorderModal.clickCancel();
    });

    it('closes confirm dialog and keeps requests unchanged', () => {
      expect(requestQueue.confirmReorderModalIsPresent).to.equal(false);
      expect(requestQueue.sortableList.rows(1).cols(4).text).to.equal(requests[1].requester.barcode);
    });
  });

  describe('Close reorder screen', () => {
    beforeEach(async function () {
      await requestQueue.close();
    });

    it('closes confirm dialog and keeps requests unchanged', () => {
      expect(requestQueue.sortableListPresent).to.equal(false);
    });
  });
});
