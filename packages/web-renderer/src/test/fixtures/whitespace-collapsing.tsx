import React from 'react';

const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: '30px 0px 0px 0.375px',
				width: 613.625,
				fontSize: 56,
				fontWeight: 600,
				fontFamily: 'Helvetica',
			}}
		>
			<span> mix the audio</span>
			<span> all together</span>
		</div>
	);
};

export const whiteSpaceCollapsing = {
	component: Component,
	id: 'whitespace-collapsing',
	width: 500,
	height: 180,
	fps: 30,
	durationInFrames: 1,
} as const;
