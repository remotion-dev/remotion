import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Clip1: React.FC = () => {
	return (
		<>
			<Video
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
