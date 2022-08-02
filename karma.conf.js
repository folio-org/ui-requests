const { DEFAULT_TIMEOUT } = require('./test/bigtest/constants');

/** @param {import('karma').Config} config */
module.exports = config => {
  config.set({
    client: {
      captureConsole: false,
      mocha: {
        timeout : DEFAULT_TIMEOUT,
      },
    },
  });
};
