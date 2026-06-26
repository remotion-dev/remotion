import {blur} from '@remotion/effects/blur';
import {scale} from '@remotion/effects/scale';
import React from 'react';
import {
	AbsoluteFill,
	AnimatedImage,
	interpolate,
	interpolateColors,
	Sequence,
	Solid,
	staticFile,
	useCurrentFrame,
} from 'remotion';

const Shifted = () => {
	const frame = useCurrentFrame();
	return (
		<Sequence
			style={{
				scale: interpolate(frame, [0, 60], [2, 4]),
				translate: '13.2px 41.1px',
			}}
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
	);
};

const NestedShifted = () => {
	return (
		<Sequence from={20}>
			<Shifted />
		</Sequence>
	);
};

const NestedOwnFrom = () => {
	const frame = useCurrentFrame();
	return (
		<Sequence
			from={20}
			name="nested own from keyframes should be shown at 30 and 70"
			style={{scale: interpolate(frame, [0, 40], [2, 4])}}
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
	);
};

const ShiftedEffect = () => {
	const frame = useCurrentFrame();
	return (
		<AnimatedImage
			src={staticFile('giphy.gif')}
			fit="contain"
			style={{
				width: 360,
				height: 200,
				borderRadius: 24,
				overflow: 'hidden',
				translate: '424.4px 423.5px',
				scale: interpolate(frame, [16], [2.044585], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				}),
				rotate: interpolate(
					frame,
					[16, 39],
					['76.455165deg', '144.692528deg'],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					},
				),
			}}
			effects={[
				blur({
					radius: interpolate(frame, [0, 60], [0, 24]),
				}),
			]}
		/>
	);
};

const NestedShiftedEffect = () => {
	return (
		<Sequence from={20}>
			<ShiftedEffect />
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
			<Sequence from={30} name="keyframes should be shown at 30 and 90">
				<Shifted />
			</Sequence>
			<Sequence from={30} name="nested keyframes should be shown at 50 and 110">
				<NestedShifted />
			</Sequence>
			<Sequence from={30}>
				<NestedOwnFrom />
			</Sequence>
			<Sequence from={30} name="effect keyframes should be shown at 30 and 90">
				<ShiftedEffect />
			</Sequence>
			<Sequence
				name="color keyframes should be shown at 0 and 100"
				durationInFrames={120}
			>
				<Solid
					width={180}
					height={180}
					color={interpolateColors(frame, [0, 100], ['#0b84f3', '#f43b00'])}
					style={{
						borderRadius: 24,
					}}
				/>
			</Sequence>
			<Sequence
				from={30}
				name="nested effect keyframes should be shown at 50 and 110"
			>
				<NestedShiftedEffect />
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
						translate: '184.8px 412.4px',
					}}
					effects={[
						blur({
							radius: interpolate(frame, [0, 60, 119], [0, 24, 4]),
						}),
						scale({
							scale: 1 + 1,
						}),
					]}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};

export default KeyframedPropsTest;
