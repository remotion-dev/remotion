"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useComponentVisible;
const react_1 = require("react");
// hook to hide a popup/modal when clicked outside
function useComponentVisible(initialIsVisible) {
    const [isComponentVisible, setIsComponentVisible] = (0, react_1.useState)(initialIsVisible);
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setIsComponentVisible(false);
            }
        };
        document.addEventListener('pointerup', handleClickOutside, true);
        return () => {
            document.removeEventListener('pointerup', handleClickOutside, true);
        };
    }, []);
    return { ref, isComponentVisible, setIsComponentVisible };
}
