import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestsInteractor from '../interactors/requests-interactor';

import translations from '../../../translations/ui-requests/en';

const servicePoint = {
  id: 'servicepointId2',
  name: 'Circ Desk 2',
  code: 'cd2',
  discoveryDisplayName: 'Circulation Desk -- Back Entrance',
  pickupLocation: true,
};

describe('Export to CSV', () => {
  describe('default scenario', () => {
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

    describe('Export to CSV', function () {
      beforeEach(async () => {
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

      it('exports expired holds to csv', () => {
        expect(requests.headerDropdownMenu.exportExpiredHoldsBtnIsVisible).to.be.false;
      });
    });
  });

  describe('zero expired holds records ', () => {
    setupApplication({
      scenarios: ['default', 'zeroExpiredHoldsRecords'],
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

    describe('Export expired holds to CSV', function () {
      beforeEach(async function () {
        await requests.headerDropdown.click();
      });

      it('exports data to csv', () => {
        expect(requests.headerDropdownMenu.isExportExpiredHoldsToCSVDisabled).to.be.true;
      });
    });
  });

  describe('user without service point', () => {
    setupApplication({
      scenarios: ['default', 'zeroExpiredHoldsRecords'],
    });

    const requests = new RequestsInteractor();

    beforeEach(async function () {
      this.visit('/requests');

      await requests.clickHoldsCheckbox();
      await requests.clickPagesCheckbox();
      await requests.clickRecallsCheckbox();
      await requests.whenInstancesArePresent(20);
    });

    describe('Export expired holds to CSV', function () {
      beforeEach(async function () {
        await requests.headerDropdown.click();
        await requests.headerDropdownMenu.clickExportExpiredHoldsToCSV();
      });

      it('exports data to csv', () => {
        expect(requests.headerDropdownMenu.exportExpiredHoldsBtnIsVisible).to.be.false;
      });

      describe('error modal ', () => {
        it('should be displayed', () => {
          expect(requests.errorModal.isPresent).to.be.true;
        });

        it('should have proper text', () => {
          expect(requests.errorModal.content.text).to.equal(translations['noServicePoint.errorMessage']);
        });

        it('should have close button', () => {
          expect(requests.errorModal.closeButton.isPresent).to.be.true;
        });

        describe('close button click', () => {
          beforeEach(async function () {
            await requests.errorModal.closeButton.click();
          });

          it('error modal should not be displayed', () => {
            expect(requests.errorModal.isPresent).to.be.true;
          });
        });
      });
    });
  });
});
