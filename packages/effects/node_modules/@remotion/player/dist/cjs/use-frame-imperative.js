"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useFrameImperative = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
const useFrameImperative = () => {
    const frame = remotion_1.Internals.Timeline.useTimelinePosition();
    const frameRef = (0, react_1.useRef)(frame);
    frameRef.current = frame;
    const getCurrentFrame = (0, react_1.useCallback)(() => {
        return frameRef.current;
    }, []);
    return getCurrentFrame;
};
exports.useFrameImperative = useFrameImperative;
