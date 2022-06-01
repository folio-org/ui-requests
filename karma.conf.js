/** @param {import('karma').Config} config */
module.exports = function(config) {
  config.set({ client: { captureConsole: false } });
  config.set({
    client: {
      mocha: {
        timeout : 6000,
      },
    },
  });
};
