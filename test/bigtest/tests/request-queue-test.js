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

  const requestQueue = new RequestQueue();

  setupApplication({
    scenarios: ['requestQueueScenario'],
  });

  beforeEach(async function () {
    requests = this.server.db.requests;
    this.visit(urls.requestQueueView(requests[0].id, requests[0].instanceId));

    await requestQueue.whenSortableListPresent();
    await requestQueue.sortableList.whenLogIsPresent();
  });

  describe('Move request down in the queue', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowDown();
    });

    it('moves request from position 2 (row index 1) to position 3 (row index 2) in the queue', () => {
      expect(requestQueue.sortableList.rows(2).cols(6).text).to.equal(requests[1].requester.barcode);
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
