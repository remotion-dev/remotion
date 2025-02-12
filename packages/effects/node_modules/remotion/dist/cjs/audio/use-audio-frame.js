"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFrameForVolumeProp = exports.useMediaStartsAt = void 0;
const react_1 = require("react");
const SequenceContext_js_1 = require("../SequenceContext.js");
const index_js_1 = require("../loop/index.js");
const use_current_frame_js_1 = require("../use-current-frame.js");
const useMediaStartsAt = () => {
    var _a;
    const parentSequence = (0, react_1.useContext)(SequenceContext_js_1.SequenceContext);
    const startsAt = Math.min(0, (_a = parentSequence === null || parentSequence === void 0 ? void 0 : parentSequence.relativeFrom) !== null && _a !== void 0 ? _a : 0);
    return startsAt;
};
exports.useMediaStartsAt = useMediaStartsAt;
/**
 * When passing a function as the prop for `volume`,
 * we calculate the way more intuitive value for currentFrame
 */
const useFrameForVolumeProp = (behavior) => {
    const loop = index_js_1.Loop.useLoop();
    const frame = (0, use_current_frame_js_1.useCurrentFrame)();
    const startsAt = (0, exports.useMediaStartsAt)();
    if (behavior === 'repeat' || loop === null) {
        return frame + startsAt;
    }
    return frame + startsAt + loop.durationInFrames * loop.iteration;
};
exports.useFrameForVolumeProp = useFrameForVolumeProp;
