import {ChunkTimingData} from './types';

export const getFrameRangesFromProfile = (
	profile: ChunkTimingData[]
): [number, number][] => {
	return profile.map((p) => p.frameRange);
};

export const sortProfileByFrameRanges = (profile: ChunkTimingData[]) => {
	return profile.slice().sort((a, b) => a.frameRange[0] - b.frameRange[0]);
};
