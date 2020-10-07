import {fsHelper} from "./fs.helper";
import {promptHelper, promptObjectInterface} from "./prompt.helper";


let selectedFeatureChangedFromLastRun = false;
let testsPaths = null;


export const selectTestsHelper = {
  nestingLevel: 0,
  testsDirParamsStack: [],

  async selectTests(params: ISelectTestsInterface): Promise<string[]> {
    const {
      specIdentifiers,
      specsPath,
      specsEntryPoint = specsPath,
      featureChoiceNumberPath,
      testChoiceNumberPath,
      maxFilesInDir,
    } = params;
    try {
      const {testsDirPath} = await this.getTestsDirPath({
        featureChoiceNumberPath,
        maxFilesInDir,
        specsEntryPoint,
        pathToSelectedFeature: specsEntryPoint,
      });
      testsPaths = fsHelper.getFilesRecursively(testsDirPath)
        .filter(testPath => this.isSpec({specIdentifiers, testPath}));
      const promptObjects = promptHelper.getPromptObjects({
        options: testsPaths,
        nestingLevel: this.nestingLevel, specsPath
      });
      const preselectedPromptObjects = promptHelper.preselectLastInput({
        promptObjects,
        testChoiceNumberPath,
        selectedFeatureChangedFromLastRun,
      });
      const selectedTests = await promptHelper.promptTests({
        promptObjects: preselectedPromptObjects,
        testChoiceNumberPath,
        selectedFeatureChangedFromLastRun,
      });
      if (selectedTests[0] === promptHelper.back) {
        this.nestingLevel--;
        const testsDirParams = this.testsDirParamsStack.pop();
        return this.selectTests({
          ...params,
          specsEntryPoint: testsDirParams.pathToSelectedFeature,
        });
      }
      return selectedTests;
    } catch (err) {
      console.error(`Can't start tests: ${err}`);
      throw err;
    }
  },

  async getTestsDirPath(params: IGetTestsDirPathInterface): Promise<{testsDirPath: string}> {
    const {specsPath, pathToSelectedFeature, maxFilesInDir, featureChoiceNumberPath} = params;
    this.nestingLevel++;
    const features = fsHelper.getFeatures(pathToSelectedFeature);
    const featurePromptOptions = promptHelper.getPromptObjects({options: features, specsPath});
    const selectedFeature = this.shouldPromptFeature(pathToSelectedFeature, maxFilesInDir)
      ? await promptHelper.promptFeature({
        options: featurePromptOptions,
        featureChoiceNumberPath,
        index: this.nestingLevel,
        selectedFeatureChangedFromLastRun
      })
      : '';
    if (selectedFeature === promptHelper.back) {
      return this.getTestsDirPathForChangedNestingLevel(params);
    }
    this.testsDirParamsStack.push(params);
    selectedFeatureChangedFromLastRun = this.hasSelectedFeatureChangedFromLastInput({
      features, selectedFeature, index: this.nestingLevel, featureChoiceNumberPath
    });
    selectedFeatureChangedFromLastRun &&
    fsHelper.writeSelectedFeature({features, selectedFeature, index: this.nestingLevel, featureChoiceNumberPath});
    const result = `${pathToSelectedFeature}/${selectedFeature}`;
    if (this.shouldPromptFeature(result, maxFilesInDir)) {
      return this.getTestsDirPath({
        pathToSelectedFeature: result,
        featureChoiceNumberPath,
        maxFilesInDir,
        specsPath,
        selectedFeatureChangedFromLastRun,
      });
    }
    return {testsDirPath: result};
  },

  logChoices(items: string[]): void {
    console.info('');
    items.forEach(item => console.info(item));
    console.info('');
  },

  hasSelectedFeatureChangedFromLastInput(params: ISelectedFeatureChangedFromLastInputInterface): boolean {
    const {featureChoiceNumberPath, features, index, selectedFeature} = params;
    return features.indexOf(selectedFeature) !==
      Number(fsHelper.readRememberedInput(featureChoiceNumberPath + index)[0]);
  },

  isSpec(params: IFilterSpecsInterface): boolean {
    const {testPath, specIdentifiers} = params;
    return specIdentifiers.some(specIdentifier => testPath.includes(`.${specIdentifier}.`));
  },

  getMiddle(arr: promptObjectInterface[] | string[]): number {
    return Math.floor(arr.length / 2);
  },

  shouldPromptFeature(path: string, maxFilesInDir: number): boolean {
    return fsHelper.getFilesRecursively(path).length > maxFilesInDir && fsHelper.isAllContentDirectories(path);
  },

  async getTestsDirPathForChangedNestingLevel(originalParams: IGetTestsDirPathInterface):
    Promise<{testsDirPath: string}> {
    this.nestingLevel = (this.testsDirParamsStack.length
      ? this.nestingLevel - 2
      : this.nestingLevel - 1);
    const previousParams = this.testsDirParamsStack.pop() || originalParams;
    return this.getTestsDirPath(previousParams);
  },
};


export interface ISelectTestsInterface {
  specsPath: string;
  specsEntryPoint?: string;
  specIdentifiers: string[];
  testChoiceNumberPath: string;
  featureChoiceNumberPath: string;
  maxFilesInDir: number;
}


interface IGetTestsDirPathInterface {
  pathToSelectedFeature: string;
  featureChoiceNumberPath: string;
  maxFilesInDir: number;
  specsPath: string;
}


interface IFilterSpecsInterface {
  testPath: string;
  specIdentifiers: string[];
}


interface ISelectedFeatureChangedFromLastInputInterface {
  features: string[];
  selectedFeature: string;
  index: number;
  featureChoiceNumberPath: string;
}
