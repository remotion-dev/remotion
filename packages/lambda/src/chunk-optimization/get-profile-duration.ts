import {ChunkTimingData} from '../../dist/chunk-optimization/types';

export const getTimingEndTimestamps = (chunk: ChunkTimingData) => {
	const timestamps: number[] = Object.values(chunk.timings).map(
		(timings) => chunk.startDate + timings
	);
	return timestamps;
};

export const getProfileTimestamps = (chunks: ChunkTimingData[]) => {
	return chunks.map((c) => getTimingEndTimestamps(c));
};

export const getProfileDuration = (chunks: ChunkTimingData[]) => {
	const allTimestamps = getProfileTimestamps(chunks).flat(1);

	const smallest = Math.min(...allTimestamps);
	const biggest = Math.max(...allTimestamps);

	return biggest - smallest;
};
