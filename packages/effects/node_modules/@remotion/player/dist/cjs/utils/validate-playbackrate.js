"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlaybackRate = void 0;
const validatePlaybackRate = (playbackRate) => {
    if (playbackRate === undefined) {
        return;
    }
    if (playbackRate > 4) {
        throw new Error(`The highest possible playback rate is 4. You passed: ${playbackRate}`);
    }
    if (playbackRate < -4) {
        throw new Error(`The lowest possible playback rate is -4. You passed: ${playbackRate}`);
    }
    if (playbackRate === 0) {
        throw new Error(`A playback rate of 0 is not supported.`);
    }
};
exports.validatePlaybackRate = validatePlaybackRate;
