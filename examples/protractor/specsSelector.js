const SpecsSelector = require('../../dist/index').default;


if (require.main === module) {
  void async function () {
    const specsSelector = new SpecsSelector({
      specsPath: `${process.cwd()}/specs`,
      specIdentifiers: ['spec', 'e2e'],
    });
    await specsSelector.selectTests();
  }();
}
