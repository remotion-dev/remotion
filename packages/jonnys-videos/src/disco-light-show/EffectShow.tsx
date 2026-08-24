import {Video} from '@remotion/media';
import React from 'react';
import {} from 'remotion';
import {asset} from './assets';

export const EffectShow: React.FC = () => {
	return (
		<>
			<Video
				src={asset('TextBehindVideoSeries.mp4')}
				style={{
					position: 'absolute',
					translate: '-420px 420px',
					width: 1920,
					height: 1080,
					scale: 0.526,
					boxShadow: '0px 0px 50px rgba(255, 255, 255, 0.5)',
					borderRadius: 60,
				}}
				muted
				trimBefore={151}
				premountFor={30}
			/>
		</>
	);
};
