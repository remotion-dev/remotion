import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {renderFrame} from '../../state/render-frame';

const relativeFrameStyle: React.CSSProperties = {
	fontSize: 12,
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: 'white',
	opacity: 0.6,
	marginTop: 2,
	cursor: 'help',
};

export const TimelineSequenceFrame: React.FC<{
	from: number;
	duration: number;
}> = ({from, duration}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const relativeFrame = frame - from;

	const isInRange = relativeFrame >= 0 && relativeFrame < duration;

	if (!isInRange) {
		return null;
	}

	return (
		<div
			title={`
The current time within the sequence.

Call \`useCurrentFrame()\` within the sequence to get the time programmatically.

Call \`const {durationInFrames} = useVideoConfig()\` to get the duration of the sequence.
`.trim()}
			style={relativeFrameStyle}
		>
			{renderFrame(relativeFrame, fps)} ({relativeFrame})
		</div>
	);
};
