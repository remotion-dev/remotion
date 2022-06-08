import {RenderInternals} from '@remotion/renderer';
import {TimingProfile} from './types';

export const isValidOptimizationProfile = (profile: TimingProfile) => {
	return profile.every((timing) => {
		const frames = RenderInternals.getDurationFromFrameRange(
			timing.frameRange,
			0,
			0
		);
		const values = Object.values(timing.timings);
		return frames === values.length && values.every((v) => v > 0);
	});
};
