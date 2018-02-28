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
      it('should find hit count with no filters applied ', (done) => {
        nightmare
	  .wait('p[title*="Records found"]')
	  .wait(2222)
	  .evaluate(() => {
	    let count = document.querySelector('p[title*="Records found"]').title;
	    count = count.replace(/^(\d+).+/,'$1');
	    return count;
	  })
          .then((result) => {
	    done();
	    console.log(result);
	  });
      });
    });
  });
};
