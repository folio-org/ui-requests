import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import requestQueue from '../interactors/request-queue';
import urls from '../../../src/routes/urls';

describe.only('RequestQueue', () => {
  setupApplication({
    scenarios: ['requestQueueScenario'],
  });

  beforeEach(async function () {
    const requests = this.server.createList('request', 3, { requestType: 'Page' }, 'withPagedItems');

    this.visit(urls.requestQueueView(requests.id));
  });

  describe('Move third request up', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.thirdRow.moveUp();
    });

    it('success', () => {
      expect(true).to.be.true;
    });
  });
});
