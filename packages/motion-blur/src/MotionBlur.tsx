import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

export type MotionBlurProps = {
	children: React.ReactNode;
	layers: number;
	lagInFrames: number;
	blurOpacity: number;
};

export const MotionBlur: React.FC<MotionBlurProps> = ({
	children,
	layers,
	lagInFrames,
	blurOpacity,
}: MotionBlurProps) => {
	const frame = useCurrentFrame();

	if (
		typeof layers !== 'number' ||
		Number.isNaN(layers) ||
		!Number.isFinite(layers)
	) {
		throw new TypeError(
			`"layers" must be a number, but got ${JSON.stringify(layers)}`
		);
	}

	if (layers % 1 !== 0) {
		throw new TypeError(
			`"layers" must be an integer, but got ${JSON.stringify(layers)}`
		);
	}

	if (layers < 0) {
		throw new TypeError(
			`"layers" must be non-negative, but got ${JSON.stringify(layers)}`
		);
	}

	if (
		typeof blurOpacity !== 'number' ||
		Number.isNaN(blurOpacity) ||
		!Number.isFinite(blurOpacity)
	) {
		throw new TypeError(
			`"blurOpacity" must be a number, but got ${JSON.stringify(blurOpacity)}`
		);
	}

	if (
		typeof lagInFrames !== 'number' ||
		Number.isNaN(lagInFrames) ||
		!Number.isFinite(lagInFrames)
	) {
		throw new TypeError(
			`"lagInFrames" must be a number, but got ${JSON.stringify(lagInFrames)}`
		);
	}

	return (
		<AbsoluteFill>
			{new Array(layers).fill(true).map((_, i) => {
				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{
							opacity: blurOpacity - ((i + 1) / layers) * blurOpacity,
						}}
					>
						<Freeze frame={frame - lagInFrames * i}>{children}</Freeze>
					</AbsoluteFill>
				);
			})}
			{children}
		</AbsoluteFill>
	);
};
