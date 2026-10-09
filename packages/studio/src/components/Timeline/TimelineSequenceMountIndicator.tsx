import React from 'react';
import {useCurrentFrame} from 'remotion';
import {
	TRANSPARENT,
	WHITE_ALPHA_20,
	WHITE_ALPHA_50,
} from '../../helpers/colors';

export const TimelineSequenceMountIndicator: React.FC<{
	readonly from: number;
	readonly displayDurationInFrames: number;
	readonly mountDurationInFrames: number;
	readonly mountType: 'premount' | 'postmount';
	readonly left: number;
	readonly width: number;
}> = ({
	from,
	displayDurationInFrames,
	mountDurationInFrames,
	mountType,
	left,
	width,
}) => {
	const frame = useCurrentFrame();
	const relativeFrame = frame - from;
	const isInRange =
		relativeFrame >= 0 && relativeFrame < displayDurationInFrames;
	const relativeMountFrame =
		mountType === 'premount'
			? relativeFrame + mountDurationInFrames
			: relativeFrame - displayDurationInFrames;
	const isMounting =
		!isInRange &&
		relativeMountFrame >= 0 &&
		relativeMountFrame <
			(mountType === 'premount'
				? displayDurationInFrames
				: mountDurationInFrames);

	return (
		<div
			style={{
				left,
				width,
				height: '100%',
				background: `repeating-linear-gradient(
						-45deg,
						${TRANSPARENT},
						${TRANSPARENT} 2px,
						${isMounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 2px,
						${isMounting ? WHITE_ALPHA_50 : WHITE_ALPHA_20} 4px
					)`,
				position: 'absolute',
			}}
		/>
	);
};
