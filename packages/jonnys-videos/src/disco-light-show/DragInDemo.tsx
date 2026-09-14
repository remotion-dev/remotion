import {Video} from '@remotion/media';
import React from 'react';
import {asset} from './assets';

export const DragInDemo: React.FC = () => {
	return (
		<>
			<Video
				src={asset('Screen Recording 2026-07-19 at 18.16.56.mov')}
				style={{
					position: 'absolute',
					translate: '-370.3px 204.3px',
					width: 1664,
					height: 1040,
					scale: 1.062,
					borderRadius: 60,
				}}
				from={-2}
				durationInFrames={112}
				trimBefore={8}
				playbackRate={1.85}
			/>
		</>
	);
};
