import {Video} from '@remotion/media';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

export const VibeCoded: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Video
				src={asset('Screen Recording 2026-07-19 at 17.43.33.mov')}
				style={{
					position: 'absolute',
					translate: '-811px -351.1px',
					width: 2702,
					height: 1492,
					scale: interpolate(frame, [0, 111], [0.398, 0.52], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
					}),
					borderRadius: 60,
				}}
				durationInFrames={154}
				trimBefore={3409}
				playbackRate={2}
				from={-4}
			/>
		</>
	);
};
