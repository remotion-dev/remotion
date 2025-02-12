"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEmitVideoFrame = void 0;
const react_1 = require("react");
const useEmitVideoFrame = ({ ref, onVideoFrame, }) => {
    (0, react_1.useEffect)(() => {
        const { current } = ref;
        if (!current) {
            return;
        }
        if (!onVideoFrame) {
            return;
        }
        let handle = 0;
        const callback = () => {
            if (!ref.current) {
                return;
            }
            onVideoFrame(ref.current);
            handle = ref.current.requestVideoFrameCallback(callback);
        };
        callback();
        return () => {
            current.cancelVideoFrameCallback(handle);
        };
    }, [onVideoFrame, ref]);
};
exports.useEmitVideoFrame = useEmitVideoFrame;
