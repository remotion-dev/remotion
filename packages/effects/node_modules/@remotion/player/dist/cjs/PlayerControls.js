"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Controls = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const DefaultPlayPauseButton_js_1 = require("./DefaultPlayPauseButton.js");
const MediaVolumeSlider_js_1 = require("./MediaVolumeSlider.js");
const PlaybackrateControl_js_1 = require("./PlaybackrateControl.js");
const PlayerSeekBar_js_1 = require("./PlayerSeekBar.js");
const PlayerTimeLabel_js_1 = require("./PlayerTimeLabel.js");
const icons_js_1 = require("./icons.js");
const use_hover_state_js_1 = require("./use-hover-state.js");
const use_video_controls_resize_js_1 = require("./use-video-controls-resize.js");
const gradientSteps = [
    0, 0.013, 0.049, 0.104, 0.175, 0.259, 0.352, 0.45, 0.55, 0.648, 0.741, 0.825,
    0.896, 0.951, 0.987,
];
const gradientOpacities = [
    0, 8.1, 15.5, 22.5, 29, 35.3, 41.2, 47.1, 52.9, 58.8, 64.7, 71, 77.5, 84.5,
    91.9,
];
const globalGradientOpacity = 1 / 0.7;
const containerStyle = {
    boxSizing: 'border-box',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingTop: 40,
    paddingBottom: 10,
    backgroundImage: `linear-gradient(to bottom,${gradientSteps
        .map((g, i) => {
        return `hsla(0, 0%, 0%, ${g}) ${gradientOpacities[i] * globalGradientOpacity}%`;
    })
        .join(', ')}, hsl(0, 0%, 0%) 100%)`,
    backgroundSize: 'auto 145px',
    display: 'flex',
    paddingRight: use_video_controls_resize_js_1.X_PADDING,
    paddingLeft: use_video_controls_resize_js_1.X_PADDING,
    flexDirection: 'column',
    transition: 'opacity 0.3s',
};
const controlsRow = {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    userSelect: 'none',
    WebkitUserSelect: 'none',
};
const leftPartStyle = {
    display: 'flex',
    flexDirection: 'row',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    alignItems: 'center',
};
const xSpacer = {
    width: 12,
};
const ySpacer = {
    height: 8,
};
const flex1 = {
    flex: 1,
};
const fullscreen = {};
const Controls = ({ durationInFrames, isFullscreen, fps, showVolumeControls, onFullscreenButtonClick, allowFullscreen, onExitFullscreenButtonClick, spaceKeyToPlayOrPause, onSeekEnd, onSeekStart, inFrame, outFrame, initiallyShowControls, canvasSize, renderPlayPauseButton, renderFullscreenButton, alwaysShowControls, showPlaybackRateControl, containerRef, buffering, hideControlsWhenPointerDoesntMove, onPointerDown, onDoubleClick, renderMuteButton, renderVolumeSlider, playing, toggle, }) => {
    var _a, _b;
    const playButtonRef = (0, react_1.useRef)(null);
    const [supportsFullscreen, setSupportsFullscreen] = (0, react_1.useState)(false);
    const hovered = (0, use_hover_state_js_1.useHoverState)(containerRef, hideControlsWhenPointerDoesntMove);
    const { maxTimeLabelWidth, displayVerticalVolumeSlider } = (0, use_video_controls_resize_js_1.useVideoControlsResize)({
        allowFullscreen,
        playerWidth: (_a = canvasSize === null || canvasSize === void 0 ? void 0 : canvasSize.width) !== null && _a !== void 0 ? _a : 0,
    });
    const [shouldShowInitially, setInitiallyShowControls] = (0, react_1.useState)(() => {
        if (typeof initiallyShowControls === 'boolean') {
            return initiallyShowControls;
        }
        if (typeof initiallyShowControls === 'number') {
            if (initiallyShowControls % 1 !== 0) {
                throw new Error('initiallyShowControls must be an integer or a boolean');
            }
            if (Number.isNaN(initiallyShowControls)) {
                throw new Error('initiallyShowControls must not be NaN');
            }
            if (!Number.isFinite(initiallyShowControls)) {
                throw new Error('initiallyShowControls must be finite');
            }
            if (initiallyShowControls <= 0) {
                throw new Error('initiallyShowControls must be a positive integer');
            }
            return initiallyShowControls;
        }
        throw new TypeError('initiallyShowControls must be a number or a boolean');
    });
    const containerCss = (0, react_1.useMemo)(() => {
        // Hide if playing and mouse outside
        const shouldShow = hovered || !playing || shouldShowInitially || alwaysShowControls;
        return {
            ...containerStyle,
            opacity: Number(shouldShow),
        };
    }, [hovered, shouldShowInitially, playing, alwaysShowControls]);
    (0, react_1.useEffect)(() => {
        if (playButtonRef.current && spaceKeyToPlayOrPause) {
            // This switches focus to play button when player.playing flag changes
            playButtonRef.current.focus({
                preventScroll: true,
            });
        }
    }, [playing, spaceKeyToPlayOrPause]);
    (0, react_1.useEffect)(() => {
        var _a;
        // Must be handled client-side to avoid SSR hydration mismatch
        setSupportsFullscreen((_a = (typeof document !== 'undefined' &&
            (document.fullscreenEnabled ||
                // @ts-expect-error Types not defined
                document.webkitFullscreenEnabled))) !== null && _a !== void 0 ? _a : false);
    }, []);
    (0, react_1.useEffect)(() => {
        if (shouldShowInitially === false) {
            return;
        }
        const time = shouldShowInitially === true ? 2000 : shouldShowInitially;
        const timeout = setTimeout(() => {
            setInitiallyShowControls(false);
        }, time);
        return () => {
            clearInterval(timeout);
        };
    }, [shouldShowInitially]);
    const playbackRates = (0, react_1.useMemo)(() => {
        if (showPlaybackRateControl === true) {
            return [0.5, 0.8, 1, 1.2, 1.5, 1.8, 2, 2.5, 3];
        }
        if (Array.isArray(showPlaybackRateControl)) {
            for (const rate of showPlaybackRateControl) {
                if (typeof rate !== 'number') {
                    throw new Error('Every item in showPlaybackRateControl must be a number');
                }
                if (rate <= 0) {
                    throw new Error('Every item in showPlaybackRateControl must be positive');
                }
            }
            return showPlaybackRateControl;
        }
        return null;
    }, [showPlaybackRateControl]);
    const ref = (0, react_1.useRef)(null);
    const flexRef = (0, react_1.useRef)(null);
    const onPointerDownIfContainer = (0, react_1.useCallback)((e) => {
        // Only if pressing the container
        if (e.target === ref.current || e.target === flexRef.current) {
            onPointerDown === null || onPointerDown === void 0 ? void 0 : onPointerDown(e);
        }
    }, [onPointerDown]);
    const onDoubleClickIfContainer = (0, react_1.useCallback)((e) => {
        // Only if pressing the container
        if (e.target === ref.current || e.target === flexRef.current) {
            onDoubleClick === null || onDoubleClick === void 0 ? void 0 : onDoubleClick(e);
        }
    }, [onDoubleClick]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: ref, style: containerCss, onPointerDown: onPointerDownIfContainer, onDoubleClick: onDoubleClickIfContainer, children: [(0, jsx_runtime_1.jsxs)("div", { ref: flexRef, style: controlsRow, children: [(0, jsx_runtime_1.jsxs)("div", { style: leftPartStyle, children: [(0, jsx_runtime_1.jsx)("button", { ref: playButtonRef, type: "button", style: PlaybackrateControl_js_1.playerButtonStyle, onClick: toggle, "aria-label": playing ? 'Pause video' : 'Play video', title: playing ? 'Pause video' : 'Play video', children: renderPlayPauseButton === null ? ((0, jsx_runtime_1.jsx)(DefaultPlayPauseButton_js_1.DefaultPlayPauseButton, { buffering: buffering, playing: playing })) : (((_b = renderPlayPauseButton({
                                    playing,
                                    isBuffering: buffering,
                                })) !== null && _b !== void 0 ? _b : ((0, jsx_runtime_1.jsx)(DefaultPlayPauseButton_js_1.DefaultPlayPauseButton, { buffering: buffering, playing: playing })))) }), showVolumeControls ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { style: xSpacer }), (0, jsx_runtime_1.jsx)(MediaVolumeSlider_js_1.MediaVolumeSlider, { renderMuteButton: renderMuteButton, renderVolumeSlider: renderVolumeSlider, displayVerticalVolumeSlider: displayVerticalVolumeSlider })] })) : null, (0, jsx_runtime_1.jsx)("div", { style: xSpacer }), (0, jsx_runtime_1.jsx)(PlayerTimeLabel_js_1.PlayerTimeLabel, { durationInFrames: durationInFrames, fps: fps, maxTimeLabelWidth: maxTimeLabelWidth }), (0, jsx_runtime_1.jsx)("div", { style: xSpacer })] }), (0, jsx_runtime_1.jsx)("div", { style: flex1 }), playbackRates && canvasSize && ((0, jsx_runtime_1.jsx)(PlaybackrateControl_js_1.PlaybackrateControl, { canvasSize: canvasSize, playbackRates: playbackRates })), playbackRates && supportsFullscreen && allowFullscreen ? ((0, jsx_runtime_1.jsx)("div", { style: xSpacer })) : null, (0, jsx_runtime_1.jsx)("div", { style: fullscreen, children: supportsFullscreen && allowFullscreen ? ((0, jsx_runtime_1.jsx)("button", { type: "button", "aria-label": isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen', title: isFullscreen ? 'Exit fullscreen' : 'Enter Fullscreen', style: PlaybackrateControl_js_1.playerButtonStyle, onClick: isFullscreen
                                ? onExitFullscreenButtonClick
                                : onFullscreenButtonClick, children: renderFullscreenButton === null ? ((0, jsx_runtime_1.jsx)(icons_js_1.FullscreenIcon, { isFullscreen: isFullscreen })) : (renderFullscreenButton({ isFullscreen })) })) : null })] }), (0, jsx_runtime_1.jsx)("div", { style: ySpacer }), (0, jsx_runtime_1.jsx)(PlayerSeekBar_js_1.PlayerSeekBar, { onSeekEnd: onSeekEnd, onSeekStart: onSeekStart, durationInFrames: durationInFrames, inFrame: inFrame, outFrame: outFrame })] }));
};
exports.Controls = Controls;
