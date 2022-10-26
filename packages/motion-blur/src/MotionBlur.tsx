import React from 'react';
import type {TrailProps} from './Trail';
import {Trail} from './Trail';

export type MotionBlurProps = Omit<TrailProps, 'trailOpacity'> & {
	blurOpacity: number;
};

/**
 * @deprecated The component has been renamed "Trail" instead: https://remotion.dev/docs/motion-blur/trail
 */
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
