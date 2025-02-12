"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDefaultAndInputProps = void 0;
const validateDefaultAndInputProps = (defaultProps, name, compositionId) => {
    if (!defaultProps) {
        return;
    }
    if (typeof defaultProps !== 'object') {
        throw new Error(`"${name}" must be an object, but you passed a value of type ${typeof defaultProps}`);
    }
    if (Array.isArray(defaultProps)) {
        throw new Error(`"${name}" must be an object, an array was passed ${compositionId ? `for composition "${compositionId}"` : ''}`);
    }
};
exports.validateDefaultAndInputProps = validateDefaultAndInputProps;
