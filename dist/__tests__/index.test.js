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
const fs_1 = __importDefault(require("fs"));
const index_1 = __importDefault(require("../index"));
const prompt_helper_1 = require("../src/helpers/prompt.helper");
const selectTests_helper_1 = require("../src/helpers/selectTests.helper");
const config = {
    tempDataPath: `${process.cwd()}/.testsSelector`,
    specsPath: `${process.cwd()}/.testsSelector/specs`,
    selectedTestsFileName: `selectedTests.generated`,
    featureChoiceNumberFileName: `featureChoiceNumber.indexHelper`,
    testChoiceNumberFileName: `testChoiceNumber.indexHelper`,
};
const testsSelector = new index_1.default(config);
const featureEventEmitter = new events_1.default.EventEmitter();
const testsEventEmitter = new events_1.default.EventEmitter();
fs_1.default.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature1`, { recursive: true });
fs_1.default.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2`, { recursive: true });
fs_1.default.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1`, { recursive: true });
fs_1.default.mkdirSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature2`, { recursive: true });
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature1/test1.spec.ts`, '');
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature1/test2.spec.ts`, '');
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test3.spec.ts`, '');
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test4.spec.ts`, '');
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature1/test5.spec.ts`, '');
fs_1.default.writeFileSync(`${process.cwd()}/.testsSelector/specs/feature2/subFeature2/test6.spec.ts`, '');
const specs = {
    feature1: [
        `${process.cwd()}/specs/feature1/test1.spec.ts`,
        `${process.cwd()}/specs/feature1/test2.spec.ts`,
    ],
    feature2: {
        subFeature1: [
            `${process.cwd()}/specs/feature2/subFeature1/test3.spec.ts`,
            `${process.cwd()}/specs/feature2/subFeature1/test4.spec.ts`,
            `${process.cwd()}/specs/feature2/subFeature1/test5.spec.ts`,
        ],
        subFeature2: [
            `${process.cwd()}/specs/feature2/subFeature2/test6.spec.ts`,
        ],
    },
};
globals_1.describe(`index`, () => {
    globals_1.describe(`default parameters`, () => {
        globals_1.it(`checks default parameters`, () => {
            const tempDataPath = `${process.cwd()}/.testsSelector`;
            globals_1.expect(new index_1.default().config).toEqual({
                tempDataPath,
                selectedTestsFilePath: `${tempDataPath}/selectedTests.generated`,
                specIdentifiers: ['spec'],
                specsPath: `${process.cwd()}/specs`,
                maxFilesInDir: 10,
                testChoiceNumberPath: `${tempDataPath}/testChoiceNumber.indexHelper`,
                featureChoiceNumberPath: `${tempDataPath}/featureChoiceNumber.indexHelper`,
            });
        });
    });
    globals_1.describe(`selectTests`, () => {
        globals_1.beforeEach(() => {
            globals_1.jest.restoreAllMocks();
            globals_1.jest.spyOn(selectTests_helper_1.selectTestsHelper, 'selectTests').mockImplementation(() => __awaiter(void 0, void 0, void 0, function* () { return []; }));
            globals_1.jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation(() => null);
        });
        globals_1.it(`creates temp dir`, () => {
            const existsSyncMock = globals_1.jest.spyOn(fs_1.default, 'existsSync').mockImplementation(() => false);
            const writeFileSyncMock = globals_1.jest.spyOn(fs_1.default, 'mkdirSync').mockImplementation(() => null);
            // tslint:disable-next-line
            testsSelector.selectTests();
            globals_1.expect(existsSyncMock).toBeCalledWith(config.tempDataPath);
            globals_1.expect(writeFileSyncMock).toBeCalledWith(config.tempDataPath, { recursive: true });
        });
        globals_1.it(`doesn't create temp dir if it already exists`, () => {
            const existsSyncMock = globals_1.jest.spyOn(fs_1.default, 'existsSync').mockImplementation(() => true);
            const writeFileSyncMock = globals_1.jest.spyOn(fs_1.default, 'mkdirSync').mockImplementation(() => null);
            // tslint:disable-next-line
            testsSelector.selectTests();
            globals_1.expect(existsSyncMock).toBeCalledWith(config.tempDataPath);
            globals_1.expect(writeFileSyncMock).not.toBeCalled();
        });
    });
});
globals_1.describe(`e2e`, () => {
    globals_1.beforeEach(() => {
        globals_1.jest.restoreAllMocks();
        globals_1.jest.spyOn(console, 'info').mockImplementation(() => null);
        globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'prompt').mockImplementation(() => featureEventEmitter);
        globals_1.jest.spyOn(prompt_helper_1.promptHelper, 'multiPrompt').mockImplementation(() => testsEventEmitter);
    });
    globals_1.it(`selects test`, (done) => __awaiter(void 0, void 0, void 0, function* () {
        const selection = testsSelector.selectTests();
        yield simulateChoices({
            feature: 'feature1', tests: [
                { selected: false, value: specs.feature1[0] },
                { selected: true, value: specs.feature1[1] },
            ]
        });
        globals_1.expect(yield selection).toEqual([specs.feature1[1]]);
        globals_1.expect(removeSlashes(fs_1.default.readFileSync(`${config.tempDataPath}/${config.selectedTestsFileName}`).toString()))
            .toEqual(`["${removeSlashes(specs.feature1[1])}"]`);
        done();
    }));
    globals_1.it(`selects multiple tests from different feature`, (done) => __awaiter(void 0, void 0, void 0, function* () {
        fs_1.default.writeFileSync(`${config.tempDataPath}/${config.featureChoiceNumberFileName + 0}`, '2');
        fs_1.default.writeFileSync(`${config.tempDataPath}/${config.testChoiceNumberFileName}`, '0');
        const selection = testsSelector.selectTests();
        yield simulateChoices({
            feature: 'feature2', subFeature: 'subFeature1', tests: [
                { selected: false, value: specs.feature2.subFeature1[0] },
                { selected: true, value: specs.feature2.subFeature1[1] },
                { selected: true, value: specs.feature2.subFeature1[2] },
            ]
        });
        globals_1.expect(yield selection).toEqual([specs.feature2.subFeature1[1], specs.feature2.subFeature1[2]]);
        globals_1.expect(removeSlashes(fs_1.default.readFileSync(`${config.tempDataPath}/${config.selectedTestsFileName}`).toString()))
            .toEqual(`["${removeSlashes(specs.feature2.subFeature1[1])}","${removeSlashes(specs.feature2.subFeature1[2])}"]`);
        done();
    }));
});
function simulateChoices(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { feature, subFeature, tests } = params;
        featureEventEmitter.emit('submit', feature);
        yield sleep(1);
        if (subFeature) {
            featureEventEmitter.emit('submit', subFeature);
            yield sleep(1);
        }
        testsEventEmitter.emit('submit', tests);
    });
}
function sleep(timeout) {
    return new Promise(resolve => setTimeout(resolve, timeout));
}
function removeSlashes(str) {
    return str.replace(/\\|\//g, '');
}
function createDir(path) {
    fs_1.default.existsSync(path) || fs_1.default.mkdirSync(path, { recursive: true });
}
