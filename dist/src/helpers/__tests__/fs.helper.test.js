"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fs_1 = __importDefault(require("fs"));
const fs_helper_1 = require("../fs.helper");
const generatedPath = `${process.cwd()}/.testsSelector/generated${Date.now()}`;
fs_1.default.mkdirSync(generatedPath, { recursive: true });
globals_1.describe(`fs helper`, () => {
    globals_1.beforeEach(() => globals_1.jest.restoreAllMocks());
    globals_1.describe(`getFilesRecursively`, () => {
        globals_1.it(`gets all files from nested directories`, () => {
            const path = `${generatedPath}/getFilesRecursively`;
            fs_1.default.mkdirSync(`${path}`);
            fs_1.default.mkdirSync(`${path}/folder1`);
            fs_1.default.mkdirSync(`${path}/folder1/folder2`);
            fs_1.default.mkdirSync(`${path}/folder1/folder3`);
            fs_1.default.mkdirSync(`${path}/folder1/folder4`);
            fs_1.default.writeFileSync(`${path}/folder1/file1`, '');
            fs_1.default.writeFileSync(`${path}/folder1/file2`, '');
            fs_1.default.writeFileSync(`${path}/folder1/folder2/file3`, '');
            fs_1.default.writeFileSync(`${path}/folder1/folder3/file4`, '');
            globals_1.expect(fs_helper_1.fsHelper.getFilesRecursively(`${path}/folder1`)).toEqual([`${path}/folder1/file1`,
                `${path}/folder1/file2`,
                `${path}/folder1/folder2/file3`,
                `${path}/folder1/folder3/file4`,
            ]);
        });
    });
    globals_1.describe(`writeSelectedTests`, () => {
        globals_1.it(`writes file to specified path`, () => {
            const writeFileSync = globals_1.jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation(() => null);
            const items = [
                {
                    title: '1',
                    value: '1',
                    selected: true,
                },
            ];
            fs_helper_1.fsHelper.writeSelectedTests({ items, testChoiceNumberPath: `somePath` });
            globals_1.expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '0');
        });
        globals_1.it(`writes selected tests`, () => {
            const writeFileSync = globals_1.jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation(() => null);
            const items = [
                {
                    title: '1',
                    value: '1',
                    selected: true,
                },
                {
                    title: '2',
                    value: '2',
                    selected: false,
                },
                {
                    title: '3',
                    value: '3',
                    selected: true,
                },
                {
                    title: '4',
                    value: '4',
                    selected: true,
                },
            ];
            fs_helper_1.fsHelper.writeSelectedTests({ items, testChoiceNumberPath: 'somePath' });
            globals_1.expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '0,2,3');
        });
        globals_1.it(`writes empty string if nothing is selected`, () => {
            const writeFileSync = globals_1.jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation(() => null);
            const items = [
                {
                    title: '1',
                    value: '1',
                    selected: false,
                },
                {
                    title: '2',
                    value: '2',
                    selected: false,
                },
                {
                    title: '3',
                    value: '3',
                    selected: false,
                },
                {
                    title: '4',
                    value: '4',
                    selected: false,
                },
            ];
            fs_helper_1.fsHelper.writeSelectedTests({ items, testChoiceNumberPath: 'somePath' });
            globals_1.expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '');
        });
    });
    globals_1.describe(`isAllContentDirectories`, () => {
        globals_1.it(`returns true if all content is directories`, () => {
            const path = `${generatedPath}/isAllContentDirectories1`;
            fs_1.default.mkdirSync(path);
            fs_1.default.mkdirSync(`${path}/dir1`);
            fs_1.default.mkdirSync(`${path}/dir2`);
            globals_1.expect(fs_helper_1.fsHelper.isAllContentDirectories(path)).toBeTruthy();
        });
        globals_1.it(`returns false if not all content is directories`, () => {
            const path = `${generatedPath}/isAllContentDirectories2`;
            fs_1.default.mkdirSync(path);
            fs_1.default.mkdirSync(`${path}/dir1`);
            fs_1.default.writeFileSync(`${path}/file`, '');
            globals_1.expect(fs_helper_1.fsHelper.isAllContentDirectories(path)).toBeFalsy();
        });
        globals_1.it(`checks for directories only at first nesting level`, () => {
            const path = `${generatedPath}/isAllContentDirectories3`;
            fs_1.default.mkdirSync(path);
            fs_1.default.mkdirSync(`${path}/dir1`);
            fs_1.default.writeFileSync(`${path}/dir1/file`, '');
            globals_1.expect(fs_helper_1.fsHelper.isAllContentDirectories(path)).toBeTruthy();
        });
    });
    globals_1.describe(`writeSelectedFeature`, () => {
        globals_1.it(`writes file with selected feature`, () => {
            const writeFileSync = globals_1.jest.spyOn(fs_1.default, 'writeFileSync').mockImplementation(() => null);
            const features = ['feature1', 'feature2'];
            const selectedFeature = 'feature2';
            const featureChoiceNumberPath = `somePath`;
            const index = 42;
            fs_helper_1.fsHelper.writeSelectedFeature({ featureChoiceNumberPath, index, selectedFeature, features });
            globals_1.expect(writeFileSync).toHaveBeenCalled();
            globals_1.expect(writeFileSync).toHaveBeenCalledWith("somePath42", "1");
        });
    });
    globals_1.describe(`readRememberedInput`, () => {
        globals_1.it(`returns remembered input if any`, () => {
            globals_1.jest.spyOn(fs_1.default, 'readFileSync').mockImplementation(() => new Buffer('1,2,3'));
            globals_1.expect(fs_helper_1.fsHelper.readRememberedInput('somePath')).toEqual(['1', '2', '3']);
        });
        globals_1.it(`returns empty array if nothing was selected last time`, () => {
            globals_1.jest.spyOn(fs_1.default, 'readFileSync').mockImplementation(() => new Buffer(''));
            globals_1.expect(fs_helper_1.fsHelper.readRememberedInput('somePath')).toEqual([]);
        });
        globals_1.it(`returns empty array for the first time`, () => {
            globals_1.expect(fs_helper_1.fsHelper.readRememberedInput('somePath')).toEqual([]);
        });
        globals_1.it(`throws if error is not 'ENOENT'`, () => {
            globals_1.jest.spyOn(fs_1.default, 'readFileSync').mockImplementation(() => {
                throw new Error('unexpected error');
            });
            globals_1.expect(() => fs_helper_1.fsHelper.readRememberedInput('somePath')).toThrow('unexpected error');
        });
    });
    globals_1.describe(`getFeatures`, () => {
        globals_1.it(`returns only features`, () => {
            // @ts-ignore
            globals_1.jest.spyOn(fs_1.default, 'readdirSync').mockImplementation(path => [
                `${path}/folder1`,
                `${path}/file.spec.ts`,
            ]);
            globals_1.expect(fs_helper_1.fsHelper.getFeatures('somePath')).toEqual([`somePath/folder1`]);
        });
    });
    globals_1.describe(`removeFirstDirFromPath`, () => {
        globals_1.it(`removes first dir from path`, () => {
            globals_1.expect(fs_helper_1.fsHelper.removeFirstDirFromPath('dir1/dir2/dir3')).toEqual('dir2/dir3');
        });
    });
});
