const SpecsSelector = require('tests-selector').default;


if (require.main === module) {
  void async function () {
    const specsSelector = new SpecsSelector({
      specsPath: `${process.cwd()}/test/specs`,
      specIdentifiers: ['spec', 'e2e'],
    });
    await specsSelector.selectTests();
  }();
}
