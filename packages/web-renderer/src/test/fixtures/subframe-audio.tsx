import {Audio} from '@remotion/media';
import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';

const Component: React.FC = () => {
	return (
		<AbsoluteFill>
			<Audio from={0.5} src={staticFile('dialogue.wav')} />
		</AbsoluteFill>
	);
};

export const subframeAudio = {
	component: Component,
	id: 'subframe-audio',
	width: 100,
	height: 100,
	fps: 30,
	durationInFrames: 3,
} as const;
