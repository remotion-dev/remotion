import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const Compilation: React.FC = () => {
	return (
		<>
			<Video
				src={asset('IMG_7933 (1).mov')}
				style={{
					position: 'absolute',
					translate: '146.3px 310.8px',
					width: 1156,
					height: 1080,
					scale: 1.98,
				}}
				durationInFrames={52}
				trimBefore={327}
			/>
		</>
	);
};
