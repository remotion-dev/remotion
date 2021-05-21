import {getFrameRangesFromProfile} from './get-frame-ranges-from-profile';
import {simulateFrameRanges} from './simulate-frame-ranges';
import {sortProfileByDuration} from './sort-by-duration';
import {TimingProfile} from './types';

export const assignFrameToOther = ({
	frameRanges,
	fromChunk,
	toChunk,
	framesToShift,
}: {
	frameRanges: [number, number][];
	fromChunk: number;
	toChunk: number;
	framesToShift: number;
}): [number, number][] => {
	if (fromChunk < toChunk) {
		return frameRanges.map((frameRange, i) => {
			if (i === fromChunk) {
				return [frameRange[0], frameRange[1] - framesToShift];
			}

			if (i === toChunk) {
				return [frameRange[0] - framesToShift, frameRange[1]];
			}

			if (i > fromChunk && i < toChunk) {
				return [frameRange[0] - framesToShift, frameRange[1] - framesToShift];
			}

			return frameRange;
		});
	}

	return frameRanges.map((frameRange, i) => {
		if (i === fromChunk) {
			return [frameRange[0] + framesToShift, frameRange[1]];
		}

		if (i === toChunk) {
			return [frameRange[0], frameRange[1] + framesToShift];
		}

		if (i > toChunk && i < fromChunk) {
			return [frameRange[0] + framesToShift, frameRange[1] + framesToShift];
		}

		return frameRange;
	});
};

export const optimizeProfile = (profile: TimingProfile) => {
	const sortedByDuration = sortProfileByDuration(profile);

	const indexOfFastest = profile.indexOf(sortedByDuration[0]);
	if (indexOfFastest === -1) {
		throw new Error('something went wrong');
	}

	const slowest = sortedByDuration[sortedByDuration.length - 1];
	const indexOfSlowest = profile.indexOf(slowest);
	if (indexOfSlowest === -1) {
		throw new Error('something went wrong');
	}

	const frameRanges = getFrameRangesFromProfile(profile);
	const newFrameRanges = assignFrameToOther({
		frameRanges,
		fromChunk: indexOfSlowest,
		toChunk: indexOfFastest,
		framesToShift: Math.max(
			1,
			Math.min(2, Math.floor(slowest.timings.length / 3))
		),
	});
	const simulated = simulateFrameRanges({
		profile,
		newFrameRanges,
	});
	return simulated;
};

export const optimizeProfileRecursively = (profile: TimingProfile) => {
	let optimized = profile;
	for (let i = 0; i < 400; i++) {
		optimized = optimizeProfile(optimized);
	}

	return optimized;
};
