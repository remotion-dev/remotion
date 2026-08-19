import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LoopedIndicator} from './LoopedIndicator';

const row: React.CSSProperties = {
	overflow: 'hidden',
};

export const LoopedTimelineIndicator: React.FC<{
	readonly loops: number;
	readonly fullWidth: number;
	readonly visibleOffset: number;
	readonly visibleWidth: number;
}> = ({loops, fullWidth, visibleOffset, visibleWidth}) => {
	if (loops <= 1 || fullWidth <= 0 || visibleWidth <= 0) {
		return null;
	}

	const loopWidth = fullWidth / loops;
	const lastBoundaryIndex = Math.ceil(loops) - 1;
	const firstVisibleBoundaryIndex = Math.max(
		1,
		Math.floor(visibleOffset / loopWidth),
	);
	const lastVisibleBoundaryIndex = Math.min(
		lastBoundaryIndex,
		Math.ceil((visibleOffset + visibleWidth) / loopWidth),
	);
	const visibleBoundaryCount = Math.max(
		0,
		lastVisibleBoundaryIndex - firstVisibleBoundaryIndex + 1,
	);
	const boundaries = new Array(visibleBoundaryCount)
		.fill(true)
		.map((_, index) => (firstVisibleBoundaryIndex + index) * loopWidth);

	return (
		<AbsoluteFill style={row}>
			{boundaries.map((boundary) => {
				return (
					<div
						key={boundary}
						style={{
							position: 'absolute',
							display: 'flex',
							left: boundary - visibleOffset,
							top: 0,
							bottom: 0,
						}}
					>
						<LoopedIndicator />
					</div>
				);
			})}
		</AbsoluteFill>
	);
};
