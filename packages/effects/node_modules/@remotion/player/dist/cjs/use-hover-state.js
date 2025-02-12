"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHoverState = void 0;
const react_1 = require("react");
const useHoverState = (ref, hideControlsWhenPointerDoesntMove) => {
    const [hovered, setHovered] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const { current } = ref;
        if (!current) {
            return;
        }
        let hoverTimeout;
        const addHoverTimeout = () => {
            if (hideControlsWhenPointerDoesntMove) {
                clearTimeout(hoverTimeout);
                hoverTimeout = setTimeout(() => {
                    setHovered(false);
                }, hideControlsWhenPointerDoesntMove === true
                    ? 3000
                    : hideControlsWhenPointerDoesntMove);
            }
        };
        const onHover = () => {
            setHovered(true);
            addHoverTimeout();
        };
        const onLeave = () => {
            setHovered(false);
            clearTimeout(hoverTimeout);
        };
        const onMove = () => {
            setHovered(true);
            addHoverTimeout();
        };
        current.addEventListener('mouseenter', onHover);
        current.addEventListener('mouseleave', onLeave);
        current.addEventListener('mousemove', onMove);
        return () => {
            current.removeEventListener('mouseenter', onHover);
            current.removeEventListener('mouseleave', onLeave);
            current.removeEventListener('mousemove', onMove);
            clearTimeout(hoverTimeout);
        };
    }, [hideControlsWhenPointerDoesntMove, ref]);
    return hovered;
};
exports.useHoverState = useHoverState;
