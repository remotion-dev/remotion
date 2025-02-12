"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBufferState = void 0;
const react_1 = require("react");
const buffering_1 = require("./buffering");
const useBufferState = () => {
    const buffer = (0, react_1.useContext)(buffering_1.BufferingContextReact);
    // Allows <Img> tag to be rendered without a context
    // https://github.com/remotion-dev/remotion/issues/4007
    const addBlock = buffer ? buffer.addBlock : null;
    return (0, react_1.useMemo)(() => ({
        delayPlayback: () => {
            if (!addBlock) {
                throw new Error('Tried to enable the buffering state, but a Remotion context was not found. This API can only be called in a component that was passed to the Remotion Player or a <Composition>. Or you might have experienced a version mismatch - run `npx remotion versions` and ensure all packages have the same version. This error is thrown by the buffer state https://remotion.dev/docs/player/buffer-state');
            }
            const { unblock } = addBlock({
                id: String(Math.random()),
            });
            return { unblock };
        },
    }), [addBlock]);
};
exports.useBufferState = useBufferState;
