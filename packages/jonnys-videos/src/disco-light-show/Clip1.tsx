import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, useVideoConfig} from 'remotion';
import {asset} from './assets';

const Clip1Inner: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<Video
				premountFor={fps}
				src={asset('clip1-source.mp4')}
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
					scale: 1.837,
					translate: '301px 420px',
				}}
				durationInFrames={58}
				from={-1}
				muted
			/>
		</>
	);
};

export const Clip1 = Interactive.withSchema({
	Component: Clip1Inner,
	componentName: 'Clip1',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
