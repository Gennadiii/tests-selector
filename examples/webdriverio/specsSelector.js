const SpecsSelector = require('tests-selector').default;


const specsSelector = new SpecsSelector({
  specsPath: `${process.cwd()}/test/specs`,
  specIdentifiers: ['spec', 'e2e'],
});

if (require.main === module) {
  void async function () {
    await specsSelector.selectTests();
  }();
}

module.exports.specsSelector = specsSelector;
