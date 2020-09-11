import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import * as fs from "fs";
import {fsHelper} from "../../../src/helpers/fs.helper";
import {promptObjectInterface} from "../../../src/helpers/prompt.helper";


const generatedPath = `${process.cwd()}/.testsSelector/generated${Date.now()}`;
fs.mkdirSync(generatedPath, {recursive: true});

describe(`fs helper`, () => {
  beforeEach(() => jest.restoreAllMocks());

  describe(`getFilesRecursively`, () => {
    it(`gets all files from nested directories`, () => {
      const path = `${generatedPath}/getFilesRecursively`;
      fs.mkdirSync(`${path}`);
      fs.mkdirSync(`${path}/folder1`);
      fs.mkdirSync(`${path}/folder1/folder2`);
      fs.mkdirSync(`${path}/folder1/folder3`);
      fs.mkdirSync(`${path}/folder1/folder4`);
      fs.writeFileSync(`${path}/folder1/file1`, '');
      fs.writeFileSync(`${path}/folder1/file2`, '');
      fs.writeFileSync(`${path}/folder1/folder2/file3`, '');
      fs.writeFileSync(`${path}/folder1/folder3/file4`, '');
      expect(fsHelper.getFilesRecursively(`${path}/folder1`)).toEqual([`${path}/folder1/file1`,
        `${path}/folder1/file2`,
        `${path}/folder1/folder2/file3`,
        `${path}/folder1/folder3/file4`,
      ]);
    });
  });

  describe(`writeSelectedTests`, () => {
    it(`writes file to specified path`, () => {
      const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
      const items: promptObjectInterface[] = [
        {
          title: '1',
          value: '1',
          selected: true,
        },
      ];
      fsHelper.writeSelectedTests({items, testChoiceNumberPath: `somePath`});
      expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '0');
    });
    it(`writes selected tests`, () => {
      const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
      const items: promptObjectInterface[] = [
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
      fsHelper.writeSelectedTests({items, testChoiceNumberPath: 'somePath'});
      expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '0,2,3');
    });
    it(`writes empty string if nothing is selected`, () => {
      const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
      const items: promptObjectInterface[] = [
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
      fsHelper.writeSelectedTests({items, testChoiceNumberPath: 'somePath'});
      expect(writeFileSync).toHaveBeenCalledWith(`somePath`, '');
    });
  });

  describe(`isAllContentDirectories`, () => {
    it(`returns true if all content is directories`, () => {
      const path = `${generatedPath}/isAllContentDirectories1`;
      fs.mkdirSync(path);
      fs.mkdirSync(`${path}/dir1`);
      fs.mkdirSync(`${path}/dir2`);
      expect(fsHelper.isAllContentDirectories(path)).toBeTruthy();
    });
    it(`returns false if not all content is directories`, () => {
      const path = `${generatedPath}/isAllContentDirectories2`;
      fs.mkdirSync(path);
      fs.mkdirSync(`${path}/dir1`);
      fs.writeFileSync(`${path}/file`, '');
      expect(fsHelper.isAllContentDirectories(path)).toBeFalsy();
    });
    it(`checks for directories only at first nesting level`, () => {
      const path = `${generatedPath}/isAllContentDirectories3`;
      fs.mkdirSync(path);
      fs.mkdirSync(`${path}/dir1`);
      fs.writeFileSync(`${path}/dir1/file`, '');
      expect(fsHelper.isAllContentDirectories(path)).toBeTruthy();
    });
  });

  describe(`writeSelectedFeature`, () => {
    it(`writes file with selected feature`, () => {
      const writeFileSync = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => null);
      const features = ['feature1', 'feature2'];
      const selectedFeature = 'feature2';
      const featureChoiceNumberPath = `somePath`;
      const index = 42;
      fsHelper.writeSelectedFeature({featureChoiceNumberPath, index, selectedFeature, features});
      expect(writeFileSync).toHaveBeenCalled();
      expect(writeFileSync).toHaveBeenCalledWith("somePath42", "1");
    });
  });

  describe(`readRememberedInput`, () => {
    it(`returns remembered input if any`, () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => new Buffer('1,2,3'));
      expect(fsHelper.readRememberedInput('somePath')).toEqual(['1', '2', '3']);
    });
    it(`returns empty array if nothing was selected last time`, () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => new Buffer(''));
      expect(fsHelper.readRememberedInput('somePath')).toEqual([]);
    });
    it(`returns empty array for the first time`, () => {
      expect(fsHelper.readRememberedInput('somePath')).toEqual([]);
    });
    it(`throws if error is not 'ENOENT'`, () => {
      jest.spyOn(fs, 'readFileSync').mockImplementation(() => {
        throw new Error('unexpected error');
      });
      expect(() => fsHelper.readRememberedInput('somePath')).toThrow('unexpected error');
    });
  });

  describe(`getFeatures`, () => {
    it(`returns only features`, () => {
      // @ts-ignore
      jest.spyOn(fs, 'readdirSync').mockImplementation(path => [
        `${path}/folder1`,
        `${path}/file.spec.ts`,
      ]);
      expect(fsHelper.getFeatures('somePath')).toEqual([`somePath/folder1`]);
    });
  });

  describe(`removeFirstDirFromPath`, () => {
    it(`removes first dir from path`, () => {
      expect(fsHelper.removeFirstDirFromPath('dir1/dir2/dir3')).toEqual('dir2/dir3');
    });
  });

});
