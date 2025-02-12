"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCancellablePromises = void 0;
const react_1 = require("react");
const useCancellablePromises = () => {
    const pendingPromises = (0, react_1.useRef)([]);
    const appendPendingPromise = (0, react_1.useCallback)((promise) => {
        pendingPromises.current = [...pendingPromises.current, promise];
    }, []);
    const removePendingPromise = (0, react_1.useCallback)((promise) => {
        pendingPromises.current = pendingPromises.current.filter((p) => p !== promise);
    }, []);
    const clearPendingPromises = (0, react_1.useCallback)(() => pendingPromises.current.map((p) => p.cancel()), []);
    const api = (0, react_1.useMemo)(() => ({
        appendPendingPromise,
        removePendingPromise,
        clearPendingPromises,
    }), [appendPendingPromise, clearPendingPromises, removePendingPromise]);
    return api;
};
exports.useCancellablePromises = useCancellablePromises;
