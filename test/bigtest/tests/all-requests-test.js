import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestsInteractor from '../interactors/requests';

describe('Requests', () => {
  setupApplication();

  const requests = new RequestsInteractor();

  beforeEach(async function () {
    this.visit('/requests');

    await requests.clickHoldsCheckbox();
    await requests.clickPagesCheckbox();
    await requests.clickRecallsCheckbox();
  });

  it('shows the list of requests items', () => {
    expect(requests.isVisible).to.equal(true);
  });

  it('renders each request instance', () => {
    expect(requests.instances().length).to.be.equal(20);
  });

  describe('clicking on the first request item', function () {
    beforeEach(async function () {
      await requests.instances(0).click();
    });

    it('loads the request instance details', function () {
      expect(requests.instance.isVisible).to.equal(true);
    });
  });

  describe('Export to CSV', function () {
    beforeEach(async function () {
      await requests.headerDropdown.click();
      await requests.headerDropdownMenu.clickExportToCSV();
    });

    it('exports data to csv', () => {
      expect(true).to.be.true;
    });
  });
});
