import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Clip5: React.FC = () => {
	return (
		<>
			<Video
				src={asset('clip5-source.mp4')}
				style={{
					position: 'absolute',
					translate: '-423.4px 739px',
					width: 1920,
					height: 1080,
					scale: 0.799,
					rotate: '2deg',
				}}
				from={-6}
				durationInFrames={306}
				muted
			/>
		</>
	);
};
