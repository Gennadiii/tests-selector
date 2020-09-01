"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectTestsHelper = void 0;
const fs_helper_1 = require("./fs.helper");
const prompt_helper_1 = require("./prompt.helper");
let selectedFeatureChangedFromLastRun = false;
let testsPaths = null;
exports.selectTestsHelper = {
    selectTests(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { specIdentifiers, specsPath, featureChoiceNumberPath, testChoiceNumberPath, maxFilesInDir } = params;
            try {
                const { testsDirPath, nestingLevel } = yield this.getTestsDirPath({
                    pathToSelectedFeature: specsPath,
                    featureChoiceNumberPath,
                    maxFilesInDir,
                    specsPath,
                });
                testsPaths = fs_helper_1.fsHelper.getFilesRecursively(testsDirPath)
                    .filter(testPath => this.isSpec({ specIdentifiers, testPath }));
                const promptObjects = prompt_helper_1.promptHelper.getPromptObjects({
                    options: testsPaths,
                    nestingLevel, specsPath
                });
                const preselectedPromptObjects = prompt_helper_1.promptHelper.preselectLastInput({
                    promptObjects,
                    testChoiceNumberPath,
                    selectedFeatureChangedFromLastRun,
                });
                return yield prompt_helper_1.promptHelper.promptTests({
                    promptObjects: preselectedPromptObjects,
                    testChoiceNumberPath,
                    selectedFeatureChangedFromLastRun,
                });
            }
            catch (err) {
                console.error(`Can't start tests: ${err}`);
                throw err;
            }
        });
    },
    getTestsDirPath(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { pathToSelectedFeature, maxFilesInDir, featureChoiceNumberPath, specsPath, index = 0 } = params;
            const features = fs_helper_1.fsHelper.getFeatures(pathToSelectedFeature);
            const featurePromptOptions = prompt_helper_1.promptHelper.getPromptObjects({ options: features, specsPath });
            const selectedFeature = yield prompt_helper_1.promptHelper.promptFeature({
                options: featurePromptOptions,
                featureChoiceNumberPath,
                index,
                selectedFeatureChangedFromLastRun
            });
            selectedFeatureChangedFromLastRun = this.hasSelectedFeatureChangedFromLastInput({
                features, selectedFeature, index, featureChoiceNumberPath
            });
            fs_helper_1.fsHelper.writeSelectedFeature({ features, selectedFeature, index, featureChoiceNumberPath });
            const result = `${pathToSelectedFeature}/${selectedFeature}`;
            if (fs_helper_1.fsHelper.getFilesRecursively(result).length > maxFilesInDir && fs_helper_1.fsHelper.isAllContentDirectories(result)) {
                return this.getTestsDirPath({
                    pathToSelectedFeature: result,
                    featureChoiceNumberPath,
                    maxFilesInDir,
                    specsPath,
                    index: index + 1,
                    selectedFeatureChangedFromLastRun,
                });
            }
            return { nestingLevel: index + 1, testsDirPath: result };
        });
    },
    logChoices(items) {
        console.info('');
        items.forEach(item => console.info(item));
        console.info('');
    },
    hasSelectedFeatureChangedFromLastInput(params) {
        const { featureChoiceNumberPath, features, index, selectedFeature } = params;
        return features.indexOf(selectedFeature) !==
            Number(fs_helper_1.fsHelper.readRememberedInput(featureChoiceNumberPath + index)[0]);
    },
    isSpec(params) {
        const { testPath, specIdentifiers } = params;
        return specIdentifiers.some(specIdentifier => testPath.includes(`.${specIdentifier}.`));
    },
    getMiddle(arr) {
        return Math.floor(arr.length / 2);
    },
};
