import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';

describe('Note Edit page', () => {
  setupApplication();

  describe('when open Note Edit page without context', () => {
    beforeEach(async function () {
      const note = this.server.create('note');

      this.visit(`/requests/notes/${note.id}/edit/`);
    });

    it('should redirect to requests page', function () {
      expect(this.location.pathname).to.equal('/requests');
    });
  });
});
