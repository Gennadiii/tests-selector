import fs from "fs";
import {selectTestsHelper} from "./helpers/selectTests.helper";
import {IConfigInterface, ITestsSelectorConstructorInterface} from "./index.interface";


export = class TestsSelector {

  public config: IConfigInterface;

  constructor(params: ITestsSelectorConstructorInterface = {}) {
    const {
      tempDataPath = `${process.cwd()}/.testsSelector`,
      selectedTestsFileName = `selectedTests.generated`,
      specsPath = `${process.cwd()}/specs`,
      specIdentifiers = ['spec'],
      maxFilesInDir = 10,
      testChoiceNumberFileName = `testChoiceNumber.indexHelper`,
      featureChoiceNumberFileName = `featureChoiceNumber.indexHelper`,
    } = params;
    this.config = {
      specIdentifiers,
      specsPath,
      maxFilesInDir,
      tempDataPath: tempDataPath,
      selectedTestsFilePath: `${tempDataPath}/${selectedTestsFileName}`,
      testChoiceNumberPath: `${tempDataPath}/${testChoiceNumberFileName}`,
      featureChoiceNumberPath: `${tempDataPath}/${featureChoiceNumberFileName}`
    };
  }


  async selectTests(): Promise<string[]> {
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

  getTestsFromFile(): string {
    return JSON.parse(fs.readFileSync(this.config.selectedTestsFilePath).toString());
  }
};
