import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const HuggingFace: React.FC = () => {
	return (
		<>
			<Video
				src={asset('Screen Recording 2026-07-19 at 10.04.18.mov')}
				style={{
					position: 'absolute',
					translate: '-391px -121.8px',
					width: 2702,
					height: 1496,
					scale: 0.53,
					boxShadow: '0px 0px 50px rgba(255, 255, 255, 0.5)',
					borderRadius: 60,
				}}
				durationInFrames={247}
				trimBefore={185}
				playbackRate={0.5}
			/>
		</>
	);
};
