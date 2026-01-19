import React from 'react';

const Component: React.FC = () => {
	return (
		<div
			style={{
				position: 'absolute',
				inset: '30px 0px 0px 0',
				width: '613.625px',
				height: '430.143px',
				flexDirection: 'column',
				fontSize: 56,
				lineHeight: '1.2',
				fontWeight: 600,
				fontFamily: 'Helvetica',
				display: 'inline-block',
				paddingLeft: 30,
				paddingRight: 30,
			}}
		>
			<span> and</span>
			<span> mix</span>
			<span> the</span>
			<span> audio</span>
			<span> all together</span>
			<span> into</span>
			<span> an</span>
		</div>
	);
};

export const whiteSpaceCollapsing2 = {
	component: Component,
	id: 'whitespace-collapsing-2',
	width: 600,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
