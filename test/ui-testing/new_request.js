module.exports.test = function(uiTestCtx) {

  describe('Module test: requests:new_request', function() {
    const { config, helpers: { login, openApp, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Open module "Requests" > Create new request > Logout', () => {
      let itembc = null;
      let userbc = null;
      before( done => {
        login(nightmare, config, done);  // logs in with the default admin credentials
      })
      after( done => {
        logout(nightmare, config, done);
      })
      it('should open module "Requests" and find version tag ', done => {
        nightmare
        .use(openApp(nightmare, config, done, 'requests', testVersion))
        .then(result => result )
      })
      it('should find a user barcode', done => {
	const listitem = '#list-users div[class^="rowContainer"] > a:nth-child(5)'
	const bcode = listitem + ' > div:nth-child(3)'
        nightmare
	.click('#clickable-users-module')
	.wait(listitem)
	.evaluate(function(bcode) {
	  var bc = document.querySelector(bcode)
	  return bc.textContent
	},bcode)
        .then(result => {
	  userbc = result
	  done()
	  console.log('        Found ' + userbc)
	})
      })
      it('should find an item barcode', done => {
	const listitem = '#list-instances > div.scrollable---3O0eW div[role="listitem"]:first-of-type'
	const bcode = '#list-instance-items > div[class^="scrollable"] > div > div:nth-child(5)'
        nightmare
	.click('#clickable-instances-module')
	.wait(listitem)
	.click(listitem)
	.wait(bcode)
	.evaluate(function(bcode) {
	  var bc = document.querySelector(bcode)
	  return bc.textContent
	},bcode)
        .then(result => {
	  itembc = result
	  done()
	  console.log('        Found ' + itembc)
	})
      })
      it('should add a new "Hold" request', done => {
        nightmare
	.click('#clickable-requests-module')
	.wait('#clickable-new-request')
	.click('#clickable-new-request')
	.wait('select[name="requestType"]')
	.select('select[name="requestType"]','Hold')
	.insert('input[name="item.barcode"]',itembc)
	.click('#clickable-select-item')
	.wait('#section-item-info a[href^="/items/view/"]')
	.insert('input[name="requester.barcode"]',userbc)
	.click('#clickable-select-requester')
	.wait('#section-requester-info a[href^="/users/view/"]')
	.wait(4444)
        .then(result => {
	  done()
	})
	.catch(done)
      })
    })
  })
}

