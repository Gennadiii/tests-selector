"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsHelper = void 0;
const fs_1 = __importDefault(require("fs"));
exports.fsHelper = {
    getFilesRecursively(dir, result = []) {
        const files = fs_1.default.readdirSync(dir);
        files.forEach(file => {
            const name = `${dir}/${file}`;
            if (fs_1.default.statSync(name).isDirectory()) {
                this.getFilesRecursively(name, result);
            }
            else {
                result.push(name);
            }
        });
        return result;
    },
    writeSelectedTests(params) {
        const { items, testChoiceNumberPath } = params;
        const indexes = [];
        items.forEach((item, index) => {
            item.selected && indexes.push(index);
        });
        fs_1.default.writeFileSync(testChoiceNumberPath, indexes.toString());
    },
    isAllContentDirectories(path) {
        return fs_1.default.readdirSync(path).every(subPath => fs_1.default.statSync(`${path}/${subPath}`).isDirectory());
    },
    writeSelectedFeature(params) {
        const { featureChoiceNumberPath, features, index, selectedFeature } = params;
        fs_1.default.writeFileSync(featureChoiceNumberPath + index, features.indexOf(selectedFeature).toString());
    },
    readRememberedInput(path) {
        try {
            const rememberedInput = fs_1.default.readFileSync(path).toString();
            return rememberedInput ? rememberedInput.split(',') : [];
        }
        catch (err) {
            if (err.message.includes('ENOENT')) {
                return [];
            }
            else {
                throw err;
            }
        }
    },
    getFeatures(path) {
        return fs_1.default.readdirSync(path)
            .filter(str => !str.includes('.'));
    },
    removeFirstDirFromPath(path) {
        return path.replace(/^\/?[^\/]*./, '');
    },
};
