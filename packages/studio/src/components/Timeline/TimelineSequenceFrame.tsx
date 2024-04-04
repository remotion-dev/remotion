import React from 'react';

const relativeFrameStyle: React.CSSProperties = {
	fontSize: 11,
	fontFamily: 'Arial, Helvetica, sans-serif',
	color: 'white',
	opacity: 0.5,
};

export const TimelineSequenceFrame: React.FC<{
	roundedFrame: number;
	premountDisplay: number | null;
}> = ({roundedFrame, premountDisplay}) => {
	return (
		<div style={relativeFrameStyle}>
			{premountDisplay ? '0 (Premounted)' : roundedFrame}
		</div>
	);
};
