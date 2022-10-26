import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

export type CameraMotionBlurProps = {
	children: React.ReactNode;
	shutterAngle?: number;
	samples?: number;
};

export const CameraMotionBlur: React.FC<CameraMotionBlurProps> = ({
	children,
	shutterAngle = 180,
	samples = 50,
}: CameraMotionBlurProps) => {
	const currentFrame = useCurrentFrame();

	if (
		typeof samples !== 'number' ||
		Number.isNaN(samples) ||
		!Number.isFinite(samples)
	) {
		throw new TypeError(
			`"samples" must be a number, but got ${JSON.stringify(samples)}`
		);
	}

	if (samples % 1 !== 0) {
		throw new TypeError(
			`"samples" must be an integer, but got ${JSON.stringify(samples)}`
		);
	}

	if (samples < 0) {
		throw new TypeError(
			`"samples" must be non-negative, but got ${JSON.stringify(samples)}`
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
			{new Array(samples).fill(true).map((_, i) => {
				const sample = i + 1;
				const sampleFrameOffset = shutterFraction * (sample / samples);
				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{
							mixBlendMode: 'plus-lighter',
							filter: `opacity(${1 / samples})`,
						}}
					>
						<Freeze frame={currentFrame - sampleFrameOffset}>{children}</Freeze>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};
