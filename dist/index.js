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
const fs_1 = __importDefault(require("fs"));
const selectTests_helper_1 = require("./src/helpers/selectTests.helper");
class TestsSelector {
    constructor(params = {}) {
        // @ts-ignore
        this.config = {};
        const { tempDataPath = `${process.cwd()}/.testsSelector`, selectedTestsFileName = `selectedTests.generated`, specsPath = `${process.cwd()}/specs`, specIdentifiers = ['spec'], maxFilesInDir = 10, testChoiceNumberFileName = `testChoiceNumber.indexHelper`, featureChoiceNumberFileName = `featureChoiceNumber.indexHelper`, } = params;
        this.config.tempDataPath = tempDataPath;
        this.config.selectedTestsFilePath = `${tempDataPath}/${selectedTestsFileName}`;
        this.config.specIdentifiers = specIdentifiers;
        this.config.specsPath = specsPath;
        this.config.maxFilesInDir = maxFilesInDir;
        this.config.testChoiceNumberPath = `${tempDataPath}/${testChoiceNumberFileName}`;
        this.config.featureChoiceNumberPath = `${tempDataPath}/${featureChoiceNumberFileName}`;
    }
    selectTests() {
        return __awaiter(this, void 0, void 0, function* () {
            fs_1.default.existsSync(this.config.tempDataPath) || fs_1.default.mkdirSync(this.config.tempDataPath, { recursive: true });
            const tests = yield selectTests_helper_1.selectTestsHelper.selectTests({
                testChoiceNumberPath: this.config.testChoiceNumberPath,
                featureChoiceNumberPath: this.config.featureChoiceNumberPath,
                specsPath: this.config.specsPath,
                specIdentifiers: this.config.specIdentifiers,
                maxFilesInDir: this.config.maxFilesInDir,
            });
            fs_1.default.writeFileSync(this.config.selectedTestsFilePath, JSON.stringify(tests));
            return tests;
        });
    }
}
exports.default = TestsSelector;
