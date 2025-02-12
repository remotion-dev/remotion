"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetDisplayName = void 0;
const getAssetDisplayName = (filename) => {
    if (/data:|blob:/.test(filename.substring(0, 5))) {
        return 'Data URL';
    }
    const splitted = filename
        .split('/')
        .map((s) => s.split('\\'))
        .flat(1);
    return splitted[splitted.length - 1];
};
exports.getAssetDisplayName = getAssetDisplayName;
