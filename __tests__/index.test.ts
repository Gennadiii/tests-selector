import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import events from "events";
import fs from "fs";
import TestsSelector from "../src/index";
import {promptHelper, promptObjectInterface} from "../src/helpers/prompt.helper";
import {selectTestsHelper} from "../src/helpers/selectTests.helper";


const config = {
  tempDataPath: `${process.cwd()}/.testsSelector`,
  specsPath: `${process.cwd()}/.testsSelector/specs`,
  selectedTestsFileName: `selectedTests.generated`,
  featureChoiceNumberFileName: `featureChoiceNumber.indexHelper`,
  testChoiceNumberFileName: `testChoiceNumber.indexHelper`,
};
const tempDataPath = `${config.tempDataPath}/.testsSelector`;
const testsSelector = new TestsSelector(config);
const featureEventEmitter = new events.EventEmitter();
const testsEventEmitter = new events.EventEmitter();
fs.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature1`, {recursive: true});
fs.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2`, {recursive: true});
fs.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1`, {recursive: true});
fs.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature2`, {recursive: true});
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature1/test1.spec.ts`, '');
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature1/test2.spec.ts`, '');
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test3.spec.ts`, '');
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test4.spec.ts`, '');
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test5.spec.ts`, '');
fs.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature2/test6.spec.ts`, '');
const specs = {
  feature1: [
    `${process.cwd()}/specs/feature1/test1.spec.ts`,
    `${process.cwd()}/specs/feature1/test2.spec.ts`,
  ],
  feature2: {
    subFeature1: [
      `${process.cwd()}/specs/feature2/subFeature1/test3.spec.ts`,
      `${process.cwd()}/specs/feature2/subFeature1/test4.spec.ts`,
      `${process.cwd()}/specs/feature2/subFeature1/test5.spec.ts`,
    ],
    subFeature2: [
      `${process.cwd()}/specs/feature2/subFeature2/test6.spec.ts`,
    ],
  },
};


describe(`index`, () => {
  describe(`default parameters`, () => {
    it(`checks default parameters`, () => {
      const tempDataPath = `${process.cwd()}/.testsSelector`;
      expect(new TestsSelector().config).toEqual({
        tempDataPath,
        selectedTestsFilePath: `${tempDataPath}/selectedTests.generated`,
        specIdentifiers: ['spec'],
        specsPath: `${process.cwd()}/specs`,
        maxFilesInDir: 10,
        testChoiceNumberPath: `${tempDataPath}/testChoiceNumber.indexHelper`,
        featureChoiceNumberPath: `${tempDataPath}/featureChoiceNumber.indexHelper`,
      });
    });
  });

  describe(`selectTests`, () => {
    void beforeEach(() => {
      jest.restoreAllMocks();
      jest.spyOn(selectTestsHelper, 'selectTests').mockImplementation(async () => []);
      jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
    });

    it(`creates temp dir`, () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(() => false);
      const writeFileSyncMock = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => null);
      void testsSelector.selectTests();
      expect(existsSyncMock).toBeCalledWith(tempDataPath);
      expect(writeFileSyncMock).toBeCalledWith(tempDataPath, {recursive: true});
    });

    it(`doesn't create temp dir if it already exists`, () => {
      const existsSyncMock = jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
      const writeFileSyncMock = jest.spyOn(fs, 'mkdirSync').mockImplementation(() => null);
      void testsSelector.selectTests();
      expect(existsSyncMock).toBeCalledWith(tempDataPath);
      expect(writeFileSyncMock).not.toBeCalled();
    });
  });

  describe(`getTestsFromFile`, () => {
    it(`returns selected tests array from file`, () => {
      const readFileMock = jest.spyOn(fs, 'readFileSync')
        .mockImplementation(() => new Buffer("[\"path/someTest.spec.js\"]"));
      const stringifyMock = jest.spyOn(JSON, 'parse')
        .mockImplementation(() => "[\"path/someTest.spec.js\"]");
      const result = testsSelector.getTestsFromFile();
      expect(readFileMock).toBeCalledWith(`${tempDataPath}/${config.selectedTestsFileName}`);
      expect(stringifyMock).toBeCalledWith("[\"path/someTest.spec.js\"]");
      expect(result).toEqual("[\"path/someTest.spec.js\"]");
    });
  });
});


describe(`e2e`, () => {
  void beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, 'info').mockImplementation(() => null);
    jest.spyOn(console, 'error').mockImplementation(() => null);
    jest.spyOn(promptHelper, 'prompt').mockImplementation(() => featureEventEmitter);
    jest.spyOn(promptHelper, 'multiPrompt').mockImplementation(() => testsEventEmitter);
  });

  it(`selects test`, async done => {
    const selection = testsSelector.selectTests();
    await simulateChoices({
      feature: 'feature1', tests: [
        {selected: false, value: specs.feature1[0]},
        {selected: true, value: specs.feature1[1]},
      ]
    });
    expect(await selection).toEqual([specs.feature1[1]]);
    expect(removeSlashes(fs.readFileSync(`${tempDataPath}/${config.selectedTestsFileName}`).toString()))
      .toEqual(`["${removeSlashes(specs.feature1[1])}"]`);
    done();
  });

  it(`retries tests selection with deleting temp files`, async done => {
    const selectTestsMock = jest.spyOn(selectTestsHelper, 'selectTests');
    const mkDirMock = jest.spyOn(fs, 'mkdirSync');
    jest.spyOn(selectTestsHelper, 'getTestsDirPath').mockImplementationOnce(() => {
      throw new Error('Some error');
    });
    fs.existsSync(tempDataPath) && fs.rmdirSync(tempDataPath, {recursive: true});
    const selection = testsSelector.selectTests();
    await simulateChoices({
      feature: 'feature1', tests: [
        {selected: false, value: specs.feature1[0]},
        {selected: true, value: specs.feature1[1]},
      ]
    });
    expect(await selection).toEqual([specs.feature1[1]]);
    expect(selectTestsMock).toBeCalledTimes(2);
    expect(mkDirMock).toHaveBeenNthCalledWith(1, tempDataPath, {"recursive": true});
    expect(mkDirMock).toHaveBeenNthCalledWith(2, tempDataPath, {"recursive": true});
    done();
  });

  it(`retries tests selection just ones`, async done => {
    jest.spyOn(selectTestsHelper, 'getTestsDirPath').mockImplementation(() => {
      throw new Error('Some error');
    });
    await expect(testsSelector.selectTests()).rejects.toThrow('Some error');
    done();
  });

  it(`selects multiple tests from different feature`, async done => {
    fs.writeFileSync(`${tempDataPath}/${config.featureChoiceNumberFileName + 0}`, '2');
    fs.writeFileSync(`${tempDataPath}/${config.testChoiceNumberFileName}`, '0');
    const selection = testsSelector.selectTests();
    await simulateChoices({
      feature: 'feature2', subFeature: 'subFeature1', tests: [
        {selected: false, value: specs.feature2.subFeature1[0]},
        {selected: true, value: specs.feature2.subFeature1[1]},
        {selected: true, value: specs.feature2.subFeature1[2]},
      ]
    });
    expect(await selection).toEqual([specs.feature2.subFeature1[1], specs.feature2.subFeature1[2]]);
    expect(removeSlashes(fs.readFileSync(`${tempDataPath}/${config.selectedTestsFileName}`).toString()))
      .toEqual(`["${removeSlashes(specs.feature2.subFeature1[1])}","${removeSlashes(specs.feature2.subFeature1[2])}"]`);
    done();
  });
});


async function simulateChoices(params: simulateChoicesInterface) {
  const {feature, subFeature, tests} = params;
  featureEventEmitter.emit('submit', feature);
  await sleep(1);
  if (subFeature) {
    featureEventEmitter.emit('submit', subFeature);
    await sleep(1);
  }
  testsEventEmitter.emit('submit', tests);
}

function sleep(timeout) {
  return new Promise(resolve => setTimeout(resolve, timeout));
}

function removeSlashes(str: string): string {
  return str.replace(/\\|\//g, '');
}


interface simulateChoicesInterface {
  feature: string;
  subFeature?: string;
  tests: Omit<promptObjectInterface, 'title'>[];
}
