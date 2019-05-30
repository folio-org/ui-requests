/* global describe it before after Nightmare */

module.exports.test = function uiTest(uiTestCtx) {
  describe('Module test: requests:filters', function modTest() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Open module "Requests" > Get hit counts > Click filters > Logout', () => {
      before((done) => {
        login(nightmare, config, done); // logs in with the default admin credentials
      });
      after((done) => {
        logout(nightmare, config, done);
      });

      it('should open module "Requests" and find version tag ', (done) => {
        nightmare
          .use(openApp(nightmare, config, done, 'requests', testVersion))
          .then(result => result);
      });

      it('should find "choose a filter" message', (done) => {
        nightmare
          .wait('div[class^="mclEmptyMessage"]')
          .then(done)
          .catch(done);
      });

      //
      // these tests are based on the premise that certain requests
      // exist on the system, but they were removed as part of CIRCSTORE-129.
      // we probably _should_ test the filters for different request types,
      // but we'll have to do that in platform-level integration tests that
      // function by actually creating such requests, rather than assuming
      // they already exist.
      //
      //
      // const requestTypes = ['holds', 'recalls'];
      //
      // requestTypes.forEach((filter) => {
      //   it(`should click ${filter} and change hit count`, (done) => {
      //     nightmare
      //       .wait('#input-request-search')
      //       .type('#input-request-search', 0)
      //       .wait('#clickable-reset-all')
      //       .click('#clickable-reset-all')
      //       .wait(`#clickable-filter-request-type-${filter}`)
      //       .click(`#clickable-filter-request-type-${filter}`)
      //       .wait('#list-requests:not([data-total-count^="0"])')
      //       .click('#clickable-reset-all')
      //       .wait('div[class^="mclEmptyMessage"]')
      //       .then(done)
      //       .catch(done);
      //   });
      // });
    });
  });
};
