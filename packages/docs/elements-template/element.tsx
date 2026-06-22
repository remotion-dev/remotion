import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';

export const width = 1920;
export const height = 1080;
export const fps = 30;
export const durationInFrames = 120;

export const ElementComponent: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#111827',
				color: 'white',
				display: 'flex',
				fontFamily: 'Inter, system-ui, sans-serif',
				fontSize: 96,
				fontWeight: 700,
				justifyContent: 'center',
			}}
		>
			Element
		</AbsoluteFill>
	);
};

export const RemotionRoot: React.FC = () => {
	return (
		<Composition
			id="Element"
			component={ElementComponent}
			durationInFrames={durationInFrames}
			fps={fps}
			height={height}
			width={width}
		/>
	);
};
