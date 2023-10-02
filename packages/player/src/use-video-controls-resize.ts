import {useMemo} from 'react';
import {fullscreenIconSize, ICON_SIZE} from './icons.js';
import {VOLUME_SLIDER_WIDTH} from './MediaVolumeSlider.js';

type Info = {
	maxTimeLabelWidth: number | null;
	displayVerticalVolumeSlider: boolean;
};

export const X_SPACER = 10;
export const X_PADDING = 12;

export const useVideoControlsResize = ({
	allowFullscreen: allowFullScreen,
	playerWidth,
}: {
	allowFullscreen: boolean;
	playerWidth: number;
}): Info => {
	const resizeInfo = useMemo((): Info => {
		const playPauseIconSize = ICON_SIZE;
		const volumeIconSize = ICON_SIZE;
		const _fullscreenIconSize = allowFullScreen ? fullscreenIconSize : 0;
		const elementsSize =
			volumeIconSize +
			playPauseIconSize +
			_fullscreenIconSize +
			X_PADDING * 2 +
			X_SPACER * 2;

		const maxTimeLabelWidth = playerWidth - elementsSize;

		const maxTimeLabelWidthWithoutNegativeValue = Math.max(
			maxTimeLabelWidth,
			0,
		);

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
			computedLabelWidth + elementsSize + VOLUME_SLIDER_WIDTH;

		const displayVerticalVolumeSlider =
			playerWidth < minWidthForHorizontalDisplay;

		return {
			maxTimeLabelWidth:
				maxTimeLabelWidthWithoutNegativeValue === 0
					? null
					: maxTimeLabelWidthWithoutNegativeValue,
			displayVerticalVolumeSlider,
		};
	}, [allowFullScreen, playerWidth]);

	return resizeInfo;
};
