import {burlap} from '@remotion/effects/burlap';
import React from 'react';
import {Sequence, Solid, interpolate, useCurrentFrame, Easing} from 'remotion';
import {Skills2Gesture} from './Skills2Gesture';

export const Skills2Router: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1344}
				height={1700}
				color={'#f5fafb'}
				style={{
					position: 'absolute',
				}}
				effects={[
					burlap({
						size: 10,
						roughness: 0,
						color: '#e9e9e9',
					}),
				]}
			/>
			<Sequence
				from={0}
				name="Skills2Gesture"
				width={1344}
				height={1700}
				durationInFrames={456}
				style={{
					position: 'absolute',
					translate: interpolate(
						frame,
						[27, 49, 125, 301],
						['0px 391.5px', '0px -190.2px', '0px -176.8px', '0px -162.2px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.linear,
							],
						},
					),
					scale: interpolate(frame, [27, 49], [1.71, 1.29], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						output: 'perceptual-scale',
						easing: [
							Easing.spring({
								damping: 200,
								mass: 1,
								stiffness: 100,
								allowTail: true,
								durationRestThreshold: 0.02,
								overshootClamping: false,
							}),
						],
					}),
				}}
			>
				<Skills2Gesture />
			</Sequence>
		</>
	);
};
