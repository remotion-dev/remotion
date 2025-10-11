import React from 'react';
import {AbsoluteFill, Freeze, useCurrentFrame} from 'remotion';

export type TrailProps = {
	readonly children: React.ReactNode;
	readonly layers: number;
	readonly lagInFrames: number;
	readonly trailOpacity: number;
};

/*
 * @description The <Trail> component duplicates its children and adds a time offset to each layer in order to create a trail effect.
 * @see [Documentation](https://www.remotion.dev/docs/motion-blur/trail)
 */
export const Trail: React.FC<TrailProps> = ({
	children,
	layers,
	lagInFrames,
	trailOpacity,
}: TrailProps) => {
	const frame = useCurrentFrame();

	if (
		typeof layers !== 'number' ||
		Number.isNaN(layers) ||
		!Number.isFinite(layers)
	) {
		throw new TypeError(
			`"layers" must be a number, but got ${JSON.stringify(layers)}`,
		);
	}

	if (layers % 1 !== 0) {
		throw new TypeError(
			`"layers" must be an integer, but got ${JSON.stringify(layers)}`,
		);
	}

	if (layers < 0) {
		throw new TypeError(
			`"layers" must be non-negative, but got ${JSON.stringify(layers)}`,
		);
	}

	if (
		typeof trailOpacity !== 'number' ||
		Number.isNaN(trailOpacity) ||
		!Number.isFinite(trailOpacity)
	) {
		throw new TypeError(
			`"trailOpacity" must be a number, but got ${JSON.stringify(
				trailOpacity,
			)}`,
		);
	}

	if (
		typeof lagInFrames !== 'number' ||
		Number.isNaN(lagInFrames) ||
		!Number.isFinite(lagInFrames)
	) {
		throw new TypeError(
			`"lagInFrames" must be a number, but got ${JSON.stringify(lagInFrames)}`,
		);
	}

	return (
		<AbsoluteFill>
			{new Array(layers).fill(true).map((_, i) => {
				return (
					<AbsoluteFill
						key={`frame-${i.toString()}`}
						style={{
							opacity: trailOpacity - ((layers - i) / layers) * trailOpacity,
						}}
					>
						<Freeze frame={frame - lagInFrames * (layers - i)}>
							{children}
						</Freeze>
					</AbsoluteFill>
				);
			})}
			{children}
		</AbsoluteFill>
	);
};
