import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Setup: React.FC = () => {
	return (
		<>
			<Video
				src={asset('IMG_7301.MOV')}
				style={{
					position: 'absolute',
					width: 1920,
					height: 1080,
					translate: '-693.8px 420px',
					scale: 1.852,
				}}
				playbackRate={8}
				durationInFrames={72}
				trimBefore={262}
				from={-18}
			/>
		</>
	);
};
