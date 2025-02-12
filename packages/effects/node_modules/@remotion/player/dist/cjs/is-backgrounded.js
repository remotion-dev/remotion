"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIsBackgrounded = void 0;
const react_1 = require("react");
const getIsBackgrounded = () => {
    if (typeof document === 'undefined') {
        return false;
    }
    return document.visibilityState === 'hidden';
};
const useIsBackgrounded = () => {
    const isBackgrounded = (0, react_1.useRef)(getIsBackgrounded());
    (0, react_1.useEffect)(() => {
        const onVisibilityChange = () => {
            isBackgrounded.current = getIsBackgrounded();
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, []);
    return isBackgrounded;
};
exports.useIsBackgrounded = useIsBackgrounded;
