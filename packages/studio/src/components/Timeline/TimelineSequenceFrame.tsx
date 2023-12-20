import React from 'react';
import {useCurrentFrame} from 'remotion';

const relativeFrameStyle: React.CSSProperties = {
	fontSize: 11,
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: 'white',
	opacity: 0.5,
};

export const TimelineSequenceFrame: React.FC<{
	from: number;
	duration: number;
}> = ({from, duration}) => {
	const frame = useCurrentFrame();
	const relativeFrame = frame - from;

	const roundedFrame = Math.round(relativeFrame * 100) / 100;

	const isInRange = relativeFrame >= 0 && relativeFrame < duration;

	if (!isInRange) {
		return null;
	}

	return <div style={relativeFrameStyle}>{roundedFrame}</div>;
};
