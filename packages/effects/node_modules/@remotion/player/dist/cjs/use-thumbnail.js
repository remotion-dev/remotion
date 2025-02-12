"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useThumbnail = void 0;
const react_1 = require("react");
const emitter_context_js_1 = require("./emitter-context.js");
const useThumbnail = () => {
    const emitter = (0, react_1.useContext)(emitter_context_js_1.ThumbnailEmitterContext);
    if (!emitter) {
        throw new TypeError('Expected Player event emitter context');
    }
    const returnValue = (0, react_1.useMemo)(() => {
        return {
            emitter,
        };
    }, [emitter]);
    return returnValue;
};
exports.useThumbnail = useThumbnail;
