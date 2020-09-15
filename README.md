# Tests Selector &middot;

CLI tool to select UI tests for execution.

`tests-selector` will parse your tests folder and provide a lost of features with tests inside. You can select any number of tests inside a feature.

![npm downloads](https://img.shields.io/npm/dm/tests-selector.svg?style=flat-square)

## Installation

```bash
$ npm install tests-selector --save-dev
```

### Basic usage

Tests selector returns an array of selected tests paths. If you use framework like wdio or protractor that might not work for you. Tests selector also writes a file with the same array of selected tests, so you may read this file in your framework's config using getTestsFromFile method. Just run tests selector first. You may find examples in the repo.

```specsSelector.js```
```
const SpecsSelector = require('../../dist/index').default;


if (require.main === module) {
  void async function () {
    const specsSelector = new SpecsSelector({
      specsPath: `${process.cwd()}/test/specs`,
      specIdentifiers: ['spec', 'e2e'],
    });
    await specsSelector.selectTests();
  }();
}
```
```package.json```
```
"scripts": {
    "test": "node specsSelector.js && wdio run wdio.conf.js"
  },
```
```wdio.conf```

```specs: specsSelector.getTestsFromFile(),```

![](examples/demo.gif)

## Features

0. Supports any number of tests, just make subfolders.
0. Remembers your choices. Just press enter a couple of times to run your previous tests.
0. Filters your tests by preset identifier.
0. Sets cursor to middle position for faster navigation.

### Available options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `tempDataPath` | `<root>/.testsSelector` | Directory to store temp files |
| `specsPath` | `<root>/specs` | Path to your tests folder |
| `specIdentifiers` | `['spec']` | Array of substrings to your test files. Tests selector will filter out all files in `specsPath` directory which don't have `spec` in their names |
| `maxFilesInDir` | `10` | By default if a directory has more than 10 files Tests selector will suggest you to go inside of subdirectory so you won't have to go through 100 tests in console. Note that this wI'll work only if directory has only subdirectories without test files |
| `selectedTestsFileName` | `selectedTests.generated` | File name where Tests selector writes tests paths you chose |
| `testChoiceNumberFileName` | `testChoiceNumber.indexHelper` | File name where Tests selector writes your tests choices |
| `featureChoiceNumberFileName` | `featureChoiceNumber.indexHelper` | File where Tests selector writes your feature choices |

TestsSelector instance also provide

## Contributing

Feel free to open up issue or submit a PR. Thanks!

## Changelog

- 1.0.0 - Initial release
- 1.0.4 - Fix for absent dist
- 1.0.9 - Added typings
- 1.1.0 - Added getting selected tests from file method
- 1.1.4 - optimized build
- 1.1.5 - got rid of "default" when importing with JS
