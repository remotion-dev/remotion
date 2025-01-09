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

	return (
		<div style={timeLabel}>
			{formatTime(frame / fps)} / {formatTime(durationInFrames / fps)}
		</div>
	);
};
