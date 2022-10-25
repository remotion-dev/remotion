import React from 'react';
import {Trail} from './Trail';

export type MotionBlurProps = {
	children: React.ReactNode;
	layers: number;
	lagInFrames: number;
	blurOpacity: number;
};

export const MotionBlur: React.FC<MotionBlurProps> = ({
	blurOpacity,
	...rest
}: MotionBlurProps) => {
	if (
		typeof blurOpacity !== 'number' ||
		Number.isNaN(blurOpacity) ||
		!Number.isFinite(blurOpacity)
	) {
		throw new TypeError(
			`"blurOpacity" must be a number, but got ${JSON.stringify(blurOpacity)}`
		);
	}

	return <Trail {...rest} trailOpacity={blurOpacity} />;
};
