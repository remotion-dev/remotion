import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	interpolateColors,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const DURATION = 25;

const items = 10;

export const Wheel: React.FC<{
	topLayer: boolean;
	digit: string;
	delay: number;
}> = ({topLayer, digit, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const singleDur = DURATION;

	const progress = spring({
		fps,
		frame,
		config: {},
		durationInFrames: singleDur,
		delay,
	});

	const rotation = progress * (1 / items);

	return (
		<AbsoluteFill
			style={{
				perspective: 5000,
				background: topLayer
					? interpolateColors(
							progress,
							[0, 1, 2, 3],
							['#AD327E', '#000', '#0b84f3', '#AD327E'],
						)
					: 'transparent',
			}}
		>
			{new Array(items).fill(true).map((f, i) => {
				const index = i / items + rotation;

				const z = Math.cos(index * -Math.PI * 2) * 120;
				const y = Math.sin(index * Math.PI * 2) * -120;
				const r = interpolate(index, [0, 1], [0, Math.PI * 2]);

				return (
					// eslint-disable-next-line react/jsx-key
					<AbsoluteFill
						style={{
							justifyContent: 'center',
							alignItems: 'center',
							fontSize: 60,
							fontVariationSettings: '"wght" ' + (topLayer ? 700 : 400),
							transform: `translateZ(${z}px) translateY(${y}px) rotateX(${r}deg)`,
							backfaceVisibility: 'hidden',
							perspective: 1000,
						}}
					>
						<div
							style={{
								transform: `rotateX(-${r}rad)`,
								backfaceVisibility: 'hidden',
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<div
								style={{
									lineHeight: 1,
								}}
							>
								{i}
							</div>
						</div>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
