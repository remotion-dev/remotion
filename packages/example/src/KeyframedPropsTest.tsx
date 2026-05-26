import {blur} from '@remotion/effects/blur';
import {scale} from '@remotion/effects/scale';
import {Gif} from '@remotion/gif';
import React from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	interpolate,
	Sequence,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const Shifted = () => {
	const frame = useCurrentFrame();
	return (
		<Sequence style={{scale: interpolate(frame, [0, 60], [2, 4])}}>
			<div
				style={{
					width: 180,
					height: 180,
					borderRadius: 24,
					backgroundColor: '#0b84f3',
				}}
			/>
		</Sequence>
	);
};

const KeyframedPropsTest: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'space-evenly',
				alignItems: 'center',
				backgroundColor: 'white',
			}}
		>
			<Sequence
				name="keyframes should be shown at 0 and 100"
				durationInFrames={120}
				style={{scale: interpolate(frame, [0, 100], [2, 4])}}
			>
				<div
					style={{
						width: 180,
						height: 180,
						borderRadius: 24,
						backgroundColor: '#0b84f3',
					}}
				/>
			</Sequence>
			<Sequence from={30} name="keyframes should be shown at 30 and 60">
				<Shifted />
			</Sequence>
			<Sequence
				name="keyframes should be shown at 0 and 100 because relative to parent"
				durationInFrames={120}
				from={30}
				style={{scale: interpolate(frame, [0, 100], [2, 4])}}
			>
				<div
					style={{
						width: 180,
						height: 180,
						borderRadius: 24,
						backgroundColor: '#0b84f3',
					}}
				/>
			</Sequence>
			<Sequence durationInFrames={120}>
				<AnimatedImage
					src={staticFile('giphy.gif')}
					fit="contain"
					style={{
						width: 360,
						height: 200,
						borderRadius: 24,
						overflow: 'hidden',
					}}
					effects={[
						blur({
							radius: interpolate(frame, [0, 60, 119], [0, 24, 4]),
						}),
						scale({
							scale: 2.2,
						}),
					]}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};

export default KeyframedPropsTest;
