const specsSelector = require("./specsSelector").specsSelector;

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: specsSelector.getTestsFromFile(),
};
