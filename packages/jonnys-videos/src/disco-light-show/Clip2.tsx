import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Clip2: React.FC = () => {
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
