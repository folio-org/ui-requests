/* global describe it before after Nightmare */

module.exports.test = function uiTest(uiTestCtx) {
  describe('Module test: requests:filters', function modTest() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));
    const requestTypes = ['Holds', 'Recalls'];
    let hitCount = null;
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
      it('should find hit count with no filters applied ', (done) => {
        nightmare
          .wait('p[title*="records found"]:not([title^="0 "]')
          .evaluate(() => {
            let count = document.querySelector('p[title*="records found"]').title;
            count = count.replace(/^(\d+).+/, '$1');
            return count;
          })
          .then((result) => {
            done();
            hitCount = result;
          })
          .catch(done);
      });
      requestTypes.forEach((filter) => {
        it(`should click ${filter} and change hit count`, (done) => {
          nightmare
            .wait('#input-request-search')
            .type('#input-request-search', 0)
            .wait('#clickable-reset-all')
            .click('#clickable-reset-all')
            .wait(`#clickable-filter-requestType-${filter}`)
            .click(`#clickable-filter-requestType-${filter}`)
            .wait('#clickable-reset-all')
            .wait(`p[title*="records found"]:not([title^="${hitCount} "]`)
            .click(`#clickable-filter-requestType-${filter}`)
            .wait(`p[title="${hitCount} records found"]`)
            .then(done)
            .catch(done);
        });
      });
    });
  });
};
