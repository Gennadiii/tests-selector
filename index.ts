import fs from "fs";
import {configInterface, testsSelectorConstructorInterface} from "./dist";
import {selectTestsHelper} from "./src/helpers/selectTests.helper";


export default class TestsSelector {

  // @ts-ignore
  config: configInterface = {};

  constructor(params: testsSelectorConstructorInterface = {}) {
    const {
      tempDataPath = `${process.cwd()}/.testsSelector`,
      selectedTestsFileName = `selectedTests.generated`,
      specsPath = `${process.cwd()}/specs`,
      specIdentifiers = ['spec'],
      maxFilesInDir = 10,
      testChoiceNumberFileName = `testChoiceNumber.indexHelper`,
      featureChoiceNumberFileName = `featureChoiceNumber.indexHelper`,
    } = params;
    this.config.tempDataPath = tempDataPath;
    this.config.selectedTestsFilePath = `${tempDataPath}/${selectedTestsFileName}`;
    this.config.specIdentifiers = specIdentifiers;
    this.config.specsPath = specsPath;
    this.config.maxFilesInDir = maxFilesInDir;
    this.config.testChoiceNumberPath = `${tempDataPath}/${testChoiceNumberFileName}`;
    this.config.featureChoiceNumberPath = `${tempDataPath}/${featureChoiceNumberFileName}`;
  }


  async selectTests() {
    fs.existsSync(this.config.tempDataPath) || fs.mkdirSync(this.config.tempDataPath, {recursive: true});
    const tests = await selectTestsHelper.selectTests({
      testChoiceNumberPath: this.config.testChoiceNumberPath,
      featureChoiceNumberPath: this.config.featureChoiceNumberPath,
      specsPath: this.config.specsPath,
      specIdentifiers: this.config.specIdentifiers,
      maxFilesInDir: this.config.maxFilesInDir,
    });
    fs.writeFileSync(this.config.selectedTestsFilePath, JSON.stringify(tests));
    return tests;
  }

  getTestsFromFile() {
    return JSON.parse(fs.readFileSync(this.config.selectedTestsFilePath).toString());
  }
}
