/* global describe it before after Nightmare */

module.exports.test = function uiTest(uiTestCtx) {
  describe('Module test: requests:filters', function modTest() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));
    const requestTypes = ['holds', 'recalls'];

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

      requestTypes.forEach((filter) => {
        it(`should click ${filter} and change hit count`, (done) => {
          nightmare
            .wait('#input-request-search')
            .type('#input-request-search', 0)
            .wait('#clickable-reset-all')
            .click('#clickable-reset-all')
            .wait(`#clickable-filter-request-type-${filter}`)
            .click(`#clickable-filter-request-type-${filter}`)
            .wait('#list-requests:not([data-total-count^="0"])')
            .click('#clickable-reset-all')
            .wait('div[class^="mclEmptyMessage"]')
            .then(done)
            .catch(done);
        });
      });
    });
  });
};
