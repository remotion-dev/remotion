import {spring} from 'remotion';
import type {DraggedConfig} from './types';

export const getTrajectory = (
	durationInFrames: number,
	fps: number,
	{reverse, ...config}: DraggedConfig,
) => {
	return new Array(durationInFrames).fill(true).map((_, i) => {
		return spring({
			fps,
			frame: i,
			config,
			reverse,
			durationInFrames: config.durationInFrames ?? undefined,
			delay: config.delay ?? undefined,
		});
	});
};
