import {linearProgressiveBlur} from '@remotion/effects/linear-progressive-blur';
import {Video} from '@remotion/media';
import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

export const Clip3: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Video
				src={asset('clip3-source.mp4')}
				style={{
					position: 'absolute',
					translate: '-860.6px 434.6px',
					width: 1920,
					height: 1080,
					scale: 1.805,
				}}
				durationInFrames={68}
				playbackRate={1.5}
				effects={[
					linearProgressiveBlur({
						end: [0.651, -0.012],
						start: [0.646, 0.972],
						endBlur: interpolate(frame, [28, 39], [0, 73], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}),
				]}
				muted
				premountFor={30}
			/>
		</>
	);
};
