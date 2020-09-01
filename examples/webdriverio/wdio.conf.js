const fs = require('fs');

exports.config = {
  runner: 'local',
  specs: JSON.parse(fs.readFileSync(`${process.cwd()}/.testsSelector/selectedTests.generated`).toString()),
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
