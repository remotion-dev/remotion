"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useClickPreventionOnDoubleClick = void 0;
const react_1 = require("react");
const cancellable_promise_js_1 = require("./cancellable-promise.js");
const delay_js_1 = require("./delay.js");
const use_cancellable_promises_js_1 = require("./use-cancellable-promises.js");
const useClickPreventionOnDoubleClick = (onClick, onDoubleClick, doubleClickToFullscreen) => {
    const api = (0, use_cancellable_promises_js_1.useCancellablePromises)();
    const handleClick = (0, react_1.useCallback)(async (e) => {
        // UnSupported double click on touch.(mobile)
        if (e instanceof PointerEvent
            ? e.pointerType === 'touch'
            : e.nativeEvent.pointerType === 'touch') {
            onClick(e);
            return;
        }
        api.clearPendingPromises();
        const waitForClick = (0, cancellable_promise_js_1.cancellablePromise)((0, delay_js_1.delay)(200));
        api.appendPendingPromise(waitForClick);
        try {
            await waitForClick.promise;
            api.removePendingPromise(waitForClick);
            onClick(e);
        }
        catch (errorInfo) {
            const info = errorInfo;
            api.removePendingPromise(waitForClick);
            if (!info.isCanceled) {
                throw info.error;
            }
        }
    }, [api, onClick]);
    const handlePointerDown = (0, react_1.useCallback)(() => {
        document.addEventListener('pointerup', (newEvt) => {
            handleClick(newEvt);
        }, {
            once: true,
        });
    }, [handleClick]);
    const handleDoubleClick = (0, react_1.useCallback)(() => {
        api.clearPendingPromises();
        onDoubleClick();
    }, [api, onDoubleClick]);
    const returnValue = (0, react_1.useMemo)(() => {
        if (!doubleClickToFullscreen) {
            return { handlePointerDown: onClick, handleDoubleClick: () => undefined };
        }
        return { handlePointerDown, handleDoubleClick };
    }, [doubleClickToFullscreen, handleDoubleClick, handlePointerDown, onClick]);
    return returnValue;
};
exports.useClickPreventionOnDoubleClick = useClickPreventionOnDoubleClick;
