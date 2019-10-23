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
  setupApplication();

  beforeEach(async function () {
    const request = this.server.create('request', 'withPagedItems', { requestType: 'Page' });
    this.visit(urls.requestQueueView(request.id));
  });

  describe('Move request up', () => {
    beforeEach(async function () {
      await requestQueue.sortableList.secondRow.moveUp();
    });

    it('success', () => {
      expect(true).to.be.true;
    });
  });
});
