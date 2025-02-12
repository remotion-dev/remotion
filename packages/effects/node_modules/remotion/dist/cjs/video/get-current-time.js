"use strict";
// Calculate the `.currentTime` of a video or audio element
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMediaTime = exports.getExpectedMediaFrameUncorrected = void 0;
const interpolate_js_1 = require("../interpolate.js");
const getExpectedMediaFrameUncorrected = ({ frame, playbackRate, startFrom, }) => {
    return (0, interpolate_js_1.interpolate)(frame, [-1, startFrom, startFrom + 1], [-1, startFrom, startFrom + playbackRate]);
};
exports.getExpectedMediaFrameUncorrected = getExpectedMediaFrameUncorrected;
const getMediaTime = ({ fps, frame, playbackRate, startFrom, }) => {
    const expectedFrame = (0, exports.getExpectedMediaFrameUncorrected)({
        frame,
        playbackRate,
        startFrom,
    });
    const msPerFrame = 1000 / fps;
    return (expectedFrame * msPerFrame) / 1000;
};
exports.getMediaTime = getMediaTime;
