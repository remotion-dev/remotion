"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSeekBar = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const use_hover_state_js_1 = require("./use-hover-state.js");
const use_player_js_1 = require("./use-player.js");
const use_element_size_js_1 = require("./utils/use-element-size.js");
const getFrameFromX = (clientX, durationInFrames, width) => {
    const pos = clientX;
    const frame = Math.round((0, remotion_1.interpolate)(pos, [0, width], [0, durationInFrames - 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    }));
    return frame;
};
const BAR_HEIGHT = 5;
const KNOB_SIZE = 12;
const VERTICAL_PADDING = 4;
const containerStyle = {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    paddingTop: VERTICAL_PADDING,
    paddingBottom: VERTICAL_PADDING,
    boxSizing: 'border-box',
    cursor: 'pointer',
    position: 'relative',
    touchAction: 'none',
};
const barBackground = {
    height: BAR_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: '100%',
    borderRadius: BAR_HEIGHT / 2,
};
const findBodyInWhichDivIsLocated = (div) => {
    let current = div;
    while (current.parentElement) {
        current = current.parentElement;
    }
    return current;
};
const PlayerSeekBar = ({ durationInFrames, onSeekEnd, onSeekStart, inFrame, outFrame }) => {
    var _a;
    const containerRef = (0, react_1.useRef)(null);
    const barHovered = (0, use_hover_state_js_1.useHoverState)(containerRef, false);
    const size = (0, use_element_size_js_1.useElementSize)(containerRef, {
        triggerOnWindowResize: true,
        shouldApplyCssTransforms: true,
    });
    const { seek, play, pause, playing } = (0, use_player_js_1.usePlayer)();
    const frame = remotion_1.Internals.Timeline.useTimelinePosition();
    const [dragging, setDragging] = (0, react_1.useState)({
        dragging: false,
    });
    const width = (_a = size === null || size === void 0 ? void 0 : size.width) !== null && _a !== void 0 ? _a : 0;
    const onPointerDown = (0, react_1.useCallback)((e) => {
        var _a;
        if (e.button !== 0) {
            return;
        }
        const posLeft = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().left;
        const _frame = getFrameFromX(e.clientX - posLeft, durationInFrames, width);
        pause();
        seek(_frame);
        setDragging({
            dragging: true,
            wasPlaying: playing,
        });
        onSeekStart();
    }, [durationInFrames, width, pause, seek, playing, onSeekStart]);
    const onPointerMove = (0, react_1.useCallback)((e) => {
        var _a;
        if (!size) {
            throw new Error('Player has no size');
        }
        if (!dragging.dragging) {
            return;
        }
        const posLeft = (_a = containerRef.current) === null || _a === void 0 ? void 0 : _a.getBoundingClientRect().left;
        const _frame = getFrameFromX(e.clientX - posLeft, durationInFrames, size.width);
        seek(_frame);
    }, [dragging.dragging, durationInFrames, seek, size]);
    const onPointerUp = (0, react_1.useCallback)(() => {
        setDragging({
            dragging: false,
        });
        if (!dragging.dragging) {
            return;
        }
        if (dragging.wasPlaying) {
            play();
        }
        else {
            pause();
        }
        onSeekEnd();
    }, [dragging, onSeekEnd, pause, play]);
    (0, react_1.useEffect)(() => {
        if (!dragging.dragging) {
            return;
        }
        const body = findBodyInWhichDivIsLocated(containerRef.current);
        body.addEventListener('pointermove', onPointerMove);
        body.addEventListener('pointerup', onPointerUp);
        return () => {
            body.removeEventListener('pointermove', onPointerMove);
            body.removeEventListener('pointerup', onPointerUp);
        };
    }, [dragging.dragging, onPointerMove, onPointerUp]);
    const knobStyle = (0, react_1.useMemo)(() => {
        return {
            height: KNOB_SIZE,
            width: KNOB_SIZE,
            borderRadius: KNOB_SIZE / 2,
            position: 'absolute',
            top: VERTICAL_PADDING - KNOB_SIZE / 2 + 5 / 2,
            backgroundColor: 'white',
            left: Math.max(0, (frame / Math.max(1, durationInFrames - 1)) * width - KNOB_SIZE / 2),
            boxShadow: '0 0 2px black',
            opacity: Number(barHovered || dragging.dragging),
        };
    }, [barHovered, dragging.dragging, durationInFrames, frame, width]);
    const fillStyle = (0, react_1.useMemo)(() => {
        return {
            height: BAR_HEIGHT,
            backgroundColor: 'rgba(255, 255, 255, 1)',
            width: ((frame - (inFrame !== null && inFrame !== void 0 ? inFrame : 0)) / (durationInFrames - 1)) * width,
            marginLeft: ((inFrame !== null && inFrame !== void 0 ? inFrame : 0) / (durationInFrames - 1)) * width,
            borderRadius: BAR_HEIGHT / 2,
        };
    }, [durationInFrames, frame, inFrame, width]);
    const active = (0, react_1.useMemo)(() => {
        return {
            height: BAR_HEIGHT,
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            width: (((outFrame !== null && outFrame !== void 0 ? outFrame : durationInFrames - 1) - (inFrame !== null && inFrame !== void 0 ? inFrame : 0)) /
                (durationInFrames - 1)) *
                100 +
                '%',
            marginLeft: ((inFrame !== null && inFrame !== void 0 ? inFrame : 0) / (durationInFrames - 1)) * 100 + '%',
            borderRadius: BAR_HEIGHT / 2,
            position: 'absolute',
        };
    }, [durationInFrames, inFrame, outFrame]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: containerRef, onPointerDown: onPointerDown, style: containerStyle, children: [(0, jsx_runtime_1.jsxs)("div", { style: barBackground, children: [(0, jsx_runtime_1.jsx)("div", { style: active }), (0, jsx_runtime_1.jsx)("div", { style: fillStyle })] }), (0, jsx_runtime_1.jsx)("div", { style: knobStyle })] }));
};
exports.PlayerSeekBar = PlayerSeekBar;
