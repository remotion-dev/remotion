"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaVolumeSlider = exports.VOLUME_SLIDER_WIDTH = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const remotion_1 = require("remotion");
const icons_js_1 = require("./icons.js");
const render_volume_slider_js_1 = require("./render-volume-slider.js");
const use_hover_state_js_1 = require("./use-hover-state.js");
exports.VOLUME_SLIDER_WIDTH = 100;
const MediaVolumeSlider = ({ displayVerticalVolumeSlider, renderMuteButton, renderVolumeSlider }) => {
    const [mediaMuted, setMediaMuted] = remotion_1.Internals.useMediaMutedState();
    const [mediaVolume, setMediaVolume] = remotion_1.Internals.useMediaVolumeState();
    const [focused, setFocused] = (0, react_1.useState)(false);
    const parentDivRef = (0, react_1.useRef)(null);
    const inputRef = (0, react_1.useRef)(null);
    const hover = (0, use_hover_state_js_1.useHoverState)(parentDivRef, false);
    const onBlur = (0, react_1.useCallback)(() => {
        setTimeout(() => {
            // We need a small delay to check which element was focused next,
            // and if it wasn't the volume slider, we hide it
            if (inputRef.current && document.activeElement !== inputRef.current) {
                setFocused(false);
            }
        }, 10);
    }, []);
    const isVolume0 = mediaVolume === 0;
    const onClick = (0, react_1.useCallback)(() => {
        if (isVolume0) {
            setMediaVolume(1);
            setMediaMuted(false);
            return;
        }
        setMediaMuted((mute) => !mute);
    }, [isVolume0, setMediaMuted, setMediaVolume]);
    const parentDivStyle = (0, react_1.useMemo)(() => {
        return {
            display: 'inline-flex',
            background: 'none',
            border: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            touchAction: 'none',
            ...(displayVerticalVolumeSlider && { position: 'relative' }),
        };
    }, [displayVerticalVolumeSlider]);
    const volumeContainer = (0, react_1.useMemo)(() => {
        return {
            display: 'inline',
            width: icons_js_1.ICON_SIZE,
            height: icons_js_1.ICON_SIZE,
            cursor: 'pointer',
            appearance: 'none',
            background: 'none',
            border: 'none',
            padding: 0,
        };
    }, []);
    const renderDefaultMuteButton = (0, react_1.useCallback)(({ muted, volume }) => {
        const isMutedOrZero = muted || volume === 0;
        return ((0, jsx_runtime_1.jsx)("button", { "aria-label": isMutedOrZero ? 'Unmute sound' : 'Mute sound', title: isMutedOrZero ? 'Unmute sound' : 'Mute sound', onClick: onClick, onBlur: onBlur, onFocus: () => setFocused(true), style: volumeContainer, type: "button", children: isMutedOrZero ? (0, jsx_runtime_1.jsx)(icons_js_1.VolumeOffIcon, {}) : (0, jsx_runtime_1.jsx)(icons_js_1.VolumeOnIcon, {}) }));
    }, [onBlur, onClick, volumeContainer]);
    const muteButton = (0, react_1.useMemo)(() => {
        return renderMuteButton
            ? renderMuteButton({ muted: mediaMuted, volume: mediaVolume })
            : renderDefaultMuteButton({ muted: mediaMuted, volume: mediaVolume });
    }, [mediaMuted, mediaVolume, renderDefaultMuteButton, renderMuteButton]);
    const volumeSlider = (0, react_1.useMemo)(() => {
        return (focused || hover) && !mediaMuted && !remotion_1.Internals.isIosSafari()
            ? (renderVolumeSlider !== null && renderVolumeSlider !== void 0 ? renderVolumeSlider : render_volume_slider_js_1.renderDefaultVolumeSlider)({
                isVertical: displayVerticalVolumeSlider,
                volume: mediaVolume,
                onBlur: () => setFocused(false),
                inputRef,
                setVolume: setMediaVolume,
            })
            : null;
    }, [
        displayVerticalVolumeSlider,
        focused,
        hover,
        mediaMuted,
        mediaVolume,
        renderVolumeSlider,
        setMediaVolume,
    ]);
    return ((0, jsx_runtime_1.jsxs)("div", { ref: parentDivRef, style: parentDivStyle, children: [muteButton, volumeSlider] }));
};
exports.MediaVolumeSlider = MediaVolumeSlider;
