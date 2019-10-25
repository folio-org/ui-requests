import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import requestQueue from '../interactors/request-queue';
import urls from '../../../src/routes/urls';

describe('RequestQueue', () => {
  let requests;

  setupApplication({
    scenarios: ['requestQueueScenario'],
  });

  beforeEach(async function () {
    requests = this.server.db.requests;
    this.visit(urls.requestQueueView(requests[0].id));

    await requestQueue.whenSortableListPresent();
    await requestQueue.sortableList.whenLogIsPresent();
  });

  describe('Move request up in the queue', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowUp();
    });

    it('moves request from position 3 (row index 2) to position 2 (row index 1) in the queue', () => {
      expect(requestQueue.sortableList.rows(1).cols(4).text).to.equal(requests[2].requester.barcode);
    });
  });

  describe('Move request down in the queue', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.moveRowDown();
    });

    it('moves request from position 2 (row index 1) to position 3 (row index 2) in the queue', () => {
      expect(requestQueue.sortableList.rows(2).cols(4).text).to.equal(requests[1].requester.barcode);
    });
  });
});
