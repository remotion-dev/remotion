import {RenderInternals} from '@remotion/renderer';
import type {TimingProfile} from './types';

export const isValidOptimizationProfile = (profile: TimingProfile) => {
	return profile.every((timing) => {
		const frames = RenderInternals.getFramesToRender(timing.frameRange, 1);
		const values = Object.values(timing.timings);
		return frames.length === values.length && values.every((v) => v > 0);
	});
};
