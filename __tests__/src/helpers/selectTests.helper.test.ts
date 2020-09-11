import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {fsHelper} from "../../../src/helpers/fs.helper";
import {promptHelper} from "../../../src/helpers/prompt.helper";
import {selectTestsHelper} from "../../../src/helpers/selectTests.helper";


describe(`select tests helper`, () => {
  beforeEach(() => jest.restoreAllMocks());


  describe(`selectTests`, () => {
    beforeEach(() => {
      jest.spyOn(console, 'info').mockImplementation(() => null);
      jest.spyOn(selectTestsHelper, 'getTestsDirPath')
        .mockImplementation(async () => ({testsDirPath: 'testDir', nestingLevel: 42}));
      jest.spyOn(fsHelper, 'getFilesRecursively').mockImplementation(() => ['file']);
      jest.spyOn(selectTestsHelper, 'isSpec').mockImplementation(() => false);
      jest.spyOn(promptHelper, 'getPromptObjects').mockImplementation(() => []);
      jest.spyOn(promptHelper, 'preselectLastInput').mockImplementation(() => []);
    });

    it(`filters specs by identifier`, async done => {
      const promptTestsMock = jest.spyOn(promptHelper, 'promptTests').mockImplementation(async () => []);
      jest.spyOn(selectTestsHelper, 'getTestsDirPath')
        .mockImplementation(async () => ({testsDirPath: 'testDir', nestingLevel: 42}));
      jest.spyOn(fsHelper, 'getFilesRecursively').mockImplementation(
        () => ['file.test.js', 'file.spec.js', 'file.Test.js', 'file.jest.js']);
      const getPromptObjectsMock = jest.spyOn(promptHelper, 'getPromptObjects')
        .mockImplementation(() => [{selected: true, value: '1', title: '1'}]);
      jest.spyOn(selectTestsHelper, 'isSpec')
        .mockImplementationOnce(() => true)
        .mockImplementationOnce(() => true)
        .mockImplementationOnce(() => false)
        .mockImplementationOnce(() => false);
      const preselectLastInputMock = jest.spyOn(promptHelper, 'preselectLastInput')
        .mockImplementation(() => [{selected: true, value: '2', title: '2'}]);
      await selectTestsHelper.selectTests({
        specsPath: '',
        maxFilesInDir: 1,
        testChoiceNumberPath: '',
        featureChoiceNumberPath: '',
        specIdentifiers: ['test', 'spec'],
      });
      expect(preselectLastInputMock).toBeCalledWith({
        promptObjects: [{selected: true, value: '1', title: '1'}],
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      expect(getPromptObjectsMock).toBeCalledWith({
        options: ['file.test.js', 'file.spec.js'],
        nestingLevel: 42, specsPath: ''
      });
      expect(promptTestsMock).toBeCalledWith({
        promptObjects: [{selected: true, value: '2', title: '2'}],
        testChoiceNumberPath: '',
        selectedFeatureChangedFromLastRun: false,
      });
      done();
    });

    it(`returns selected tests`, async done => {
      jest.spyOn(promptHelper, 'promptTests').mockImplementation(async () => ['1', '2', '3']);
      const result = await selectTestsHelper.selectTests({
        specsPath: '',
        maxFilesInDir: 1,
        testChoiceNumberPath: '',
        featureChoiceNumberPath: '',
        specIdentifiers: [],
      });
      expect(result).toEqual(['1', '2', '3']);
      done();
    });

    it(`logs error`, async done => {
      const logMock = jest.spyOn(console, 'error').mockImplementation(() => null);
      try {
        await selectTestsHelper.selectTests({
          specsPath: '',
          maxFilesInDir: 1,
          testChoiceNumberPath: '',
          featureChoiceNumberPath: '',
          specIdentifiers: []
        });
      } catch (err) {
        expect(logMock).toBeCalledWith(`Can't start tests: ${err}`);
      }
      expect(logMock).toBeCalled();
      done();
    });

    it(`throws error`, async done => {
      jest.spyOn(console, 'error').mockImplementation(() => null);
      await expect(selectTestsHelper.selectTests({
        specsPath: '',
        maxFilesInDir: 1,
        testChoiceNumberPath: '',
        featureChoiceNumberPath: '',
        specIdentifiers: []
      })).rejects.toEqual(new TypeError(`stream.setRawMode is not a function`));
      done();
    });
  });


  describe(`getTestsDirPath`, () => {
    beforeEach(() => {
      jest.spyOn(fsHelper, 'getFeatures').mockImplementation(() => ['feature1', 'feature2']);
      jest.spyOn(promptHelper, 'getPromptObjects').mockImplementation(() => [{
        selected: false,
        title: 'feature',
        value: 'feature',
      }]);
      jest.spyOn(promptHelper, 'promptFeature').mockImplementation(async () => 'feature2');
      jest.spyOn(selectTestsHelper, 'hasSelectedFeatureChangedFromLastInput').mockImplementation(() => true);
      jest.spyOn(fsHelper, 'getFilesRecursively').mockImplementation(() => ['1']);
      jest.spyOn(fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
      jest.spyOn(fsHelper, 'writeSelectedFeature').mockImplementation(() => null);
    });

    it(`writes selected feature`, async done => {
      jest.spyOn(fsHelper, 'getFeatures').mockImplementation(() => ['feature1', 'feature2']);
      jest.spyOn(promptHelper, 'promptFeature').mockImplementation(async () => 'feature2');
      const writeSelectedFeatureMock = jest.spyOn(fsHelper, 'writeSelectedFeature').mockImplementation(() => null);
      await selectTestsHelper.getTestsDirPath({
        specsPath: 'specsPath',
        index: 42,
        maxFilesInDir: 1,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
        pathToSelectedFeature: 'pathToSelectedFeature',
      });
      expect(writeSelectedFeatureMock).toBeCalledWith({
        features: ['feature1', 'feature2'],
        selectedFeature: 'feature2',
        index: 42,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
      });
      done();
    });

    it("returns tesDirPath and nesting level if files number is less than maxFilesInDir", async done => {
      jest.spyOn(fsHelper, 'getFilesRecursively').mockImplementation(() => ['1', '2']);
      jest.spyOn(fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
      jest.spyOn(promptHelper, 'promptFeature').mockImplementation(async () => 'feature');
      const result = await selectTestsHelper.getTestsDirPath({
        specsPath: 'specsPath',
        index: 42,
        maxFilesInDir: 2,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
        pathToSelectedFeature: 'pathToSelectedFeature',
      });
      expect(result).toEqual({nestingLevel: 43, testsDirPath: 'pathToSelectedFeature/feature'});
      done();
    });

    it("returns tesDirPath and nesting level if all content are not directories", async done => {
      jest.spyOn(fsHelper, 'getFilesRecursively').mockImplementation(() => ['1', '2']);
      jest.spyOn(fsHelper, 'isAllContentDirectories').mockImplementation(() => true);
      jest.spyOn(promptHelper, 'promptFeature').mockImplementation(async () => 'feature');
      const result = await selectTestsHelper.getTestsDirPath({
        specsPath: 'specsPath',
        index: 42,
        maxFilesInDir: 2,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
        pathToSelectedFeature: 'pathToSelectedFeature',
      });
      expect(result).toEqual({nestingLevel: 43, testsDirPath: 'pathToSelectedFeature/feature'});
      done();
    });

    it("returns nested tesDirPath and nesting level " +
      "if files number is more than maxFilesInDir and all content are directories", async done => {
      jest.spyOn(fsHelper, 'getFilesRecursively')
        .mockImplementationOnce(() => ['1', '2'])
        .mockImplementationOnce(() => ['3']);
      jest.spyOn(fsHelper, 'isAllContentDirectories')
        .mockImplementationOnce(() => true)
        .mockImplementationOnce(() => false);
      jest.spyOn(promptHelper, 'promptFeature')
        .mockImplementationOnce(async () => 'feature')
        .mockImplementationOnce(async () => 'nestedFeature');
      jest.spyOn(selectTestsHelper, 'hasSelectedFeatureChangedFromLastInput').mockImplementation(() => false);
      const getTestsDirPathSpy = jest.spyOn(selectTestsHelper, 'getTestsDirPath');
      const result = await selectTestsHelper.getTestsDirPath({
        specsPath: 'specsPath',
        index: 42,
        maxFilesInDir: 1,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
        pathToSelectedFeature: 'pathToSelectedFeature',
      });
      expect(getTestsDirPathSpy).toHaveBeenNthCalledWith(2, {
        specsPath: 'specsPath',
        index: 43,
        maxFilesInDir: 1,
        featureChoiceNumberPath: 'featureChoiceNumberPath',
        pathToSelectedFeature: 'pathToSelectedFeature/feature',
        selectedFeatureChangedFromLastRun: false,
      });
      expect(result).toEqual({nestingLevel: 44, testsDirPath: 'pathToSelectedFeature/feature/nestedFeature'});
      done();
    });
  });


  describe(`logChoices`, () => {
    it(`logs choices`, () => {
      const logMock = jest.spyOn(console, 'info').mockImplementation(() => null);
      selectTestsHelper.logChoices(['1', '2']);
      expect(logMock).toBeCalledTimes(4);
      expect(logMock).toHaveBeenNthCalledWith(1, '');
      expect(logMock).toHaveBeenNthCalledWith(2, '1');
      expect(logMock).toHaveBeenNthCalledWith(3, '2');
      expect(logMock).toHaveBeenNthCalledWith(4, '');
    });
  });


  describe(`hasSelectedFeatureChangedFromLastInput`, () => {
    it(`reads remembered input from correct file`, () => {
      const readRememberedInputMock = jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
        selectedFeature: '', index: 42, features: [], featureChoiceNumberPath: 'path'
      });
      expect(readRememberedInputMock).toBeCalledWith(`path42`);
    });

    it(`returns true if selected feature index differs from remembered input`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['0']);
      const result = selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
        selectedFeature: 'f1', index: 42, features: ['f0', 'f1'], featureChoiceNumberPath: ''
      });
      expect(result).toBeTruthy();
    });

    it(`returns false if selected feature index is the same with remembered input`, () => {
      jest.spyOn(fsHelper, 'readRememberedInput').mockImplementation(() => ['1']);
      const result = selectTestsHelper.hasSelectedFeatureChangedFromLastInput({
        selectedFeature: 'f1', index: 42, features: ['f0', 'f1'], featureChoiceNumberPath: ''
      });
      expect(result).toBeFalsy();
    });
  });


  describe(`isSpec`, () => {
    const specIdentifiers = [`spec`, 'test'];

    it(`returns true if prompt object title has spec identifier`, () => {
      const testPath1 = `path/test1.spec.ts`;
      const testPath2 = `path/test1.test.ts`;
      expect(selectTestsHelper.isSpec({testPath: testPath1, specIdentifiers})).toBeTruthy();
      expect(selectTestsHelper.isSpec({testPath: testPath2, specIdentifiers})).toBeTruthy();
    });

    it(`returns false if prompt object title doesn't have spec identifier`, () => {
      const testPath = `path/test1.Spec.ts`;
      expect(selectTestsHelper.isSpec({testPath, specIdentifiers})).toBeFalsy();
    });
  });


  describe(`getMiddle`, () => {
    it(`gets middle of even array`, () => {
      expect(selectTestsHelper.getMiddle(['1', '2', '3', '4'])).toEqual(2);
    });

    it(`gets middle of odd array`, () => {
      expect(selectTestsHelper.getMiddle(['1', '2', '3'])).toEqual(1);
    });
  });

});
