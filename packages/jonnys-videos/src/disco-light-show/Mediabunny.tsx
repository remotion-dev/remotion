import React from 'react';
import {Img, interpolate, useCurrentFrame} from 'remotion';
import {asset} from './assets';

export const Mediabunny: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Img
				src={asset('mediabunny-logo.png')}
				style={{
					position: 'absolute',
					translate: '105px 527.5px',
					width: 870,
					height: 865,
					opacity: interpolate(frame, [0, 8, 17, 26], [0, 0.1, 0.1, 0], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
					scale: interpolate(frame, [0, 26], [1, 2.5], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'extend',
						output: 'perceptual-scale',
					}),
				}}
			/>
		</>
	);
};
