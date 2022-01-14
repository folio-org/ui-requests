import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestsInteractor from '../interactors/requests-interactor';

const servicePoint = {
  id: 'servicepointId2',
  name: 'Circ Desk 2',
  code: 'cd2',
  discoveryDisplayName: 'Circulation Desk -- Back Entrance',
  pickupLocation: true,
};

describe('Requests', function () {
  this.timeout(5000);

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

  describe('clicking on the Request Date header', function () {
    let dateFirst;
    let dateLast;

    beforeEach(async function () {
      dateFirst = requests.getCellContent(0, 0);
      dateLast = requests.getCellContent(19, 0);

      await requests.instanceList.headers(0).click();
    });

    it('should sort descending', function () {
      expect(requests.getCellContent(0, 0)).to.equal(dateLast);
      expect(requests.getCellContent(19, 0)).be.equal(dateFirst);
    });
  });

  describe('clicking on the first request item', function () {
    beforeEach(async function () {
      await requests.instances(0).click();
    });

    it('loads the request instance details', function () {
      expect(requests.instance.isVisible).to.equal(true);
    });
  });

  describe('clicking on New button', () => {
    beforeEach(async function () {
      await requests.headerDropdown.click();
      await requests.headerDropdownMenu.clickNew();
    });

    it('should redirect on create request page', function () {
      expect(this.location.search).to.include('layer=create');
    });
  });
});
