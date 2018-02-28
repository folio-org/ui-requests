const newRequest = require('./new_request.js');

module.exports.test = function runTests(uiTestCtx) {
  newRequest.test(uiTestCtx);
};
