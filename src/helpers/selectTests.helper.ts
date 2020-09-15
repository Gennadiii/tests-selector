import {fsHelper} from "./fs.helper";
import {promptHelper, promptObjectInterface} from "./prompt.helper";


let selectedFeatureChangedFromLastRun = false;
let testsPaths = null;


export const selectTestsHelper = {
  async selectTests(params: selectTestsInterface): Promise<string[]> {
    const {specIdentifiers, specsPath, featureChoiceNumberPath, testChoiceNumberPath, maxFilesInDir} = params;
    try {
      const {testsDirPath, nestingLevel} = await this.getTestsDirPath({
        featureChoiceNumberPath,
        maxFilesInDir,
        specsPath,
      });
      testsPaths = fsHelper.getFilesRecursively(testsDirPath)
        .filter(testPath => this.isSpec({specIdentifiers, testPath}));
      const promptObjects = promptHelper.getPromptObjects({
        options: testsPaths,
        nestingLevel, specsPath
      });
      const preselectedPromptObjects = promptHelper.preselectLastInput({
        promptObjects,
        testChoiceNumberPath,
        selectedFeatureChangedFromLastRun,
      });
      return await promptHelper.promptTests({
        promptObjects: preselectedPromptObjects,
        testChoiceNumberPath,
        selectedFeatureChangedFromLastRun,
      });
    } catch (err) {
      console.error(`Can't start tests: ${err}`);
      throw err;
    }
  },

  async getTestsDirPath(params: getTestsDirPathInterface):
    Promise<{testsDirPath: string, nestingLevel: number}> {
    const {specsPath, pathToSelectedFeature = specsPath, maxFilesInDir, featureChoiceNumberPath, index = 0} = params;
    const features = fsHelper.getFeatures(pathToSelectedFeature);
    const featurePromptOptions = promptHelper.getPromptObjects({options: features, specsPath});
    const selectedFeature = this.shouldPromptFeature(pathToSelectedFeature, maxFilesInDir)
      ? await promptHelper.promptFeature({
        options: featurePromptOptions,
        featureChoiceNumberPath,
        index,
        selectedFeatureChangedFromLastRun
      })
      : '';
    selectedFeatureChangedFromLastRun = this.hasSelectedFeatureChangedFromLastInput({
      features, selectedFeature, index, featureChoiceNumberPath
    });
    selectedFeatureChangedFromLastRun &&
    fsHelper.writeSelectedFeature({features, selectedFeature, index, featureChoiceNumberPath});
    const result = `${pathToSelectedFeature}/${selectedFeature}`;
    if (this.shouldPromptFeature(result, maxFilesInDir)) {
      return this.getTestsDirPath({
        pathToSelectedFeature: result,
        featureChoiceNumberPath,
        maxFilesInDir,
        specsPath,
        index: index + 1,
        selectedFeatureChangedFromLastRun,
      });
    }
    return {nestingLevel: index + 1, testsDirPath: result};
  },

  logChoices(items: string[]): void {
    console.info('');
    items.forEach(item => console.info(item));
    console.info('');
  },

  hasSelectedFeatureChangedFromLastInput(params: selectedFeatureChangedFromLastInputInterface): boolean {
    const {featureChoiceNumberPath, features, index, selectedFeature} = params;
    return features.indexOf(selectedFeature) !==
      Number(fsHelper.readRememberedInput(featureChoiceNumberPath + index)[0]);
  },

  isSpec(params: filterSpecsInterface): boolean {
    const {testPath, specIdentifiers} = params;
    return specIdentifiers.some(specIdentifier => testPath.includes(`.${specIdentifier}.`));
  },

  getMiddle(arr: promptObjectInterface[] | string[]): number {
    return Math.floor(arr.length / 2);
  },

  shouldPromptFeature(path: string, maxFilesInDir: number): boolean {
    return fsHelper.getFilesRecursively(path).length > maxFilesInDir && fsHelper.isAllContentDirectories(path);
  },
};


export interface selectTestsInterface {
  specsPath: string;
  specIdentifiers: string[];
  testChoiceNumberPath: string;
  featureChoiceNumberPath: string;
  maxFilesInDir: number;
}


interface getTestsDirPathInterface {
  pathToSelectedFeature?: string;
  featureChoiceNumberPath: string;
  maxFilesInDir: number;
  index?: number;
  specsPath: string;
}


interface filterSpecsInterface {
  testPath: string;
  specIdentifiers: string[];
}


interface selectedFeatureChangedFromLastInputInterface {
  features: string[];
  selectedFeature: string;
  index: number;
  featureChoiceNumberPath: string;
}
