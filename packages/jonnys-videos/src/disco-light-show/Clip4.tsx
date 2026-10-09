import {Video} from '@remotion/media';
import React from 'react';
import {Interactive, useVideoConfig} from 'remotion';
import {asset} from './assets';

const Clip4Inner: React.FC = () => {
	const {fps} = useVideoConfig();
	return (
		<>
			<Video
				premountFor={fps}
				src={asset('IMG_8549.mp4')}
				style={{
					position: 'absolute',
					translate: '-180px 128.8px',
					width: 1440,
					height: 1920,
					scale: 2.033,
				}}
				durationInFrames={47}
				muted
			/>
		</>
	);
};

export const Clip4 = Interactive.withSchema({
	Component: Clip4Inner,
	componentName: 'Clip4',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
