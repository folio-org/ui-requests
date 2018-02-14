module.exports.test = function(uiTestCtx) {

  describe('Module test: requests:new_request', function() {
    const { config, helpers: { login, openApp, createInventory, logout }, meta: { testVersion } } = uiTestCtx;
    const nightmare = new Nightmare(config.nightmare);

    this.timeout(Number(config.test_timeout));

    describe('Login > Open module "Requests" > Create new request > Logout', () => {
      let userbc = null
      var nextMonthValue = new Date().valueOf() + 2419200000
      let nextMonth = new Date(nextMonthValue).toLocaleDateString('en-US')
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
	const listitem = '#list-users div[role="listitem"] > a:not([aria-label*="Barcode: undef"])'
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
	.catch(done)
      })
      let itembc = createInventory(nightmare, config, 'Request title');
      it('should check out newly created item', done => {
        nightmare
        .click('#clickable-checkout-module')
	.wait('#section-patron button[title*="Find"]')
	.click('#section-patron button[title*="Find"]')
	.wait('#list-users div[role="listitem"]:nth-of-type(9)')
	.click('#list-users div[role="listitem"]:nth-of-type(9) a')
	.wait(2222)
	.insert('#input-item-barcode', itembc)
	.click('#clickable-add-item')
	.wait('#list-items-checked-out')
	.click('#clickable-done')
	.then(result => {
	  done();
	})
	.catch(done)
      })
      /* it('should find a checked out item barcode', done => {
        nightmare
	.click('#clickable-inventory-module')
	.wait('input[name="location.Main Library"]')
	.click('input[name="location.Main Library"]')
	.wait(999)
	.click('input[name="resource.Books"]')
	.wait(3333)
	.evaluate(function() {
	  var a = [];
	  const nodes = document.querySelector('#list-inventory div[role="listitem"] a');
	  // for(x = 0; x < rows.length; x++) {
	  //   a.push(rows[x]);
	  // }
	  return nodes;
	}) 
        .then(result => {
	  done()
	  console.log('        Found ' + result)
	})
	.catch(done)
      }) */
      it('should add a new "Hold" request', done => {
        nightmare
	.click('#clickable-requests-module')
	.wait('#clickable-newrequest')
	.click('#clickable-newrequest')
	.wait('select[name="requestType"]')
	.select('select[name="requestType"]','Hold')
	.insert('input[name="item.barcode"]',itembc)
	.click('#clickable-select-item')
	.wait('#section-item-info a[href^="/inventory/view/"]')
	.insert('input[name="requester.barcode"]',userbc)
	.click('#clickable-select-requester')
	.wait('#section-requester-info a[href^="/users/view/"]')
	.select('select[name="fulfilmentPreference"]', 'Hold Shelf')
	.insert('input[name="requestExpirationDate"]', nextMonth)
	.insert('input[name="holdShelfExpirationDate"]', nextMonth)
	.click('#clickable-create-request')
	.wait(4444)
        .then(result => {
	  done()
	})
	.catch(done)
      })
    })
  })
}
