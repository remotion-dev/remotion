import {Video} from '@remotion/media';
import React from 'react';
import {Interactive} from 'remotion';
import {asset} from './assets';

const Clip2Inner: React.FC = () => {
	return (
		<>
			<Video
				src={asset('clip2-source.mp4')}
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
					scale: 1.998,
					translate: '-420px 419.9px',
				}}
				durationInFrames={46}
			/>
		</>
	);
};

export const Clip2 = Interactive.withSchema({
	Component: Clip2Inner,
	componentName: 'Clip2',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
