import {Audio, registerVideo, Sequence} from '@remotion/core';
import React from 'react';
import {Any} from '../Any';
import {Devices} from '../Devices';

export const Welcome: React.FC = () => {
	const audio = require('./audio.mp4').default;

	return (
		<div style={{flex: 1, display: 'flex'}}>
			<Sequence from={0}>
				<Any />
			</Sequence>
			<Sequence from={80}>
				<Devices />
			</Sequence>
			<Audio src={audio} />
		</div>
	);
};

registerVideo(Welcome, {
	height: 1920,
	width: 1080,
	durationInFrames: 120,
	fps: 30,
});
