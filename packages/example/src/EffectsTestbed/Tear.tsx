import {scale} from '@remotion/effects/scale';
import {tear} from '@remotion/effects/tear';
import React from 'react';
import {
	AbsoluteFill,
	CanvasImage,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const TearTest: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: '#eee8df',
				alignItems: 'center',
				justifyContent: 'center',
				fontFamily: 'sans-serif',
				color: '#242424',
			}}
		>
			<div style={{position: 'absolute', top: 24, fontSize: 28}}>tear()</div>
			<CanvasImage
				src={staticFile('1.jpg')}
				width={960}
				height={540}
				fit="cover"
				effects={[
					scale({
						scale: 0.5,
					}),
					tear({
						angle: 78,
						progress: interpolate(frame, [15, 105, 149], [0, 1, 2], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						rotation: 7,
						jaggedness: 24,
					}),
				]}
			/>
			<div
				style={{
					position: 'absolute',
					bottom: 28,
					fontSize: 20,
					fontVariantNumeric: 'tabular-nums',
				}}
			>
				Frame: {frame}
			</div>
		</AbsoluteFill>
	);
};
