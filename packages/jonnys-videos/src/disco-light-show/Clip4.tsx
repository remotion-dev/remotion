import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Clip4: React.FC = () => {
	return (
		<>
			<Video
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
