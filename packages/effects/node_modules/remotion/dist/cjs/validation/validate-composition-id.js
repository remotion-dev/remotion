"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidCompositionErrorMessage = exports.validateCompositionId = exports.isCompositionIdValid = void 0;
const getRegex = () => /^([a-zA-Z0-9-\u4E00-\u9FFF])+$/g;
const isCompositionIdValid = (id) => id.match(getRegex());
exports.isCompositionIdValid = isCompositionIdValid;
const validateCompositionId = (id) => {
    if (!(0, exports.isCompositionIdValid)(id)) {
        throw new Error(`Composition id can only contain a-z, A-Z, 0-9, CJK characters and -. You passed ${id}`);
    }
};
exports.validateCompositionId = validateCompositionId;
exports.invalidCompositionErrorMessage = `Composition ID must match ${String(getRegex())}`;
