const fs = require('fs');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: JSON.parse(fs.readFileSync(`${process.cwd()}/.specsSelector/selectedTests.generated`).toString())
};