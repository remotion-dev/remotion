import {useMemo} from 'react';
import {useVideoConfig} from 'remotion';
import {fullscreenIconSize, ICON_SIZE} from './icons';
import {VOLUME_SLIDER_WIDTH} from './MediaVolumeSlider';
import {X_SPACER} from './PlayerControls';

export const useVideoControlsResize = (
	isFullscreen: Boolean,
	allowFullScreen: Boolean
): {
	maxTimeLabelWidth: number;
	displayVerticalVolumeSlider: Boolean;
} => {
	const {width} = useVideoConfig();

	const {maxTimeLabelWidth, displayVerticalVolumeSlider} = useMemo((): {
		maxTimeLabelWidth: number;
		displayVerticalVolumeSlider: Boolean;
	} => {
		const playerWidth = isFullscreen ? window.innerWidth : width;
		const playPauseIconSize = ICON_SIZE;
		const volumeIconSize = ICON_SIZE;
		const _fullscreenIconSize = allowFullScreen ? fullscreenIconSize : 0;
		const xPadding = 12 * 2;
		const maxTimeLabelWidth =
			playerWidth -
			volumeIconSize -
			playPauseIconSize -
			xPadding -
			_fullscreenIconSize -
			X_SPACER * 2;

		const maxTimeLabelWidthWithoutNegativeValue =
			maxTimeLabelWidth > 0 ? maxTimeLabelWidth : 0;

		const availableTimeLabelWidthIfVolumeOpen =
			maxTimeLabelWidthWithoutNegativeValue - VOLUME_SLIDER_WIDTH;

		// If max label width is lower than the volume width
		// then it means we need to take it's width as the max label width
		// otherwise we took the available width when volume open
		const computedLabelWidth =
			availableTimeLabelWidthIfVolumeOpen < VOLUME_SLIDER_WIDTH
				? maxTimeLabelWidthWithoutNegativeValue
				: availableTimeLabelWidthIfVolumeOpen;
		const minWidthForHorizontalDisplay =
			computedLabelWidth +
			volumeIconSize +
			VOLUME_SLIDER_WIDTH +
			playPauseIconSize +
			_fullscreenIconSize +
			xPadding +
			X_SPACER * 2;

		const displayVerticalVolumeSlider =
			playerWidth < minWidthForHorizontalDisplay;
		return {
			maxTimeLabelWidth: maxTimeLabelWidthWithoutNegativeValue,
			displayVerticalVolumeSlider,
		};
	}, [width, isFullscreen, allowFullScreen]);

	return {
		maxTimeLabelWidth,
		displayVerticalVolumeSlider,
	};
};
