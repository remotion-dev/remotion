import {Video} from '@remotion/media';
import React from 'react';
import {Img, interpolate, useCurrentFrame, Easing} from 'remotion';
import {asset} from './assets';

export const Fork: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Video
				src={asset('Blood Spurt v7.mov')}
				style={{
					position: 'absolute',
					translate: '-531.3px 43px',
					scale: 1.519,
				}}
				from={62}
				premountFor={30}
			/>
			<Img
				pauseWhenLoading={false}
				src={asset('elegant-silver-fork-free-png.webp')}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[71, 77],
						['365px -912px', '365px 831.5px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [Easing.bezier(0.4681, 0.0594, 0.9171, 1.075)],
						},
					),
					width: 350,
					height: 350,
					scale: 3.905,
					rotate: '180deg',
					transformOrigin: interpolate(frame, [77], ['50% 0%'], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					}),
				}}
				from={69}
				durationInFrames={133}
				trimBefore={7}
			/>
			<Img
				src={asset('Screenshot 2026-07-19 at 14.35.33.png')}
				style={{
					position: 'absolute',
					translate: '-174px 617.9px',
					width: 1428,
					height: 786,
					scale: 0.786,
				}}
			/>
		</>
	);
};
