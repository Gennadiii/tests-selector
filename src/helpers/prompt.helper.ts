import {fsHelper} from "./fs.helper";
import * as multiPrompt from "multiselect-prompt";
import * as prompt from "select-prompt";
import {selectTestsHelper} from "./selectTests.helper";


export const promptHelper = {
  prompt,
  multiPrompt,

  getPromptObjects(params: getPromptObjectsInterface): promptObjectInterface[] {
    const {options, specsPath, nestingLevel} = params;
    return options.map(option => {
      let iterationsCounter = nestingLevel;
      let title = option.replace(specsPath, '');
      while (iterationsCounter--) {
        title = fsHelper.removeFirstDirFromPath(title);
      }
      title = title.replace(/\//g, ' - ');
      return {
        title,
        value: option,
        selected: false,
      };
    });
  },

  promptFeature(params: promptFeatureInterface): Promise<string> {
    const {featureChoiceNumberPath, index, options, selectedFeatureChangedFromLastRun} = params;
    return new Promise(resolve => {
      const rememberedInput = Number(fsHelper.readRememberedInput(featureChoiceNumberPath + index)[0]);
      const cursor = !selectedFeatureChangedFromLastRun && rememberedInput >= 0
        ? rememberedInput
        : selectTestsHelper.getMiddle(options);
      console.info('Press esc to exit');
      this.prompt('Select feature:', options, {cursor})
        .on('submit', resolve)
        .on('abort', () => process.exit(0));
    });
  },

  promptTests(params: promptTestsInterface): Promise<string[]> {
    const {promptObjects, selectedFeatureChangedFromLastRun, testChoiceNumberPath} = params;
    console.info(`Choose nothing to go with everything`);
    return new Promise(resolve => {
      const rememberedInput = fsHelper.readRememberedInput(testChoiceNumberPath);
      const cursor = selectedFeatureChangedFromLastRun || rememberedInput.length === 0
        ? selectTestsHelper.getMiddle(promptObjects)
        : rememberedInput[selectTestsHelper.getMiddle(rememberedInput)];
      this.multiPrompt('Select tests to run: ', promptObjects, {cursor})
        .on('submit', items => {
          fsHelper.writeSelectedTests({items, testChoiceNumberPath});
          let chosenItemsValues = this.getSelectedItemsValues(items);
          if (chosenItemsValues.length === 0) {
            chosenItemsValues = this.getItemsValues(items);
          }
          console.info(`Running tests: `);
          selectTestsHelper.logChoices(chosenItemsValues);
          resolve(chosenItemsValues);
        })
        .on('abort', () => process.exit(0));
    });
  },

  getItemsValues(items: promptObjectInterface[]): string[] {
    return items.map(item => item.value);
  },

  getSelectedItemsValues(items: promptObjectInterface[]): string[] {
    return items.filter(item => item.selected)
      .map(item => item.value);
  },

  preselectLastInput(params: preselectLastInputInterface): promptObjectInterface[] {
    const {promptObjects, selectedFeatureChangedFromLastRun, testChoiceNumberPath} = params;
    if (selectedFeatureChangedFromLastRun) {
      return promptObjects;
    }
    const lastInputs = fsHelper.readRememberedInput(testChoiceNumberPath);
    lastInputs.forEach(lastInput => {
      if (promptObjects[lastInput]) {
        promptObjects[lastInput].selected = true;
      }
    });
    return promptObjects;
  },

};


export interface promptObjectInterface {
  title: string;
  value: string;
  selected: boolean;
}


interface getPromptObjectsInterface {
  options: string[];
  nestingLevel?: number;
  specsPath: string;
}


interface preselectLastInputInterface {
  testChoiceNumberPath: string;
  selectedFeatureChangedFromLastRun: boolean;
  promptObjects: promptObjectInterface[];
}


interface promptFeatureInterface {
  options: promptObjectInterface[];
  index: number;
  featureChoiceNumberPath: string;
  selectedFeatureChangedFromLastRun: boolean;
}


interface promptTestsInterface {
  promptObjects: promptObjectInterface[];
  testChoiceNumberPath: string;
  selectedFeatureChangedFromLastRun: boolean;
}
