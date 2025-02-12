"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBufferStateEmitter = void 0;
const react_1 = require("react");
const remotion_1 = require("remotion");
const useBufferStateEmitter = (emitter) => {
    const bufferManager = (0, react_1.useContext)(remotion_1.Internals.BufferingContextReact);
    if (!bufferManager) {
        throw new Error('BufferingContextReact not found');
    }
    (0, react_1.useEffect)(() => {
        const clear1 = bufferManager.listenForBuffering(() => {
            bufferManager.buffering.current = true;
            emitter.dispatchWaiting({});
        });
        const clear2 = bufferManager.listenForResume(() => {
            bufferManager.buffering.current = false;
            emitter.dispatchResume({});
        });
        return () => {
            clear1.remove();
            clear2.remove();
        };
    }, [bufferManager, emitter]);
};
exports.useBufferStateEmitter = useBufferStateEmitter;
