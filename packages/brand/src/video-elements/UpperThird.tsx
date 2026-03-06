import {noise2D} from '@remotion/noise';
import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {BLUE} from '../colors';

export const UpperThird: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const xOffset = noise2D('noisex', 0, frame / 160) * 50;
	const yOffset = noise2D('noisey', 0, frame / 160) * 50;
	const entry = (delay: number) =>
		spring({
			fps,
			frame: frame - delay,
			config: {
				mass: 0.5,
			},
		});

	const out = spring({
		fps,
		frame: frame - durationInFrames + 20,
		config: {
			damping: 200,
		},
	});

	const rotate = interpolate(out, [0, 1], [0, -Math.PI / 20]);
	const outY = interpolate(out, [0, 1], [0, -500]);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					width: 'auto',
					height: 'auto',
					backgroundColor: 'white',
					borderRadius: 25,
					right: 90,
					top: 90,
					left: undefined,
					transform: `scale(${entry(0)}) translateX(${xOffset}px) translateY(${
						yOffset + outY
					}px) rotate(${rotate}rad)`,
					padding: 40,
					bottom: undefined,
				}}
			>
				<h1
					style={{
						fontFamily: 'SF Pro Display',
						fontSize: '5em',
						marginTop: 0,
						marginBottom: 0,
						color: '#000',
					}}
				>
					React Summit
				</h1>
				<h1
					style={{
						fontFamily: 'SF Pro Display',
						fontSize: '1.8em',
						marginTop: 0,
						marginBottom: 0,
						color: BLUE,
					}}
				>
					reactsummit.com
				</h1>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
