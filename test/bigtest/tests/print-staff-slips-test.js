import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../helpers/setup-application';
import RequestsInteractor from '../interactors/requests-interactor';

const servicePoint = {
  id: 'servicepointId1',
  name: 'Circ Desc 1',
};

const requests = new RequestsInteractor();

describe('Print pick slips', () => {
  describe('print pick slips', () => {
    setupApplication({
      currentUser: {
        servicePoints: [servicePoint],
        curServicePoint: servicePoint,
      },
    });

    describe('render print button', () => {
      beforeEach(async function () {
        this.visit('/requests');
        await requests.headerDropdown.click();
      });

      it('should show print button', () => {
        expect(requests.headerDropdownMenu.printPickSlipsIsVisible).to.be.true;
      });

      it('should not be disabled', () => {
        expect(requests.headerDropdownMenu.printPickSlipsIsDisabled).to.be.false;
      });
    });
  });
});
