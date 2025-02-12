"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidFolderNameErrorMessage = exports.validateFolderName = exports.isFolderNameValid = void 0;
const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
const isFolderNameValid = (name) => name.match(getRegex());
exports.isFolderNameValid = isFolderNameValid;
const validateFolderName = (name) => {
    if (name === undefined || name === null) {
        throw new TypeError('You must pass a name to a <Folder />.');
    }
    if (typeof name !== 'string') {
        throw new TypeError(`The "name" you pass into <Folder /> must be a string. Got: ${typeof name}`);
    }
    if (!(0, exports.isFolderNameValid)(name)) {
        throw new Error(`Folder name can only contain a-z, A-Z, 0-9 and -. You passed ${name}`);
    }
};
exports.validateFolderName = validateFolderName;
exports.invalidFolderNameErrorMessage = `Folder name must match ${String(getRegex())}`;
