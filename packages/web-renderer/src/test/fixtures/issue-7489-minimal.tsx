import React from 'react';
import {AbsoluteFill} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				background: 'white',
				fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
				fontSize: 48,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<span>ship it tomorrow?</span>
		</AbsoluteFill>
	);
};

export const issue7489Minimal = {
	component: Component,
	id: 'issue-7489-minimal',
	width: 600,
	height: 200,
	fps: 30,
	durationInFrames: 1,
} as const;
