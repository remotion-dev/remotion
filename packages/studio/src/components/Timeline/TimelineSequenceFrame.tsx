import React from 'react';

const relativeFrameStyle: React.CSSProperties = {
	fontSize: 11,
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: 'white',
	opacity: 0.5,
};

export const TimelineSequenceFrame: React.FC<{
	readonly roundedFrame: number;
	readonly premounted: boolean;
}> = ({roundedFrame, premounted}) => {
	return (
		<div style={relativeFrameStyle}>
			{premounted ? '0 (Premounted)' : roundedFrame}
		</div>
	);
};
