import {
	chunkKeyForIndex,
	encodingProgressKey,
	lambdaChunkInitializedPrefix,
	lambdaTimingsPrefixForChunk,
} from '../../shared/constants';

export type CleanupJob = {
	name: string;
	type: 'exact' | 'prefix';
};

export const getFilesToDelete = ({
	chunkCount,
	renderId,
	hasVideo,
	hasAudio,
}: {
	chunkCount: number;
	renderId: string;
	hasVideo: boolean;
	hasAudio: boolean;
}): CleanupJob[] => {
	const videoChunks = hasVideo
		? new Array(chunkCount).fill(true).map((_x, i) =>
				chunkKeyForIndex({
					index: i,
					renderId,
					type: 'video',
				}),
			)
		: [];
	const audioChunks = hasAudio
		? new Array(chunkCount).fill(true).map((_x, i) =>
				chunkKeyForIndex({
					index: i,
					renderId,
					type: 'audio',
				}),
			)
		: [];

	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((_x, i) => lambdaTimingsPrefixForChunk(renderId, i));
	return [
		{
			name: lambdaChunkInitializedPrefix(renderId),
			type: 'prefix' as const,
		},
		...videoChunks.map((i) => {
			return {
				name: i,
				type: 'exact' as const,
			};
		}),
		...audioChunks.map((i) => {
			return {
				name: i,
				type: 'exact' as const,
			};
		}),
		...lambdaTimings.map((i) => {
			return {
				name: i,
				type: 'prefix' as const,
			};
		}),
		{
			name: encodingProgressKey(renderId),
			type: 'exact',
		},
	];
};
