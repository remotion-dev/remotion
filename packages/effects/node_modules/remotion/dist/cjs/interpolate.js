"use strict";
// Taken from https://github.com/facebook/react-native/blob/0b9ea60b4fee8cacc36e7160e31b91fc114dbc0d/Libraries/Animated/src/nodes/AnimatedInterpolation.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.interpolate = interpolate;
function interpolateFunction(input, inputRange, outputRange, options) {
    const { extrapolateLeft, extrapolateRight, easing } = options;
    let result = input;
    const [inputMin, inputMax] = inputRange;
    const [outputMin, outputMax] = outputRange;
    if (result < inputMin) {
        if (extrapolateLeft === 'identity') {
            return result;
        }
        if (extrapolateLeft === 'clamp') {
            result = inputMin;
        }
        else if (extrapolateLeft === 'wrap') {
            const range = inputMax - inputMin;
            result = ((((result - inputMin) % range) + range) % range) + inputMin;
        }
        else if (extrapolateLeft === 'extend') {
            // Noop
        }
    }
    if (result > inputMax) {
        if (extrapolateRight === 'identity') {
            return result;
        }
        if (extrapolateRight === 'clamp') {
            result = inputMax;
        }
        else if (extrapolateRight === 'wrap') {
            const range = inputMax - inputMin;
            result = ((((result - inputMin) % range) + range) % range) + inputMin;
        }
        else if (extrapolateRight === 'extend') {
            // Noop
        }
    }
    if (outputMin === outputMax) {
        return outputMin;
    }
    // Input Range
    result = (result - inputMin) / (inputMax - inputMin);
    // Easing
    result = easing(result);
    // Output Range
    result = result * (outputMax - outputMin) + outputMin;
    return result;
}
function findRange(input, inputRange) {
    let i;
    for (i = 1; i < inputRange.length - 1; ++i) {
        if (inputRange[i] >= input) {
            break;
        }
    }
    return i - 1;
}
function checkValidInputRange(arr) {
    for (let i = 1; i < arr.length; ++i) {
        if (!(arr[i] > arr[i - 1])) {
            throw new Error(`inputRange must be strictly monotonically increasing but got [${arr.join(',')}]`);
        }
    }
}
function checkInfiniteRange(name, arr) {
    if (arr.length < 2) {
        throw new Error(name + ' must have at least 2 elements');
    }
    for (const element of arr) {
        if (typeof element !== 'number') {
            throw new Error(`${name} must contain only numbers`);
        }
        if (!Number.isFinite(element)) {
            throw new Error(`${name} must contain only finite numbers, but got [${arr.join(',')}]`);
        }
    }
}
/*
 * @description Allows you to map a range of values to another using a concise syntax.
 * @see [Documentation](https://remotion.dev/docs/interpolate)
 */
function interpolate(input, inputRange, outputRange, options) {
    var _a;
    if (typeof input === 'undefined') {
        throw new Error('input can not be undefined');
    }
    if (typeof inputRange === 'undefined') {
        throw new Error('inputRange can not be undefined');
    }
    if (typeof outputRange === 'undefined') {
        throw new Error('outputRange can not be undefined');
    }
    if (inputRange.length !== outputRange.length) {
        throw new Error('inputRange (' +
            inputRange.length +
            ') and outputRange (' +
            outputRange.length +
            ') must have the same length');
    }
    checkInfiniteRange('inputRange', inputRange);
    checkInfiniteRange('outputRange', outputRange);
    checkValidInputRange(inputRange);
    const easing = (_a = options === null || options === void 0 ? void 0 : options.easing) !== null && _a !== void 0 ? _a : ((num) => num);
    let extrapolateLeft = 'extend';
    if ((options === null || options === void 0 ? void 0 : options.extrapolateLeft) !== undefined) {
        extrapolateLeft = options.extrapolateLeft;
    }
    let extrapolateRight = 'extend';
    if ((options === null || options === void 0 ? void 0 : options.extrapolateRight) !== undefined) {
        extrapolateRight = options.extrapolateRight;
    }
    if (typeof input !== 'number') {
        throw new TypeError('Cannot interpolate an input which is not a number');
    }
    const range = findRange(input, inputRange);
    return interpolateFunction(input, [inputRange[range], inputRange[range + 1]], [outputRange[range], outputRange[range + 1]], {
        easing,
        extrapolateLeft,
        extrapolateRight,
    });
}
