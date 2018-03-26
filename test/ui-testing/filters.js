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
          .wait('p[title*="Records found"]:not([title^="0 "]')
          .evaluate(() => {
            let count = document.querySelector('p[title*="Records found"]').title;
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
            .click(`#clickable-filter-requestType-${filter}`)
            .wait(`p[title*="Records found"]:not([title^="${hitCount} "]`)
            /* .evaluate((hc) => {
              let count = document.querySelector('p[title*="Records found"]').title;
              count = count.replace(/^(\d+).+/, '$1');
              if (count === hc) {
                throw new Error(`Filtered hit count (${count}) equals total count (${hc})`);
              }
            }, hitCount) */
            .click(`#clickable-filter-requestType-${filter}`)
            .wait(`p[title="${hitCount} Records found"]`)
            .then(done)
            .catch(done);
        });
      });
    });
  });
};
