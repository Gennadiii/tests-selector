import fs from "fs";
import {promptObjectInterface} from "./prompt.helper";


export const fsHelper = {

  getFilesRecursively(dir: string, result: string[] = []): string[] {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const name = `${dir}/${file}`;
      if (fs.statSync(name).isDirectory()) {
        this.getFilesRecursively(name, result);
      } else {
        result.push(name);
      }
    });
    return result;
  },

  writeSelectedTests(params: writeSelectedTestsInterface): void {
    const {items, testChoiceNumberPath} = params;
    const indexes = [];
    items.forEach((item, index) => {
      item.selected && indexes.push(index);
    });
    fs.writeFileSync(testChoiceNumberPath, indexes.toString());
  },

  isAllContentDirectories(path: string): boolean {
    return fs.readdirSync(path).every(subPath => fs.statSync(`${path}/${subPath}`).isDirectory());
  },

  writeSelectedFeature(params: writeFeatureInputInterface): void {
    const {featureChoiceNumberPath, features, index, selectedFeature} = params;
    fs.writeFileSync(featureChoiceNumberPath + index, features.indexOf(selectedFeature).toString());
  },

  readRememberedInput(path: string): string[] {
    try {
      const rememberedInput = fs.readFileSync(path).toString();
      return rememberedInput ? rememberedInput.split(',') : [];
    } catch (err) {
      if (err.message.includes('ENOENT')) {
        return [];
      } else {
        throw err;
      }
    }
  },

  getFeatures(path: string): string[] {
    return fs.readdirSync(path)
      .filter(str => fs.statSync(`${path}/${str}`).isDirectory());
  },

  removeFirstDirFromPath(path: string): string {
    return path.replace(/^\/?[^\/]*./, '');
  },

};


interface writeSelectedTestsInterface {
  items: promptObjectInterface[];
  testChoiceNumberPath: string;
}

interface writeFeatureInputInterface {
  features: string[];
  selectedFeature: string;
  index: number;
  featureChoiceNumberPath: string;
}
