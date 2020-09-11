import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import * as events from "events";
import {fsHelper} from "../../../src/helpers/fs.helper";
import {promptHelper, promptObjectInterface} from "../../../src/helpers/prompt.helper";
import {selectTestsHelper} from "../../../src/helpers/selectTests.helper";


describe(`prompt helper`, () => {
  beforeEach(() => jest.restoreAllMocks());

  describe(`getPromptObjects`, () => {
    it(`cuts path depending on nesting level`, () => {
      const removeFirstDirFromPath = jest.spyOn(fsHelper, 'removeFirstDirFromPath')
        .mockImplementationOnce(() => `dir2/test1`)
        .mockImplementationOnce(() => `test1`)
        .mockImplementationOnce(() => `dir2/test2`)
        .mockImplementationOnce(() => `test2`);
      promptHelper.getPromptObjects({
        specsPath: 'spec',
        options: ['dir1/dir2/test1', 'dir1/dir2/test2'],
        nestingLevel: 2
      });
      expect(removeFirstDirFromPath).toHaveBeenCalledTimes(4);
      expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(1, 'dir1/dir2/test1');
      expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(2, 'dir2/test1');
      expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(3, 'dir1/dir2/test2');
      expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(4, 'dir2/test2');
    });

    it(`removes specPath from options titles`, () => {
      const promptObjects = promptHelper.getPromptObjects({specsPath: 'dirToSpecs', options: ['dirToSpecs/test']});
      expect(promptObjects[0].title).toEqual(' - test');
      expect(promptObjects[0].value).toEqual('dirToSpecs/test');
    });

    it(`returns prompt object for feature`, () => {
      const promptObjects = promptHelper.getPromptObjects({specsPath: '', options: ['option1', 'option2']});
      expect(promptObjects).toEqual([
        {
          title: 'option1',
          value: 'option1',
          selected: false,
        },
        {
          title: 'option2',
          value: 'option2',
          selected: false,
        }]);
    });
  });


  describe(`promptFeature`, () => {
    let consoleInfoMock = null;
    let promptMock = null;
    const featureEventEmitter = new events.EventEmitter();
    beforeEach(() => {
      consoleInfoMock = jest.spyOn(console, 'info').mockImplementation(() => null);
      promptMock = jest.spyOn(promptHelper, 'prompt').mockImplementation(() => featureEventEmitter);
    });

    it(`logs instruction`, async done => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      const featurePrompt = promptHelper.promptFeature({
        options: [],
        index: 0,
        featureChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      featureEventEmitter.emit('submit', '');
      await featurePrompt;
      expect(consoleInfoMock).toBeCalledWith('Press esc to exit');
      done();
    });

    it(`sets cursor to remembered input if it exists and selected feature didn't change from last time`, async done => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      const featurePrompt = promptHelper.promptFeature({
        options: [],
        index: 0,
        featureChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      featureEventEmitter.emit('submit', '');
      await featurePrompt;
      expect(promptMock).toBeCalledWith('Select feature:', [], {cursor: 1});
      done();
    });

    it(`sets cursor to middle position if no remembered input`, async done => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => []);
      jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      const featurePrompt = promptHelper.promptFeature({
        options: [],
        index: 0,
        featureChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      featureEventEmitter.emit('submit', '');
      await featurePrompt;
      expect(promptMock).toBeCalledWith('Select feature:', [], {cursor: 42});
      done();
    });

    it(`sets cursor to middle position if feature changed from last time`, async done => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      const featurePrompt = promptHelper.promptFeature({
        options: [],
        index: 0,
        featureChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: true,
      });
      featureEventEmitter.emit('submit', '');
      await featurePrompt;
      expect(promptMock).toBeCalledWith('Select feature:', [], {cursor: 42});
      done();
    });

    it(`exits on abort`, async done => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      const processMock = jest.spyOn(process, 'exit').mockImplementation(() => null);
      // tslint:disable-next-line
      promptHelper.promptFeature({
        options: [],
        index: 0,
        featureChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: true,
      });
      featureEventEmitter.emit('abort');
      expect(processMock).toBeCalledWith(0);
      done();
    });
  });


  describe(`promptTests`, () => {
    const testsEventEmitter = new events.EventEmitter();
    const promptObjects = [
      {
        selected: false,
        title: 'test1',
        value: 'test1,'
      },
      {
        selected: true,
        title: 'test2',
        value: 'test2,'
      },
    ];
    let consoleInfoMock = null;
    let promptMock = null;
    beforeEach(() => {
      consoleInfoMock = jest.spyOn(console, 'info').mockImplementation(() => null);
      promptMock = jest.spyOn(promptHelper, 'multiPrompt').mockImplementation(() => testsEventEmitter);
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => []);
      jest.spyOn(promptHelper, 'getSelectedItemsValues').mockImplementation(() => ['test']);
      jest.spyOn(promptHelper, 'getItemsValues').mockImplementation(() => ['test1', 'test2']);
      jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      jest.spyOn(fsHelper, 'writeSelectedTests').mockImplementation(() => null);
      jest.spyOn(selectTestsHelper, 'logChoices').mockImplementation(() => null);
    });

    it(`logs help info`, () => {
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      expect(consoleInfoMock).toBeCalledWith(`Choose nothing to go with everything`);
    });

    it(`sets cursor to middle option if no remembered input`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => []);
      const getMiddleMock = jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: true,
      });
      expect(getMiddleMock).toBeCalledWith(promptObjects);
      expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, {cursor: 42});
    });

    it(`sets cursor to middle option if selected a different feature from last run`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      const getMiddleMock = jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: true,
      });
      expect(getMiddleMock).toBeCalledWith(promptObjects);
      expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, {cursor: 42});
    });

    it(`sets cursor to remembered input if same feature is chosen`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['18']);
      const getMiddleMock = jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 0);
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      expect(getMiddleMock).toBeCalledWith(['18']);
      expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, {cursor: '18'});
    });

    it(`sets cursor to middle of remembered inputs if same feature is chosen`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1', '3', '7']);
      const getMiddleMock = jest.spyOn(selectTestsHelper, 'getMiddle').mockImplementation(() => 1);
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      expect(getMiddleMock).toBeCalledWith(['1', '3', '7']);
      expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, {cursor: '3'});
    });

    it(`writes selected tests`, () => {
      const writeSelectedTestsMock = jest.spyOn(fsHelper, 'writeSelectedTests').mockImplementation(() => null);
      // tslint:disable-next-line
      promptHelper.promptTests(
        {promptObjects, testChoiceNumberPath: 'path', selectedFeatureChangedFromLastRun: false});
      testsEventEmitter.emit('submit', promptObjects);
      expect(writeSelectedTestsMock).toBeCalledWith({items: promptObjects, testChoiceNumberPath: 'path'});
    });

    it(`Logs choices`, () => {
      const logChoicesMock = jest.spyOn(selectTestsHelper, 'logChoices').mockImplementation(() => null);
      // tslint:disable-next-line
      promptHelper.promptTests(
        {promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false});
      testsEventEmitter.emit('submit', promptObjects);
      expect(consoleInfoMock).toBeCalledWith(`Running tests: `);
      expect(logChoicesMock).toBeCalledWith(['test']);
    });

    it(`returns selected tests if any`, async done => {
      const prompt = promptHelper.promptTests(
        {promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false});
      testsEventEmitter.emit('submit', promptObjects);
      expect(await prompt).toEqual([`test`]);
      done();
    });

    it(`returns all tests if nothing is selected`, async done => {
      jest.spyOn(promptHelper, 'getSelectedItemsValues').mockImplementation(() => []);
      jest.spyOn(promptHelper, 'getItemsValues').mockImplementation(() => ['test1', 'test2']);
      const prompt = promptHelper.promptTests(
        {promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false});
      const notSelectedPromptObjects = {...promptObjects};
      notSelectedPromptObjects[1].selected = false;
      testsEventEmitter.emit('submit', notSelectedPromptObjects);
      expect(await prompt).toEqual([`test1`, 'test2']);
      done();
    });

    it(`exits on abort`, () => {
      const processMock = jest.spyOn(process, 'exit').mockImplementation(() => null);
      // tslint:disable-next-line
      promptHelper.promptTests({
        promptObjects,
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      testsEventEmitter.emit('abort');
      expect(processMock).toBeCalledWith(0);
    });
  });


  describe(`getItemsValues`, () => {
    it(`marks all prompts as selected`, () => {
      const allPrompts: promptObjectInterface[] = [
        {title: 'title1', value: 'value1', selected: false},
        {title: 'title2', value: 'value2', selected: true},
      ];
      expect(promptHelper.getItemsValues(allPrompts)).toEqual(['value1', 'value2']);
    });
  });


  describe(`getSelectedItemsValues`, () => {
    it(`returns values of selected prompts`, () => {
      const allPrompts: promptObjectInterface[] = [
        {title: 'title1', value: 'value1', selected: false},
        {title: 'title2', value: 'value2', selected: true},
        {title: 'title3', value: 'value3', selected: true},
        {title: 'title4', value: 'value4', selected: false},
      ];
      expect(promptHelper.getSelectedItemsValues(allPrompts)).toEqual(['value2', 'value3']);
    });
  });


  describe(`preselectLastInput`, () => {
    it(`returns original prompts if different feature was selected compared to previous run`, () => {
      const promptObjects = [
        {value: 'value', title: 'title', selected: true},
        {value: 'value', title: 'title', selected: false},
      ];
      const result = promptHelper.preselectLastInput({
        testChoiceNumberPath: 'path',
        promptObjects,
        selectedFeatureChangedFromLastRun: true,
      });
      expect(result).toEqual(promptObjects);
    });

    it(`returns prompt objects with preselected inputs from previous run`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1', '3']);
      const result = promptHelper.preselectLastInput({
        testChoiceNumberPath: 'path',
        promptObjects: [
          {value: 'test0', title: 'test0', selected: false},
          {value: 'test1', title: 'test1', selected: false},
          {value: 'test2', title: 'test2', selected: false},
          {value: 'test3', title: 'test3', selected: false},
        ],
        selectedFeatureChangedFromLastRun: false,
      });
      expect(result).toEqual([
        {value: 'test0', title: 'test0', selected: false},
        {value: 'test1', title: 'test1', selected: true},
        {value: 'test2', title: 'test2', selected: false},
        {value: 'test3', title: 'test3', selected: true},
      ]);
    });

    it(`returns same prompt objects if nothing was selected previous run`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => []);
      const result = promptHelper.preselectLastInput({
        testChoiceNumberPath: 'path',
        promptObjects: [
          {value: 'test0', title: 'test0', selected: false},
          {value: 'test1', title: 'test1', selected: false},
        ],
        selectedFeatureChangedFromLastRun: false,
      });
      expect(result).toEqual([
        {value: 'test0', title: 'test0', selected: false},
        {value: 'test1', title: 'test1', selected: false},
      ]);
    });

    it(`skips preselection if remembered input is out of bound`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['2']);
      const result = promptHelper.preselectLastInput({
        testChoiceNumberPath: 'path',
        promptObjects: [
          {value: 'test0', title: 'test0', selected: false},
          {value: 'test1', title: 'test1', selected: false},
        ],
        selectedFeatureChangedFromLastRun: false,
      });
      expect(result).toEqual([
        {value: 'test0', title: 'test0', selected: false},
        {value: 'test1', title: 'test1', selected: false},
      ]);
    });
  });

});
