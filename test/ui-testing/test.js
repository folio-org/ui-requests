const reqFilters = require('./filters.js');

module.exports.test = function runTests(uiTestCtx) {
  reqFilters.test(uiTestCtx);
};
