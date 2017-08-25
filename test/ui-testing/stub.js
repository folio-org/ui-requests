module.exports.test = function(uiTestCtx) {

  describe('Module test: checkout:stub', function() {
    const { config, utils: { auth, names } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Open module "Requests" > Logout', () => {
      before( done => {
        auth.login(nightmare,config,done);
      })
      after( done => {
        auth.logout(nightmare,config,done);
      })
      it('should open module "Requests"', done => {
        nightmare
        .wait('#clickable-requests-module')
        .click('#clickable-requests-module')
        .wait(2000)
        .then(function(result) {
          done()
        })
        .catch(done)
      })
    })
  })
}

