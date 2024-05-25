import {
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
}: {
	chunkCount: number;
	renderId: string;
}): CleanupJob[] => {
	const lambdaTimings = new Array(chunkCount)
		.fill(true)
		.map((_x, i) => lambdaTimingsPrefixForChunk(renderId, i));
	return [
		{
			name: lambdaChunkInitializedPrefix(renderId),
			type: 'prefix' as const,
		},
		...lambdaTimings.map((i) => {
			return {
				name: i,
				type: 'prefix' as const,
			};
		}),
	];
};
