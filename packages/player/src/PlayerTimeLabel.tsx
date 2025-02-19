import React, {useMemo} from 'react';
import {Internals} from 'remotion';
import {formatTime} from './format-time';

export const PlayerTimeLabel: React.FC<{
	readonly maxTimeLabelWidth: number | null;
	readonly durationInFrames: number;
	readonly fps: number;
}> = ({durationInFrames, maxTimeLabelWidth, fps}) => {
	const frame = Internals.Timeline.useTimelinePosition();

	const timeLabel: React.CSSProperties = useMemo(() => {
		return {
			color: 'white',
			fontFamily: 'sans-serif',
			fontSize: 14,
			maxWidth: maxTimeLabelWidth === null ? undefined : maxTimeLabelWidth,
			overflow: 'hidden',
			textOverflow: 'ellipsis',
		};
	}, [maxTimeLabelWidth]);

	// If the video ended and is not looping, it should show 0:04 / 0:04 instead of 0:03 / 0:04
	const isLastFrame = frame === durationInFrames - 1;
	const frameToDisplay = isLastFrame ? frame + 1 : frame;

	return (
		<div style={timeLabel}>
			{formatTime(frameToDisplay / fps)} / {formatTime(durationInFrames / fps)}
		</div>
	);
};
