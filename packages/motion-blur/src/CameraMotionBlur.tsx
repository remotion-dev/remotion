import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

export type CameraMotionBlurProps = {
	readonly children: React.ReactNode;
	readonly shutterAngle?: number;
	readonly samples?: number;
};

/**
 * If the current frame is 0, then it is rendered with low opacity,
 * and the trailing elements have frame numbers -1, -2, -3, -4, etc.
 * To fix this, we instead reduce the number of samples to not go into negative territory.
 */
const getNumberOfSamples = ({
	shutterFraction,
	samples,
	currentFrame,
}: {
	shutterFraction: number;
	samples: number;
	currentFrame: number;
}) => {
	const maxOffset = shutterFraction * samples;
	const maxTimeReverse = currentFrame - maxOffset;
	const factor = Math.min(1, Math.max(0, maxTimeReverse / maxOffset + 1));
	return Math.max(1, Math.round(Math.min(factor * samples, samples)));
};

/*
 * @description Produces natural looking motion blur similar to what would be produced by a film camera.
 * @see [Documentation](https://www.remotion.dev/docs/motion-blur/camera-motion-blur)
 */
export const CameraMotionBlur: React.FC<CameraMotionBlurProps> = ({
	children,
	shutterAngle = 180,
	samples = 10,
}: CameraMotionBlurProps) => {
	const currentFrame = useCurrentFrame();

	if (
		typeof samples !== 'number' ||
		Number.isNaN(samples) ||
		!Number.isFinite(samples)
	) {
		throw new TypeError(
			`"samples" must be a number, but got ${JSON.stringify(samples)}`,
		);
	}

	if (samples % 1 !== 0) {
		throw new TypeError(
			`"samples" must be an integer, but got ${JSON.stringify(samples)}`,
		);
	}

	if (samples < 0) {
		throw new TypeError(
			`"samples" must be non-negative, but got ${JSON.stringify(samples)}`,
		);
	}

	if (
		typeof shutterAngle !== 'number' ||
		Number.isNaN(shutterAngle) ||
		!Number.isFinite(shutterAngle)
	) {
		throw new TypeError(
			`"shutterAngle" must be a number, but got ${JSON.stringify(
				shutterAngle,
			)}`,
		);
	}

	if (shutterAngle < 0 || shutterAngle > 360) {
		throw new TypeError(
			`"shutterAngle" must be between 0 and 360, but got ${JSON.stringify(
				shutterAngle,
			)}`,
		);
	}

	const shutterFraction = shutterAngle / 360;

	const actualSamples = getNumberOfSamples({
		currentFrame,
		samples,
		shutterFraction,
	});

	return (
		<AbsoluteFill style={{isolation: 'isolate'}}>
			{new Array(actualSamples).fill(true).map((_, i) => {
				const sample = i + 1;
				const sampleFrameOffset = shutterFraction * (sample / actualSamples);

				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{
							mixBlendMode: 'plus-lighter',
							filter: `opacity(${1 / actualSamples})`,
						}}
					>
						<Freeze frame={currentFrame - sampleFrameOffset + 1}>
							{children}
						</Freeze>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
