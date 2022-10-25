import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

export type CameraMotionBlurProps = {
	children: React.ReactNode;
	shutterAngle?: number;
	iterations?: number;
};

export const CameraMotionBlur: React.FC<CameraMotionBlurProps> = ({
	children,
	shutterAngle = 180,
	iterations = 10,
}: CameraMotionBlurProps) => {
	const currentFrame = useCurrentFrame();

	if (
		typeof iterations !== 'number' ||
		Number.isNaN(iterations) ||
		!Number.isFinite(iterations)
	) {
		throw new TypeError(
			`"iterations" must be a number, but got ${JSON.stringify(iterations)}`
		);
	}

	if (iterations % 1 !== 0) {
		throw new TypeError(
			`"iterations" must be an integer, but got ${JSON.stringify(iterations)}`
		);
	}

	if (iterations < 0) {
		throw new TypeError(
			`"iterations" must be non-negative, but got ${JSON.stringify(iterations)}`
		);
	}

	if (
		typeof shutterAngle !== 'number' ||
		Number.isNaN(shutterAngle) ||
		!Number.isFinite(shutterAngle)
	) {
		throw new TypeError(
			`"shutterAngle" must be a number, but got ${JSON.stringify(shutterAngle)}`
		);
	}

	if (shutterAngle < 0 || shutterAngle > 360) {
		throw new TypeError(
			`"shutterAngle" must be between 0 and 360, but got ${JSON.stringify(
				shutterAngle
			)}`
		);
	}

	const shutterFraction = shutterAngle / 360;

	return (
		<AbsoluteFill style={{isolation: 'isolate'}}>
			{new Array(iterations).fill(true).map((_, i) => {
				const iteration = i + 1;
				const iterationFrameOffset = shutterFraction * (iteration / iterations);
				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{
							// @ts-ignore 'plus-lighter' is assignable, google "MDN plus-lighter"
							mixBlendMode: 'plus-lighter',
							opacity: 1 / iterations,
						}}
					>
						<Freeze frame={currentFrame - iterationFrameOffset}>
							{children}
						</Freeze>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
