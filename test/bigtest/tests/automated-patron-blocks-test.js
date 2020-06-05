import {
  beforeEach,
  describe,
  it,
} from '@bigtest/mocha';

import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import EditRequest from '../interactors/edit-request';

describe('Automated patron blocks', () => {
  setupApplication({
    scenarios: ['automatedPatronBlocks'],
  });

  const EditRequestInteractor = new EditRequest();

  beforeEach(async function () {
    this.server.create('user', {
      barcode: '9676761472501',
    });

    this.visit('/requests?layer=create');

    await EditRequestInteractor
      .fillUserBarcode('9676761472501')
      .clickUserEnterBtn();
  });

  it('Patron block modal exists', () => {
    expect(EditRequestInteractor.isPatronBlockModalPresent).to.be.true;
  });
});
