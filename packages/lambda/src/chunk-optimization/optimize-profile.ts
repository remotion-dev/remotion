import {getFrameRangesFromProfile} from './get-frame-ranges-from-profile';
import {getTimingEndTimestamps} from './get-profile-duration';
import {simulateFrameRanges} from './simulate-frame-ranges';
import {ChunkTimingData} from './types';

export const assignFrameToOther = ({
	frameRanges,
	fromChunk,
	toChunk,
}: {
	frameRanges: [number, number][];
	fromChunk: number;
	toChunk: number;
}): [number, number][] => {
	if (fromChunk < toChunk) {
		return frameRanges.map((frameRange, i) => {
			if (i === fromChunk) {
				return [frameRange[0], frameRange[1] - 1];
			}

			if (i === toChunk) {
				return [frameRange[0] - 1, frameRange[1]];
			}

			if (i > fromChunk && i < toChunk) {
				return [frameRange[0] - 1, frameRange[1] - 1];
			}

			return frameRange;
		});
	}

	return frameRanges.map((frameRange, i) => {
		if (i === fromChunk) {
			return [frameRange[0] + 1, frameRange[1]];
		}

		if (i === toChunk) {
			return [frameRange[0], frameRange[1] + 1];
		}

		if (i > toChunk && i < fromChunk) {
			return [frameRange[0] + 1, frameRange[1] + 1];
		}

		return frameRange;
	});
};

export const optimizeProfile = (profile: ChunkTimingData[]) => {
	const sortedByDuration = profile.slice().sort((a, b) => {
		const aTimestamps = getTimingEndTimestamps(a);
		const bTimestamps = getTimingEndTimestamps(b);

		const aDuration = Math.max(...aTimestamps) - Math.min(...aTimestamps);
		const bDuration = Math.max(...bTimestamps) - Math.min(...bTimestamps);

		return aDuration - bDuration;
	});
	const indexOfFastest = profile.indexOf(sortedByDuration[0]);
	if (indexOfFastest === -1) {
		throw new Error('something went wrong');
	}

	const indexOfSlowest = profile.indexOf(
		sortedByDuration[sortedByDuration.length - 1]
	);
	if (indexOfSlowest === -1) {
		throw new Error('something went wrong');
	}

	const frameRanges = getFrameRangesFromProfile(profile);
	const newFrameRanges = assignFrameToOther({
		frameRanges,
		fromChunk: indexOfSlowest,
		toChunk: indexOfFastest,
	});
	return simulateFrameRanges({
		profile,
		newFrameRanges,
	});
};
