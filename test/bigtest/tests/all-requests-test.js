import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestsInteractor from '../interactors/requests';

const servicePoint = {
  id: 'servicepointId2',
  name: 'Circ Desk 2',
  code: 'cd2',
  discoveryDisplayName: 'Circulation Desk -- Back Entrance',
  pickupLocation: true,
};

describe('Requests', () => {
  setupApplication({
    currentUser: {
      servicePoints: [servicePoint],
      curServicePoint: servicePoint,
    },
  });

  const requests = new RequestsInteractor();

  beforeEach(async function () {
    this.visit('/requests');

    await requests.clickHoldsCheckbox();
    await requests.clickPagesCheckbox();
    await requests.clickRecallsCheckbox();
    await requests.whenInstancesArePresent(20);
  });

  it('shows the list of requests items', () => {
    expect(requests.isVisible).to.equal(true);
  });

  it('renders each request instance', () => {
    expect(requests.instanceList.size).to.be.equal(20);
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
      expect(requests.headerDropdownMenu.exportBtnIsVisible).to.be.false;
    });
  });

  describe('Export expired holds to CSV', function () {
    beforeEach(async function () {
      await requests.headerDropdown.click();
      await requests.headerDropdownMenu.clickExportExpiredHoldsToCSV();
    });

    it('exports data to csv', () => {
      expect(requests.headerDropdownMenu.exportExpiredHoldsBtnIsVisible).to.be.false;
    });
  });
});
