const newRequest = require('./new_request.js');
const reqFilters = require('./filters.js');

module.exports.test = function runTests(uiTestCtx) {
  newRequest.test(uiTestCtx);
  reqFilters.test(uiTestCtx);
};
