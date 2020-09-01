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
const globals_1 = require("@jest/globals");
const fs_helper_1 = require("../fs.helper");
const prompt_helper_1 = require("../prompt.helper");
const selectTests_helper_1 = require("../selectTests.helper");
globals_1.describe(`select tests helper`, () => {
    globals_1.beforeEach(() => globals_1.jest.restoreAllMocks());
    globals_1.describe(`selectTests`, () => {
        globals_1.beforeEach(() => {
            globals_1.jest.spyOn(console, 'info').mockImplementation(() => null);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getTestsDirPath')
                .mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return ({ testsDirPath: 'testDir', nestingLevel: 42 }); }));
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively').mockImplementation(() => ['file']);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'isSpec').mockImplementation(() => false);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getPromptObjects').mockImplementation(() => []);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'preselectLastInput').mockImplementation(() => []);
        });
        globals_1.it(`filters specs by identifier`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            const promptTestsMock = globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptTests').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return []; }));
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getTestsDirPath')
                .mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return ({ testsDirPath: 'testDir', nestingLevel: 42 }); }));
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively').mockImplementation(() => ['file.test.js', 'file.spec.js', 'file.Test.js', 'file.jest.js']);
            const getPromptObjectsMock = globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getPromptObjects')
                .mockImplementation(() => [{ selected: true, value: '1', title: '1' }]);
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'isSpec')
                .mockImplementationOnce(() => true)
                .mockImplementationOnce(() => true)
                .mockImplementationOnce(() => false)
                .mockImplementationOnce(() => false);
            const preselectLastInputMock = globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'preselectLastInput')
                .mockImplementation(() => [{ selected: true, value: '2', title: '2' }]);
            yield selectTests_helper_1.selectTestsHelper.selectTests({
                specsPath: '',
                maxFilesInDir: 1,
                testChoiceNumberPath: '',
                featureChoiceNumberPath: '',
                specIdentifiers: ['test', 'spec'],
            });
            globals_1.expect(preselectLastInputMock).toBeCalledWith({
                promptObjects: [{ selected: true, value: '1', title: '1' }],
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(getPromptObjectsMock).toBeCalledWith({
                options: ['file.test.js', 'file.spec.js'],
                nestingLevel: 42, specsPath: ''
            });
            globals_1.expect(promptTestsMock).toBeCalledWith({
                promptObjects: [{ selected: true, value: '2', title: '2' }],
                testChoiceNumberPath: '',
                selectedFeatureChangedFromLastRun: false,
            });
            done();
        }));
        globals_1.it(`returns selected tests`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptTests').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return ['1', '2', '3']; }));
            const result = yield selectTests_helper_1.selectTestsHelper.selectTests({
                specsPath: '',
                maxFilesInDir: 1,
                testChoiceNumberPath: '',
                featureChoiceNumberPath: '',
                specIdentifiers: [],
            });
            globals_1.expect(result).toEqual(['1', '2', '3']);
            done();
        }));
        globals_1.it(`logs error`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            const logMock = globals_1.jest.spyOn(console, 'error').mockImplementation(() => null);
            try {
                yield selectTests_helper_1.selectTestsHelper.selectTests({
                    specsPath: '',
                    maxFilesInDir: 1,
                    testChoiceNumberPath: '',
                    featureChoiceNumberPath: '',
                    specIdentifiers: []
                });
            }
            catch (err) {
                globals_1.expect(logMock).toBeCalledWith(`Can't start tests: ${err}`);
            }
            globals_1.expect(logMock).toBeCalled();
            done();
        }));
        globals_1.it(`throws error`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(console, 'error').mockImplementation(() => null);
            yield globals_1.expect(selectTests_helper_1.selectTestsHelper.selectTests({
                specsPath: '',
                maxFilesInDir: 1,
                testChoiceNumberPath: '',
                featureChoiceNumberPath: '',
                specIdentifiers: []
            })).rejects.toEqual(new TypeError(`stream.setRawMode is not a function`));
            done();
        }));
    });
    globals_1.describe(`getTestsDirPath`, () => {
        globals_1.beforeEach(() => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFeatures').mockImplementation(() => ['feature1', 'feature2']);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'getPromptObjects').mockImplementation(() => [{
                    selected: false,
                    title: 'feature',
                    value: 'feature',
                }]);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptFeature').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return 'feature2'; }));
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'hasSelectedFeatureChangedFromLastInput').mockImplementation(() => true);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively').mockImplementation(() => ['1']);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'writeSelectedFeature').mockImplementation(() => null);
        });
        globals_1.it(`writes selected feature`, (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFeatures').mockImplementation(() => ['feature1', 'feature2']);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptFeature').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return 'feature2'; }));
            const writeSelectedFeatureMock = globals_1.jest.spyOn(fs_helper_1.fsHelper, 'writeSelectedFeature').mockImplementation(() => null);
            yield selectTests_helper_1.selectTestsHelper.getTestsDirPath({
                specsPath: 'specsPath',
                index: 42,
                maxFilesInDir: 1,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
                pathToSelectedFeature: 'pathToSelectedFeature',
            });
            globals_1.expect(writeSelectedFeatureMock).toBeCalledWith({
                features: ['feature1', 'feature2'],
                selectedFeature: 'feature2',
                index: 42,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
            });
            done();
        }));
        globals_1.it("returns tesDirPath and nesting level if files number is less than maxFilesInDir", (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively').mockImplementation(() => ['1', '2']);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptFeature').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return 'feature'; }));
            const result = yield selectTests_helper_1.selectTestsHelper.getTestsDirPath({
                specsPath: 'specsPath',
                index: 42,
                maxFilesInDir: 2,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
                pathToSelectedFeature: 'pathToSelectedFeature',
            });
            globals_1.expect(result).toEqual({ nestingLevel: 43, testsDirPath: 'pathToSelectedFeature/feature' });
            done();
        }));
        globals_1.it("returns tesDirPath and nesting level if all content are not directories", (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively').mockImplementation(() => ['1', '2']);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptFeature').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return 'feature'; }));
            const result = yield selectTests_helper_1.selectTestsHelper.getTestsDirPath({
                specsPath: 'specsPath',
                index: 42,
                maxFilesInDir: 2,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
                pathToSelectedFeature: 'pathToSelectedFeature',
            });
            globals_1.expect(result).toEqual({ nestingLevel: 43, testsDirPath: 'pathToSelectedFeature/feature' });
            done();
        }));
        globals_1.it("returns nested tesDirPath and nesting level " +
            "if files number is more than maxFilesInDir and all content are directories", (done) => __awaiter(void 0, void 0, void 0, function* () {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'getFilesRecursively')
                .mockImplementationOnce(() => ['1', '2'])
                .mockImplementationOnce(() => ['3']);
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'isAllContentDirectories')
                .mockImplementationOnce(() => true)
                .mockImplementationOnce(() => false);
            globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'promptFeature')
                .mockImplementationOnce(() => __awaiter(void 0, void 0, void 0, function* () { return 'feature'; }))
                .mockImplementationOnce(() => __awaiter(void 0, void 0, void 0, function* () { return 'nestedFeature'; }));
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'hasSelectedFeatureChangedFromLastInput').mockImplementation(() => false);
            const getTestsDirPathSpy = globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'getTestsDirPath');
            const result = yield selectTests_helper_1.selectTestsHelper.getTestsDirPath({
                specsPath: 'specsPath',
                index: 42,
                maxFilesInDir: 1,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
                pathToSelectedFeature: 'pathToSelectedFeature',
            });
            globals_1.expect(getTestsDirPathSpy).toHaveBeenNthCalledWith(2, {
                specsPath: 'specsPath',
                index: 43,
                maxFilesInDir: 1,
                featureChoiceNumberPath: 'featureChoiceNumberPath',
                pathToSelectedFeature: 'pathToSelectedFeature/feature',
                selectedFeatureChangedFromLastRun: false,
            });
            globals_1.expect(result).toEqual({ nestingLevel: 44, testsDirPath: 'pathToSelectedFeature/feature/nestedFeature' });
            done();
        }));
    });
    globals_1.describe(`logChoices`, () => {
        globals_1.it(`logs choices`, () => {
            const logMock = globals_1.jest.spyOn(console, 'info').mockImplementation(() => null);
            selectTests_helper_1.selectTestsHelper.logChoices(['1', '2']);
            globals_1.expect(logMock).toBeCalledTimes(4);
            globals_1.expect(logMock).toHaveBeenNthCalledWith(1, '');
            globals_1.expect(logMock).toHaveBeenNthCalledWith(2, '1');
            globals_1.expect(logMock).toHaveBeenNthCalledWith(3, '2');
            globals_1.expect(logMock).toHaveBeenNthCalledWith(4, '');
        });
    });
    globals_1.describe(`hasSelectedFeatureChangedFromLastInput`, () => {
        globals_1.it(`reads remembered input from correct file`, () => {
            const readRememberedInputMock = globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            selectTests_helper_1.selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
                selectedFeature: '', index: 42, features: [], featureChoiceNumberPath: 'path'
            });
            globals_1.expect(readRememberedInputMock).toBeCalledWith(`path42`);
        });
        globals_1.it(`returns true if selected feature index differs from remembered input`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['0']);
            const result = selectTests_helper_1.selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
                selectedFeature: 'f1', index: 42, features: ['f0', 'f1'], featureChoiceNumberPath: ''
            });
            globals_1.expect(result).toBeTruthy();
        });
        globals_1.it(`returns false if selected feature index is the same with remembered input`, () => {
            globals_1.jest.spyOn(fs_helper_1.fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
            const result = selectTests_helper_1.selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
                selectedFeature: 'f1', index: 42, features: ['f0', 'f1'], featureChoiceNumberPath: ''
            });
            globals_1.expect(result).toBeFalsy();
        });
    });
    globals_1.describe(`isSpec`, () => {
        const specIdentifiers = [`spec`, 'test'];
        globals_1.it(`returns true if prompt object title has spec identifier`, () => {
            const testPath1 = `path/test1.spec.ts`;
            const testPath2 = `path/test1.test.ts`;
            globals_1.expect(selectTests_helper_1.selectTestsHelper.isSpec({ testPath: testPath1, specIdentifiers })).toBeTruthy();
            globals_1.expect(selectTests_helper_1.selectTestsHelper.isSpec({ testPath: testPath2, specIdentifiers })).toBeTruthy();
        });
        globals_1.it(`returns false if prompt object title doesn't have spec identifier`, () => {
            const testPath = `path/test1.Spec.ts`;
            globals_1.expect(selectTests_helper_1.selectTestsHelper.isSpec({ testPath, specIdentifiers })).toBeFalsy();
        });
    });
    globals_1.describe(`getMiddle`, () => {
        globals_1.it(`gets middle of even array`, () => {
            globals_1.expect(selectTests_helper_1.selectTestsHelper.getMiddle(['1', '2', '3', '4'])).toEqual(2);
        });
        globals_1.it(`gets middle of odd array`, () => {
            globals_1.expect(selectTests_helper_1.selectTestsHelper.getMiddle(['1', '2', '3'])).toEqual(1);
        });
    });
});
