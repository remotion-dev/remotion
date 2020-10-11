import {registerVideo} from '@remotion/core';
import React from 'react';
import {Circle} from './Circle';

export const ShadowCircles = () => {
	return (
		<div style={{flex: 1, backgroundColor: 'white'}}>
			<Circle size={2400} />
			<Circle size={2000} />
			<Circle size={1800} />
			<Circle size={1600} />
			<Circle size={1400} />
			<Circle size={1200} />
			<Circle size={1000} />
			<Circle size={800} />
			<Circle size={600} />
			<Circle size={400} />
			<Circle size={200} />
		</div>
	);
};

registerVideo(ShadowCircles, {
	height: 1920,
	width: 1080,
	fps: 30,
	durationInFrames: 2 * 30,
});
