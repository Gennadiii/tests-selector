import fs from "fs";
import {selectTestsHelper} from "./helpers/selectTests.helper";
import {IConfigInterface, ITestsSelectorConstructorInterface} from "./index.interface";


let didRetry = false;


export = class TestsSelector {

  public config: IConfigInterface;

  constructor(params: ITestsSelectorConstructorInterface = {}) {
    const {
      tempDataPath = `${process.cwd()}`,
      selectedTestsFileName = `selectedTests.generated`,
      specsPath = `${process.cwd()}/specs`,
      specIdentifiers = ['spec'],
      maxFilesInDir = 10,
      testChoiceNumberFileName = `testChoiceNumber.indexHelper`,
      featureChoiceNumberFileName = `featureChoiceNumber.indexHelper`,
    } = params;
    const tempDataFullPath = `${tempDataPath}/.testsSelector`;
    this.config = {
      specIdentifiers,
      specsPath,
      maxFilesInDir,
      tempDataPath: tempDataFullPath,
      selectedTestsFilePath: `${tempDataFullPath}/${selectedTestsFileName}`,
      testChoiceNumberPath: `${tempDataFullPath}/${testChoiceNumberFileName}`,
      featureChoiceNumberPath: `${tempDataFullPath}/${featureChoiceNumberFileName}`
    };
  }


  async selectTests(): Promise<string[]> {
    try {
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
    } catch (err) {
      if (!didRetry) {
        didRetry = true;
        fs.rmdirSync(this.config.tempDataPath, {recursive: true});
        return this.selectTests();
      }
      throw err;
    }
  }

  getTestsFromFile(): string {
    return JSON.parse(fs.readFileSync(this.config.selectedTestsFilePath).toString());
  }
};
