"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.promptHelper = void 0;
const fs_helper_1 = require("./fs.helper");
const multiselect_prompt_1 = __importDefault(require("multiselect-prompt"));
const select_prompt_1 = __importDefault(require("select-prompt"));
const selectTests_helper_1 = require("./selectTests.helper");
exports.promptHelper = {
    prompt: select_prompt_1.default,
    multiPrompt: multiselect_prompt_1.default,
    getPromptObjects(params) {
        const { options, specsPath, nestingLevel } = params;
        return options.map(option => {
            let iterationsCounter = nestingLevel;
            let title = option.replace(specsPath, '');
            while (iterationsCounter--) {
                title = fs_helper_1.fsHelper.removeFirstDirFromPath(title);
            }
            title = title.replace(/\//g, ' - ');
            return {
                title,
                value: option,
                selected: false,
            };
        });
    },
    promptFeature(params) {
        const { featureChoiceNumberPath, index, options, selectedFeatureChangedFromLastRun } = params;
        return new Promise(resolve => {
            const rememberedInput = Number(fs_helper_1.fsHelper.readRememberedInput(featureChoiceNumberPath + index)[0]);
            const cursor = !selectedFeatureChangedFromLastRun && rememberedInput >= 0
                ? rememberedInput
                : selectTests_helper_1.selectTestsHelper.getMiddle(options);
            console.info('Press esc to exit');
            this.prompt('Select feature:', options, { cursor })
                .on('submit', resolve)
                .on('abort', () => process.exit(0));
        });
    },
    promptTests(params) {
        const { promptObjects, selectedFeatureChangedFromLastRun, testChoiceNumberPath } = params;
        console.info(`Choose nothing to go with everything`);
        return new Promise(resolve => {
            const rememberedInput = fs_helper_1.fsHelper.readRememberedInput(testChoiceNumberPath);
            const cursor = selectedFeatureChangedFromLastRun || rememberedInput.length === 0
                ? selectTests_helper_1.selectTestsHelper.getMiddle(promptObjects)
                : rememberedInput[selectTests_helper_1.selectTestsHelper.getMiddle(rememberedInput)];
            this.multiPrompt('Select tests to run: ', promptObjects, { cursor })
                .on('submit', items => {
                fs_helper_1.fsHelper.writeSelectedTests({ items, testChoiceNumberPath });
                let chosenItemsValues = this.getSelectedItemsValues(items);
                if (chosenItemsValues.length === 0) {
                    chosenItemsValues = this.getItemsValues(items);
                }
                console.info(`Running tests: `);
                selectTests_helper_1.selectTestsHelper.logChoices(chosenItemsValues);
                resolve(chosenItemsValues);
            })
                .on('abort', () => process.exit(0));
        });
    },
    getItemsValues(items) {
        return items.map(item => item.value);
    },
    getSelectedItemsValues(items) {
        return items.filter(item => item.selected)
            .map(item => item.value);
    },
    preselectLastInput(params) {
        const { promptObjects, selectedFeatureChangedFromLastRun, testChoiceNumberPath } = params;
        if (selectedFeatureChangedFromLastRun) {
            return promptObjects;
        }
        const lastInputs = fs_helper_1.fsHelper.readRememberedInput(testChoiceNumberPath);
        lastInputs.forEach(lastInput => {
            if (promptObjects[lastInput]) {
                promptObjects[lastInput].selected = true;
            }
        });
        return promptObjects;
    },
};
