"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerEmitterProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const emitter_context_js_1 = require("./emitter-context.js");
const event_emitter_js_1 = require("./event-emitter.js");
const use_buffer_state_emitter_js_1 = require("./use-buffer-state-emitter.js");
const PlayerEmitterProvider = ({ children, currentPlaybackRate }) => {
    const [emitter] = (0, react_1.useState)(() => new event_emitter_js_1.PlayerEmitter());
    const bufferManager = (0, react_1.useContext)(remotion_1.Internals.BufferingContextReact);
    if (!bufferManager) {
        throw new Error('BufferingContextReact not found');
    }
    (0, react_1.useEffect)(() => {
        if (currentPlaybackRate) {
            emitter.dispatchRateChange(currentPlaybackRate);
        }
    }, [emitter, currentPlaybackRate]);
    (0, use_buffer_state_emitter_js_1.useBufferStateEmitter)(emitter);
    return ((0, jsx_runtime_1.jsx)(emitter_context_js_1.PlayerEventEmitterContext.Provider, { value: emitter, children: children }));
};
exports.PlayerEmitterProvider = PlayerEmitterProvider;
