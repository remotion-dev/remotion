import React from 'react';
import type {SpringConfig} from 'remotion';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {Minus} from './Minus';

const DURATION = 25;

const items = 10;

export const NUM_WIDTH = 36;

export const Wheel: React.FC<{
	readonly delay: number;
	readonly digits: number[];
	readonly renderDigit: (i: number) => React.ReactNode;
	readonly isLeadingDigit: boolean;
	readonly isNegative: boolean[];
}> = ({delay, digits, renderDigit, isLeadingDigit, isNegative}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const singleDur = DURATION;

	const progressesMaker = (
		springConfig: Partial<SpringConfig>,
		durationInFrames: number,
	) =>
		new Array(digits.length - 1).fill(true).map((_, i) => {
			const current = digits[i];
			const next = digits[i + 1];
			if (current === next) {
				return 1;
			}

			return spring({
				fps,
				frame,
				config: springConfig,
				durationInFrames,
				delay: i * 50 + delay,
			});
		});

	const progresses = progressesMaker(
		{
			mass: 0.7,
			damping: 12,
		},
		singleDur,
	);
	const softProgresses = progressesMaker(
		{
			damping: 200,
		},
		singleDur / 2,
	);

	const rotations = digits.map((d) => 1 / items + d / 10);

	const offsets = rotations.map((r, i) => {
		const next = rotations[i + 1];
		if (next === undefined) {
			return 0;
		}

		return next - r;
	});

	const opacity = isLeadingDigit
		? interpolate(
				softProgresses.reduce((a, b) => a + b, 0),
				new Array(digits.length).fill(true).map((_, i) => i),
				digits.map((digit) => (digit === 0 ? 0 : 1)),
			)
		: 1;

	const minusSignOpacity = isLeadingDigit
		? interpolate(
				softProgresses.reduce((a, b) => a + b, 0),
				new Array(digits.length).fill(true).map((_, i) => i),
				isNegative.map((negative) => (negative ? 1 : 0)),
			)
		: 1;

	const minusSignMarginLeft = interpolate(minusSignOpacity, [0, 1], [10, 0]);

	const shiftLeft = isLeadingDigit
		? interpolate(
				softProgresses.reduce((a, b) => a + b, 0),
				new Array(digits.length).fill(true).map((_, i) => i),
				digits.map((digit) => (digit === 0 ? -40 : 0)),
			)
		: 1;

	const rotation =
		progresses
			.map((p, i) => {
				return p * offsets[i];
			})
			.reduce((a, b) => a + b, 0) + rotations[0];

	return (
		<div
			style={{
				position: 'relative',
				width: NUM_WIDTH,
				display: 'inline-block',
				height: 80,
				marginLeft: shiftLeft,
			}}
		>
			{isLeadingDigit ? (
				<Minus
					minusSignOpacity={minusSignOpacity}
					leftOffset={shiftLeft + minusSignMarginLeft}
				/>
			) : null}
			<AbsoluteFill
				style={{
					perspective: 5000,
					maskImage: `linear-gradient(to bottom, transparent 0%, #000 28%, #000 80%, transparent 100%)`,
					WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, #000 28%, #000 80%, transparent 100%)`,
				}}
			>
				{new Array(items).fill(true).map((_, i) => {
					const index = i / items + rotation;

					const z = Math.cos(index * -Math.PI * 2) * 120;
					const y = Math.sin(index * Math.PI * 2) * -120;
					const r = interpolate(index, [0, 1], [0, Math.PI * 2]);

					return (
						<AbsoluteFill
							// eslint-disable-next-line react/no-array-index-key
							key={i}
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
									opacity,
								}}
							>
								<div
									style={{
										lineHeight: 1,
										display: 'inline',
										fontFeatureSettings: "'ss03' on",
									}}
								>
									{renderDigit(i)}
								</div>
							</div>
						</AbsoluteFill>
					);
				})}
			</AbsoluteFill>
		</div>
	);
};
