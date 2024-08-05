import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

const DURATION = 25;

const items = 10;

export const Wheel: React.FC<{
	endDigit: number;
	startDigit: number;
	delay: number;
}> = ({endDigit, startDigit, delay}) => {
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

	const startRotation = 1 / items + startDigit / 10;
	const endRotation = 1 / items + endDigit / 10;
	const rotation = interpolate(progress, [0, 1], [startRotation, endRotation]);

	return (
		<AbsoluteFill
			style={{
				perspective: 5000,
				maskImage: `linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)`,
			}}
		>
			{new Array(items).fill(true).map((_, i) => {
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
							fontVariationSettings: `"wght" 400`,
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
								{9 - i}
							</div>
						</div>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
