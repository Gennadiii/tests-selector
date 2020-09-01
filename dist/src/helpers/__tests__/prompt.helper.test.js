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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const events_1 = __importDefault(require("events"));
const fs_helper_1 = require("../fs.helper");
const prompt_helper_1 = require("../prompt.helper");
const selectTests_helper_1 = require("../selectTests.helper");
globals_1.describe(`prompt helper`, () => {
    globals_1.beforeEach(() => globals_1.jest.restoreAllMocks());
    globals_1.describe(`getPromptObjects`, () => {
        globals_1.it(`cuts path depending on nesting level`, () => {
            const removeFirstDirFromPath = globals_1.jest.spyOn(fs_helper_1.fsHelper, 'removeFirstDirFromPath')
                .mockImplementationOnce(() => `dir2/test1`)
                .mockImplementationOnce(() => `test1`)
                .mockImplementationOnce(() => `dir2/test2`)
                .mockImplementationOnce(() => `test2`);
            prompt_helper_1.promptHelper.getPromptObjects({
                specsPath: 'spec',
                options: ['dir1/dir2/test1', 'dir1/dir2/test2'],
                nestingLevel: 2
            });
            globals_1.expect(removeFirstDirFromPath).toHaveBeenCalledTimes(4);
            globals_1.expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(1, 'dir1/dir2/test1');
            globals_1.expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(2, 'dir2/test1');
            globals_1.expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(3, 'dir1/dir2/test2');
            globals_1.expect(removeFirstDirFromPath).toHaveBeenNthCalledWith(4, 'dir2/test2');
        });
        globals_1.it(`removes specPath from options titles`, () => {
            const promptObjects = prompt_helper_1.promptHelper.getPromptObjects({ specsPath: 'dirToSpecs', options: ['dirToSpecs/test'] });
            globals_1.expect(promptObjects[0].title).toEqual(' - test');
            globals_1.expect(promptObjects[0].value).toEqual('dirToSpecs/test');
        });
        globals_1.it(`returns prompt object for feature`, () => {
            const promptObjects = prompt_helper_1.promptHelper.getPromptObjects({ specsPath: '', options: ['option1', 'option2'] });
            globals_1.expect(promptObjects).toEqual([
                {
                    title: 'option1',
                    value: 'option1',
                    selected: false,
                },
                {
                    title: 'option2',
                    value: 'option2',
                    selected: false,
                }
            ]);
        });
    });
    globals_1.describe(`promptFeature`, () => {
        let consoleInfoMock = null;
        let promptMock = null;
        const featureEventEmitter = new events_1.default.EventEmitter();
        globals_1.beforeEach(() => {
            consoleInfoMock = globals_1.jest.spyOn(console, 'info').mockImplementation(() => null);
            promptMock = globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'prompt').mockImplementation(() => featureEventEmitter);
        });
        globals_1.it(`logs instruction`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            const featurePrompt = prompt_helper_1.promptHelper.promptFeature({
                options: [],
                index: 0,
                featureChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            featureEventEmitter.emit('submit', '');
            yield featurePrompt;
            globals_1.expect(consoleInfoMock).toBeCalledWith('Press esc to exit');
            done();
        }));
        globals_1.it(`sets cursor to remembered input if it exists and selected feature didn't change from last time`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            const featurePrompt = prompt_helper_1.promptHelper.promptFeature({
                options: [],
                index: 0,
                featureChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            featureEventEmitter.emit('submit', '');
            yield featurePrompt;
            globals_1.expect(promptMock).toBeCalledWith('Select feature:', [], { cursor: 1 });
            done();
        }));
        globals_1.it(`sets cursor to middle position if no remembered input`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => []);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            const featurePrompt = prompt_helper_1.promptHelper.promptFeature({
                options: [],
                index: 0,
                featureChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            featureEventEmitter.emit('submit', '');
            yield featurePrompt;
            globals_1.expect(promptMock).toBeCalledWith('Select feature:', [], { cursor: 42 });
            done();
        }));
        globals_1.it(`sets cursor to middle position if feature changed from last time`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            const featurePrompt = prompt_helper_1.promptHelper.promptFeature({
                options: [],
                index: 0,
                featureChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: true,
            });
            featureEventEmitter.emit('submit', '');
            yield featurePrompt;
            globals_1.expect(promptMock).toBeCalledWith('Select feature:', [], { cursor: 42 });
            done();
        }));
        globals_1.it(`exits on abort`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            const processMock = globals_1.jest.spyOn(process, 'exit').mockImplementation(() => null);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptFeature({
                options: [],
                index: 0,
                featureChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: true,
            });
            featureEventEmitter.emit('abort');
            globals_1.expect(processMock).toBeCalledWith(0);
            done();
        }));
    });
    globals_1.describe(`promptTests`, () => {
        const testsEventEmitter = new events_1.default.EventEmitter();
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
        globals_1.beforeEach(() => {
            consoleInfoMock = globals_1.jest.spyOn(console, 'info').mockImplementation(() => null);
            promptMock = globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'multiPrompt').mockImplementation(() => testsEventEmitter);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => []);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getSelectedItemsValues').mockImplementation(() => ['test']);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getItemsValues').mockImplementation(() => ['test1', 'test2']);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'writeSelectedTests').mockImplementation(() => null);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'logChoices').mockImplementation(() => null);
        });
        globals_1.it(`logs help info`, () => {
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(consoleInfoMock).toBeCalledWith(`Choose nothing to go with everything`);
        });
        globals_1.it(`sets cursor to middle option if no remembered input`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => []);
            const getMiddleMock = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: true,
            });
            globals_1.expect(getMiddleMock).toBeCalledWith(promptObjects);
            globals_1.expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, { cursor: 42 });
        });
        globals_1.it(`sets cursor to middle option if selected a different feature from last run`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            const getMiddleMock = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 42);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: true,
            });
            globals_1.expect(getMiddleMock).toBeCalledWith(promptObjects);
            globals_1.expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, { cursor: 42 });
        });
        globals_1.it(`sets cursor to remembered input if same feature is chosen`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['18']);
            const getMiddleMock = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 0);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(getMiddleMock).toBeCalledWith(['18']);
            globals_1.expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, { cursor: '18' });
        });
        globals_1.it(`sets cursor to middle of remembered inputs if same feature is chosen`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1', '3', '7']);
            const getMiddleMock = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getMiddle').mockImplementation(() => 1);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(getMiddleMock).toBeCalledWith(['1', '3', '7']);
            globals_1.expect(promptMock).toBeCalledWith('Select tests to run: ', promptObjects, { cursor: '3' });
        });
        globals_1.it(`writes selected tests`, () => {
            const writeSelectedTestsMock = globals_1.jest.spyOn(fs_helper_1.fsHelper, 'writeSelectedTests').mockImplementation(() => null);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({ promptObjects, testChoiceNumberPath: 'path', selectedFeatureChangedFromLastRun: false });
            testsEventEmitter.emit('submit', promptObjects);
            globals_1.expect(writeSelectedTestsMock).toBeCalledWith({ items: promptObjects, testChoiceNumberPath: 'path' });
        });
        globals_1.it(`Logs choices`, () => {
            const logChoicesMock = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'logChoices').mockImplementation(() => null);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({ promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false });
            testsEventEmitter.emit('submit', promptObjects);
            globals_1.expect(consoleInfoMock).toBeCalledWith(`Running tests: `);
            globals_1.expect(logChoicesMock).toBeCalledWith(['test']);
        });
        globals_1.it(`returns selected tests if any`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            const prompt = prompt_helper_1.promptHelper.promptTests({ promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false });
            testsEventEmitter.emit('submit', promptObjects);
            globals_1.expect(yield prompt).toEqual([`test`]);
            done();
        }));
        globals_1.it(`returns all tests if nothing is selected`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getSelectedItemsValues').mockImplementation(() => []);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getItemsValues').mockImplementation(() => ['test1', 'test2']);
            const prompt = prompt_helper_1.promptHelper.promptTests({ promptObjects, testChoiceNumberPath: '', selectedFeatureChangedFromLastRun: false });
            const notSelectedPromptObjects = Object.assign({}, promptObjects);
            notSelectedPromptObjects[1].selected = false;
            testsEventEmitter.emit('submit', notSelectedPromptObjects);
            globals_1.expect(yield prompt).toEqual([`test1`, 'test2']);
            done();
        }));
        globals_1.it(`exits on abort`, () => {
            const processMock = globals_1.jest.spyOn(process, 'exit').mockImplementation(() => null);
            // tslint:disable-next-line
            prompt_helper_1.promptHelper.promptTests({
                promptObjects,
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            testsEventEmitter.emit('abort');
            globals_1.expect(processMock).toBeCalledWith(0);
        });
    });
    globals_1.describe(`getItemsValues`, () => {
        globals_1.it(`marks all prompts as selected`, () => {
            const allPrompts = [
                { title: 'title1', value: 'value1', selected: false },
                { title: 'title2', value: 'value2', selected: true },
            ];
            globals_1.expect(prompt_helper_1.promptHelper.getItemsValues(allPrompts)).toEqual(['value1', 'value2']);
        });
    });
    globals_1.describe(`getSelectedItemsValues`, () => {
        globals_1.it(`returns values of selected prompts`, () => {
            const allPrompts = [
                { title: 'title1', value: 'value1', selected: false },
                { title: 'title2', value: 'value2', selected: true },
                { title: 'title3', value: 'value3', selected: true },
                { title: 'title4', value: 'value4', selected: false },
            ];
            globals_1.expect(prompt_helper_1.promptHelper.getSelectedItemsValues(allPrompts)).toEqual(['value2', 'value3']);
        });
    });
    globals_1.describe(`preselectLastInput`, () => {
        globals_1.it(`returns original prompts if different feature was selected compared to previous run`, () => {
            const promptObjects = [
                { value: 'value', title: 'title', selected: true },
                { value: 'value', title: 'title', selected: false },
            ];
            const result = prompt_helper_1.promptHelper.preselectLastInput({
                testChoiceNumberPath: 'path',
                promptObjects,
                selectedFeatureChangedFromLastRun: true,
            });
            globals_1.expect(result).toEqual(promptObjects);
        });
        globals_1.it(`returns prompt objects with preselected inputs from previous run`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1', '3']);
            const result = prompt_helper_1.promptHelper.preselectLastInput({
                testChoiceNumberPath: 'path',
                promptObjects: [
                    { value: 'test0', title: 'test0', selected: false },
                    { value: 'test1', title: 'test1', selected: false },
                    { value: 'test2', title: 'test2', selected: false },
                    { value: 'test3', title: 'test3', selected: false },
                ],
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(result).toEqual([
                { value: 'test0', title: 'test0', selected: false },
                { value: 'test1', title: 'test1', selected: true },
                { value: 'test2', title: 'test2', selected: false },
                { value: 'test3', title: 'test3', selected: true },
            ]);
        });
        globals_1.it(`returns same prompt objects if nothing was selected previous run`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => []);
            const result = prompt_helper_1.promptHelper.preselectLastInput({
                testChoiceNumberPath: 'path',
                promptObjects: [
                    { value: 'test0', title: 'test0', selected: false },
                    { value: 'test1', title: 'test1', selected: false },
                ],
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(result).toEqual([
                { value: 'test0', title: 'test0', selected: false },
                { value: 'test1', title: 'test1', selected: false },
            ]);
        });
        globals_1.it(`skips preselection if remembered input is out of bound`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['2']);
            const result = prompt_helper_1.promptHelper.preselectLastInput({
                testChoiceNumberPath: 'path',
                promptObjects: [
                    { value: 'test0', title: 'test0', selected: false },
                    { value: 'test1', title: 'test1', selected: false },
                ],
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(result).toEqual([
                { value: 'test0', title: 'test0', selected: false },
                { value: 'test1', title: 'test1', selected: false },
            ]);
        });
    });
});
