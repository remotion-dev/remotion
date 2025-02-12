"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePlayerSize = void 0;
const calculatePlayerSize = ({ currentSize, width, height, compositionWidth, compositionHeight, }) => {
    if (width !== undefined && height === undefined) {
        return {
            aspectRatio: [compositionWidth, compositionHeight].join('/'),
        };
    }
    // Opposite: If has height specified, evaluate the height and specify a default width.
    if (height !== undefined && width === undefined) {
        return {
            // Aspect ratio CSS prop will work
            aspectRatio: [compositionWidth, compositionHeight].join('/'),
        };
    }
    if (!currentSize) {
        return {
            width: compositionWidth,
            height: compositionHeight,
        };
    }
    return {
        width: compositionWidth,
        height: compositionHeight,
    };
};
exports.calculatePlayerSize = calculatePlayerSize;
