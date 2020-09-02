const specsSelector = require("./specsSelector").specsSelector;

exports.config = {
  runner: 'local',
  specs: specsSelector.getTestsFromFile(),
  capabilities: [{
    browserName: 'chrome',
    acceptInsecureCerts: true
  }],
  logLevel: 'info',
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: ['chromedriver'],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  },
}
