"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVideoControlsResize = exports.X_PADDING = exports.X_SPACER = void 0;
const react_1 = require("react");
const icons_js_1 = require("./icons.js");
const MediaVolumeSlider_js_1 = require("./MediaVolumeSlider.js");
exports.X_SPACER = 10;
exports.X_PADDING = 12;
const useVideoControlsResize = ({ allowFullscreen: allowFullScreen, playerWidth, }) => {
    const resizeInfo = (0, react_1.useMemo)(() => {
        const playPauseIconSize = icons_js_1.ICON_SIZE;
        const volumeIconSize = icons_js_1.ICON_SIZE;
        const _fullscreenIconSize = allowFullScreen ? icons_js_1.fullscreenIconSize : 0;
        const elementsSize = volumeIconSize +
            playPauseIconSize +
            _fullscreenIconSize +
            exports.X_PADDING * 2 +
            exports.X_SPACER * 2;
        const maxTimeLabelWidth = playerWidth - elementsSize;
        const maxTimeLabelWidthWithoutNegativeValue = Math.max(maxTimeLabelWidth, 0);
        const availableTimeLabelWidthIfVolumeOpen = maxTimeLabelWidthWithoutNegativeValue - MediaVolumeSlider_js_1.VOLUME_SLIDER_WIDTH;
        // If max label width is lower than the volume width
        // then it means we need to take it's width as the max label width
        // otherwise we took the available width when volume open
        const computedLabelWidth = availableTimeLabelWidthIfVolumeOpen < MediaVolumeSlider_js_1.VOLUME_SLIDER_WIDTH
            ? maxTimeLabelWidthWithoutNegativeValue
            : availableTimeLabelWidthIfVolumeOpen;
        const minWidthForHorizontalDisplay = computedLabelWidth + elementsSize + MediaVolumeSlider_js_1.VOLUME_SLIDER_WIDTH;
        const displayVerticalVolumeSlider = playerWidth < minWidthForHorizontalDisplay;
        return {
            maxTimeLabelWidth: maxTimeLabelWidthWithoutNegativeValue === 0
                ? null
                : maxTimeLabelWidthWithoutNegativeValue,
            displayVerticalVolumeSlider,
        };
    }, [allowFullScreen, playerWidth]);
    return resizeInfo;
};
exports.useVideoControlsResize = useVideoControlsResize;
